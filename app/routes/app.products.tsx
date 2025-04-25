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
  IndexFilters,
  useSetIndexFiltersMode,
  ChoiceList,
  RangeSlider,
  Badge,
  EmptySearchResult,
  LegacyCard,
  Thumbnail,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";

interface Product {
  id: string;
  title: string;
  status: string;
  totalInventory: number;
  createdAt: string;
  updatedAt: string;
  priceRangeV2: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  featuredImage: {
    url: string;
  } | null;
}

interface ProductsData {
  products: {
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string;
      endCursor: string;
    };
    nodes: Product[];
  };
  searchTerm: string;
  currentPage: number;
  endCursor: string | null;
  startCursor: string | null;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  
  // Get search params
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

  // Construct GraphQL query
  const response = await admin.graphql(
    `#graphql
      query getProducts($query: String!, $first: Int, $last: Int, $after: String, $before: String) {
        products(
          first: $first,
          last: $last,
          after: $after,
          before: $before,
          query: $query
          sortKey: TITLE
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
            status
            totalInventory
            createdAt
            updatedAt
            featuredImage {
              url
            }
            priceRangeV2 {
              minVariantPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }`,
    {
      variables: queryVariables,
    }
  );

  const responseJson = await response.json();
  
  return json({
    products: responseJson.data.products,
    searchTerm,
    currentPage,
    endCursor: responseJson.data.products.pageInfo.endCursor,
    startCursor: responseJson.data.products.pageInfo.startCursor,
  });
};

export default function Products() {
  const { products, searchTerm, currentPage, endCursor, startCursor } = useLoaderData<ProductsData>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState(searchTerm || "");

  const resourceName = {
    singular: "product",
    plural: "products",
  };

  const {
    selectedResources,
    allResourcesSelected,
    handleSelectionChange,
  } = useIndexResourceState(products.nodes);

  const rowMarkup = products.nodes.map(
    (
      {
        id,
        title,
        status,
        totalInventory,
        createdAt,
        priceRangeV2,
        featuredImage,
      }: Product,
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
              source={featuredImage?.url || "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png"}
              alt={title}
              size="small"
            />
            <Text variant="bodyMd" fontWeight="bold" as="span">
              {title}
            </Text>
          </div>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Badge tone={status === "ACTIVE" ? "success" : "critical"}>
            {status.toLowerCase()}
          </Badge>
        </IndexTable.Cell>
        <IndexTable.Cell>
          {priceRangeV2.minVariantPrice.amount} {priceRangeV2.minVariantPrice.currencyCode}
        </IndexTable.Cell>
        <IndexTable.Cell>{totalInventory}</IndexTable.Cell>
        <IndexTable.Cell>
          {new Date(createdAt).toLocaleDateString()}
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
    <Page
      title="Products"
    >
      <Layout>
        <Layout.Section>
          <Card>
            <div style={{ padding: "16px" }}>
              <div style={{ marginBottom: "16px" }}>
                <TextField
                  label="Search products"
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
                itemCount={products.nodes.length}
                selectedItemsCount={
                  allResourcesSelected ? "All" : selectedResources.length
                }
                onSelectionChange={handleSelectionChange}
                headings={[
                  { title: "Title" },
                  { title: "Status" },
                  { title: "Price" },
                  { title: "Inventory" },
                  { title: "Date created" },
                ]}
              >
                {rowMarkup}
              </IndexTable>

              {products.nodes.length > 0 && (
                <div style={{ marginTop: "16px" }}>
                  <Pagination
                    hasPrevious={products.pageInfo.hasPreviousPage}
                    onPrevious={() => handlePagination("previous")}
                    hasNext={products.pageInfo.hasNextPage}
                    onNext={() => handlePagination("next")}
                  />
                </div>
              )}

              {products.nodes.length === 0 && (
                <EmptySearchResult
                  title="No products found"
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