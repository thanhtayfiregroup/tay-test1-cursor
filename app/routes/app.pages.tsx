import { useEffect, useState } from "react";
import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate, useSearchParams } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Button,
  Text,
  TextField,
  IndexTable,
  useIndexResourceState,
  Pagination,
  EmptySearchResult,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import type { IndexTableProps } from "@shopify/polaris";

interface StorePage {
  id: string;
  title: string;
  handle: string;
  bodySummary: string;
  createdAt: string;
  updatedAt: string;
}

interface PagesData {
  pages: {
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string;
      endCursor: string;
    };
    nodes: StorePage[];
  };
  searchTerm: string;
  currentPage: number;
  endCursor: string | null;
  startCursor: string | null;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  
  const url = new URL(request.url);
  const searchTerm = url.searchParams.get("q") || "";
  const cursor = url.searchParams.get("cursor");
  const direction = url.searchParams.get("direction") || "next";
  const currentPage = parseInt(url.searchParams.get("page") || "1");
  const limit = 10;

  let queryVariables: {
    first?: number;
    after?: string | null;
    before?: string | null;
    last?: number;
  } = {
    first: limit,
    after: null,
    before: null,
  };

  if (cursor) {
    if (direction === "next") {
      queryVariables = {
        ...queryVariables,
        first: limit,
        after: cursor,
        before: undefined,
        last: undefined,
      };
    } else {
      queryVariables = {
        ...queryVariables,
        first: undefined,
        after: undefined,
        before: cursor,
        last: limit,
      };
    }
  }

  const response = await admin.graphql(
    `#graphql
      query getPages($first: Int, $last: Int, $after: String, $before: String) {
        pages(
          first: $first,
          last: $last,
          after: $after,
          before: $before
        ) {
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
          nodes {
            id
            title
            handle
            bodySummary
            createdAt
            updatedAt
          }
        }
      }`,
    {
      variables: queryVariables,
    }
  );

  const responseJson = await response.json();

  const pages = responseJson.data?.pages || { 
    nodes: [], 
    pageInfo: { 
      hasNextPage: false, 
      hasPreviousPage: false, 
      startCursor: null, 
      endCursor: null 
    } 
  };
  
  return json({
    pages,
    searchTerm,
    currentPage,
    endCursor: pages.pageInfo?.endCursor || null,
    startCursor: pages.pageInfo?.startCursor || null,
  });
};

export default function Pages() {
  const { pages, searchTerm, currentPage, endCursor, startCursor } = useLoaderData<PagesData>();
  const [searchValue, setSearchValue] = useState(searchTerm || "");
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const resourceName = {
    singular: "page",
    plural: "pages",
  };

  const allNodes = pages?.nodes || [];
  const nodes = allNodes.filter(node => 
    searchValue === "" || 
    node.title.toLowerCase().includes(searchValue.toLowerCase()) ||
    node.handle.toLowerCase().includes(searchValue.toLowerCase()) ||
    node.bodySummary?.toLowerCase().includes(searchValue.toLowerCase())
  );

  const {
    selectedResources,
    allResourcesSelected,
    handleSelectionChange,
  } = useIndexResourceState(nodes);

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const rowMarkup = nodes.map(
    (
      {
        id,
        title,
        handle,
        bodySummary,
        createdAt,
        updatedAt,
      }: StorePage,
      index: number,
    ) => (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={index}
      >
        <IndexTable.Cell>
          <Text variant="bodyMd" fontWeight="bold" as="span">
            {title}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text variant="bodyMd" as="span">
            {truncateText(bodySummary || "", 100)}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text variant="bodyMd" as="span">
            {handle}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Button
            variant="plain"
            external
            url={`/pages/${handle}`}
          >
            View page
          </Button>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text variant="bodyMd" as="span">
            Created: {formatDate(createdAt)}
            <br />
            Updated: {formatDate(updatedAt)}
          </Text>
        </IndexTable.Cell>
      </IndexTable.Row>
    ),
  );

  const handlePagination = (direction: "previous" | "next") => {
    const cursor = direction === "next" ? endCursor : startCursor;
    setSearchParams(prev => {
      prev.set("cursor", cursor || "");
      prev.set("direction", direction);
      prev.set("page", String(direction === "next" ? currentPage + 1 : currentPage - 1));
      return prev;
    });
  };

  const headings: IndexTableProps["headings"] = [
    { title: "Title" },
    { title: "Summary" },
    { title: "Handle" },
    { title: "Preview" },
    { title: "Dates" },
  ];

  return (
    <Page title="Pages">
      <Layout>
        <Layout.Section>
          <Card>
            <div style={{ padding: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ flex: 1 }}>
                <TextField
                  label="Search"
                  labelHidden
                  value={searchValue}
                  onChange={setSearchValue}
                  placeholder="Search pages..."
                  autoComplete="off"
                />
              </div>
            </div>
            
            {nodes.length === 0 ? (
              <EmptySearchResult
                title="No pages found"
                description="Try changing the search term."
              />
            ) : (
              <>
                <IndexTable
                  resourceName={resourceName}
                  itemCount={nodes.length}
                  selectedItemsCount={allResourcesSelected ? "All" : selectedResources.length}
                  onSelectionChange={handleSelectionChange}
                  headings={headings}
                >
                  {rowMarkup}
                </IndexTable>

                <div style={{ padding: "16px", display: "flex", justifyContent: "flex-start" }}>
                  <Pagination
                    hasPrevious={pages.pageInfo.hasPreviousPage}
                    hasNext={pages.pageInfo.hasNextPage}
                    onPrevious={() => handlePagination("previous")}
                    onNext={() => handlePagination("next")}
                  />
                </div>
              </>
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 