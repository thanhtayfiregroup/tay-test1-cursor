import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  Box,
  Button,
  ButtonGroup,
  InlineStack,
  TextField
} from "@shopify/polaris";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";

interface PageData {
  id: string;
  title: string;
  handle: string;
  bodySummary: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

interface LoaderData {
  page: PageData;
}

export const loader = async ({ request, params }: { request: Request; params: { id: string } }) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(
    `#graphql
      query getPage($id: ID!) {
        page(id: $id) {
          id
          title
          handle
          bodySummary
          body
          createdAt
          updatedAt
        }
      }`,
    {
      variables: {
        id: `gid://shopify/Page/${params.id}`,
      },
    }
  );

  const responseJson = await response.json();
  const { page } = responseJson.data;

  if (!page) {
    throw new Response("Page not found", { status: 404 });
  }

  return json<LoaderData>({ page });
};

export default function PageDetail() {
  const { page } = useLoaderData<LoaderData>();
  const previewUrl = `/pages/${page.handle}`;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Page
      backAction={{ content: "Pages", url: "/app/pages" }}
      title={page.title}
      primaryAction={
        <ButtonGroup>
          <Button variant="primary">Edit page</Button>
          <Button external url={previewUrl}>View page</Button>
        </ButtonGroup>
      }
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <Card>
              <BlockStack gap="400">
                <Box padding="400">
                  <BlockStack gap="400">
                    <Text variant="headingMd" as="h2">Page details</Text>
                    <BlockStack gap="300">
                      <InlineStack align="space-between">
                        <Text variant="bodyMd" as="span">Handle</Text>
                        <Text variant="bodyMd" as="span">{page.handle}</Text>
                      </InlineStack>
                      <InlineStack align="space-between">
                        <Text variant="bodyMd" as="span">Created</Text>
                        <Text variant="bodyMd" as="span">{formatDate(page.createdAt)}</Text>
                      </InlineStack>
                      <InlineStack align="space-between">
                        <Text variant="bodyMd" as="span">Last modified</Text>
                        <Text variant="bodyMd" as="span">{formatDate(page.updatedAt)}</Text>
                      </InlineStack>
                    </BlockStack>
                  </BlockStack>
                </Box>
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="400">
                <Box padding="400">
                  <BlockStack gap="400">
                    <Text variant="headingMd" as="h2">Content</Text>
                    <TextField
                      label="Page content"
                      value={page.body}
                      multiline={6}
                      autoComplete="off"
                      readOnly
                    />
                  </BlockStack>
                </Box>
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="400">
                <Box padding="400">
                  <BlockStack gap="400">
                    <Text variant="headingMd" as="h2">Summary</Text>
                    <TextField
                      label="Page summary"
                      value={page.bodySummary}
                      multiline={3}
                      autoComplete="off"
                      readOnly
                    />
                  </BlockStack>
                </Box>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <div style={{ color: 'red' }}>Error: {error.message}</div>;
} 