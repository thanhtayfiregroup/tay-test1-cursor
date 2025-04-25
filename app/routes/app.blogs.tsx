import { useEffect, useState } from "react";
import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate, useSearchParams } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Button,
  ButtonGroup,
  Text,
  TextField,
  IndexTable,
  useIndexResourceState,
  Pagination,
  EmptySearchResult,
  Thumbnail,
  Badge,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";

interface Article {
  id: string;
  title: string;
  handle: string;
  publishedAt: string;
  image: {
    url: string;
  } | null;
  blog: {
    title: string;
  };
}

interface BlogsData {
  articles: {
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string;
      endCursor: string;
    };
    nodes: Article[];
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
    query: string;
    first?: number;
    after?: string | null;
    before?: string | null;
    last?: number;
  } = {
    query: searchTerm ? `title:*${searchTerm}*` : "",
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
      query getArticles($query: String!, $first: Int, $last: Int, $after: String, $before: String) {
        articles(
          first: $first,
          last: $last,
          after: $after,
          before: $before,
          query: $query,
          sortKey: UPDATED_AT,
          reverse: true
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
            publishedAt
            image {
              url
            }
            blog {
              title
            }
          }
        }
      }`,
    {
      variables: queryVariables,
    }
  );

  const responseJson = await response.json();

  // Add error handling and default values
  const articles = responseJson.data?.articles || { nodes: [], pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null } };
  
  return json({
    articles,
    searchTerm,
    currentPage,
    endCursor: articles.pageInfo?.endCursor || null,
    startCursor: articles.pageInfo?.startCursor || null,
  });
};

export default function Blogs() {
  const { articles, searchTerm, currentPage, endCursor, startCursor } = useLoaderData<BlogsData>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState(searchTerm || "");

  const resourceName = {
    singular: "article",
    plural: "articles",
  };

  // Add null check for articles.nodes
  const nodes = articles?.nodes || [];

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

  const rowMarkup = nodes.map(
    (
      {
        id,
        title,
        handle,
        publishedAt,
        image,
        blog,
      }: Article,
      index: number,
    ) => (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={index}
      >
        <IndexTable.Cell>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Thumbnail
              source={image?.url || "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image-1_large.png"}
              alt={title}
              size="small"
            />
            <Text variant="bodyMd" fontWeight="bold" as="span">
              {title}
            </Text>
          </div>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text variant="bodyMd" as="span">
            {handle}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text variant="bodyMd" as="span">
            {blog?.title || ""}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          {publishedAt ? new Date(publishedAt).toLocaleDateString() : ""}
        </IndexTable.Cell>
      </IndexTable.Row>
    ),
  );

  const handleSearch = () => {
    setSearchParams(prev => {
      prev.set("q", searchValue);
      prev.delete("cursor");
      prev.delete("direction");
      prev.set("page", "1");
      return prev;
    });
  };

  const handlePagination = (direction: "previous" | "next") => {
    setSearchParams(prev => {
      if (direction === "next" && endCursor) {
        prev.set("cursor", endCursor);
      } else if (direction === "previous" && startCursor) {
        prev.set("cursor", startCursor);
      }
      prev.set("direction", direction);
      prev.set("page", (direction === "next" ? currentPage + 1 : currentPage - 1).toString());
      return prev;
    });
  };

  return (
    <Page title="Blogs">
      <Layout>
        <Layout.Section>
          <Card>
            <div style={{ padding: "16px" }}>
              <div style={{ marginBottom: "16px" }}>
                <TextField
                  label="Search articles"
                  value={searchValue}
                  onChange={setSearchValue}
                  autoComplete="off"
                  placeholder="Search by title..."
                  onClearButtonClick={() => setSearchValue("")}
                  clearButton
                />
                <div style={{ marginTop: "8px" }}>
                  <ButtonGroup>
                    <Button onClick={handleSearch}>Search</Button>
                    {searchValue && (
                      <Button
                        variant="plain"
                        onClick={() => {
                          setSearchValue("");
                          setSearchParams(prev => {
                            prev.delete("q");
                            prev.delete("cursor");
                            prev.delete("direction");
                            prev.set("page", "1");
                            return prev;
                          });
                        }}
                      >
                        Clear
                      </Button>
                    )}
                  </ButtonGroup>
                </div>
              </div>

              <IndexTable
                resourceName={resourceName}
                itemCount={nodes.length}
                selectedItemsCount={
                  allResourcesSelected ? "All" : selectedResources.length
                }
                onSelectionChange={handleSelectionChange}
                headings={[
                  { title: "Title" },
                  { title: "Handle" },
                  { title: "Blog" },
                  { title: "Published Date" },
                ]}
              >
                {rowMarkup}
              </IndexTable>

              {nodes.length > 0 && (
                <div style={{ marginTop: "16px" }}>
                  <Pagination
                    hasPrevious={articles.pageInfo.hasPreviousPage}
                    onPrevious={() => handlePagination("previous")}
                    hasNext={articles.pageInfo.hasNextPage}
                    onNext={() => handlePagination("next")}
                  />
                </div>
              )}

              {nodes.length === 0 && (
                <EmptySearchResult
                  title="No articles found"
                  description="Try changing the filters or search term"
                  withIllustration
                />
              )}
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 