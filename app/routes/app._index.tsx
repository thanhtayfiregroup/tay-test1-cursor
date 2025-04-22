import { useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
  Grid,
  ButtonGroup,
  Divider,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { ChevronLeftIcon, ChevronRightIcon } from '@shopify/polaris-icons';
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};



export default function Index() {
  return (
    <Page>
      <TitleBar title="Dashboard" />
      <BlockStack gap="500">
        <Layout>
          {/* Setup Guide Section */}
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Setup Guide
                  </Text>
                  <Text variant="bodyMd" as="p">
                    Follow these steps to set up your app properly
                  </Text>
                </BlockStack>
                <BlockStack gap="200">
                  <List type="number">
                    <List.Item>
                      <InlineStack gap="200" align="start">
                        <Text as="span" variant="bodyMd" fontWeight="bold">
                          Install the app
                        </Text>
                        <Text as="span" variant="bodyMd">
                          Install our app from the Shopify App Store and approve the necessary permissions
                        </Text>
                      </InlineStack>
                    </List.Item>
                    <List.Item>
                      <InlineStack gap="200" align="start">
                        <Text as="span" variant="bodyMd" fontWeight="bold">
                          Configure your settings
                        </Text>
                        <Text as="span" variant="bodyMd">
                          Go to Settings page and customize the app according to your needs
                        </Text>
                      </InlineStack>
                    </List.Item>
                    <List.Item>
                      <InlineStack gap="200" align="start">
                        <Text as="span" variant="bodyMd" fontWeight="bold">
                          Test the functionality
                        </Text>
                        <Text as="span" variant="bodyMd">
                          Try out the main features to ensure everything works as expected
                        </Text>
                      </InlineStack>
                    </List.Item>
                  </List>
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>

          {/* What's New Section */}
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <BlockStack gap="200">
                  <InlineStack align="space-between">
                    <BlockStack gap="200">
                      <Text as="h2" variant="headingMd">
                        What's new
                      </Text>
                      <Text variant="bodyMd" as="p" tone="subdued">
                        Keep you updated on new features information.
                      </Text>
                    </BlockStack>
                    <ButtonGroup>
                      <Button icon={ChevronLeftIcon} disabled />
                      <Button icon={ChevronRightIcon} />
                    </ButtonGroup>
                  </InlineStack>
                </BlockStack>
                <Grid>
                  {/* Import Reviews Card */}
                  <Grid.Cell columnSpan={{xs: 6, sm: 4, md: 4, lg: 4}}>
                    <Card>
                      <BlockStack gap="400">
                        <img 
                          src="/images/import-reviews.png" 
                          alt="Import reviews from everywhere"
                          style={{width: '100%', height: 'auto', borderRadius: '8px'}}
                        />
                        <BlockStack gap="200">
                          <Text as="h3" variant="headingMd">
                            Import reviews from everywhere
                          </Text>
                          <Text as="p" variant="bodyMd">
                            Amazon, eBay, AliExpress, Temu, Etsy, and more. Now you can effortlessly get high-quality reviews from any website. More social proof. More sales.
                          </Text>
                        </BlockStack>
                        <InlineStack align="space-between">
                          <Button variant="primary">Try it now</Button>
                          <Text as="span" variant="bodyMd" tone="subdued">April 03, 2025</Text>
                        </InlineStack>
                      </BlockStack>
                    </Card>
                  </Grid.Cell>

                  {/* Widget Customization Card */}
                  <Grid.Cell columnSpan={{xs: 6, sm: 4, md: 4, lg: 4}}>
                    <Card>
                      <BlockStack gap="400">
                        <img 
                          src="/images/widget-customization.png" 
                          alt="Smarter review widget customization"
                          style={{width: '100%', height: 'auto', borderRadius: '8px'}}
                        />
                        <BlockStack gap="200">
                          <Text as="h3" variant="headingMd">
                            Smarter review widget customization
                          </Text>
                          <Text as="p" variant="bodyMd">
                            Click directly on any part of the sample widget to instantly find and edit that design element. Faster styling, easier control—with zero guesswork.
                          </Text>
                        </BlockStack>
                        <InlineStack align="space-between">
                          <Button variant="primary">Try it now</Button>
                          <Text as="span" variant="bodyMd" tone="subdued">Mar 31, 2025</Text>
                        </InlineStack>
                      </BlockStack>
                    </Card>
                  </Grid.Cell>

                  {/* Global Settings Card */}
                  <Grid.Cell columnSpan={{xs: 6, sm: 4, md: 4, lg: 4}}>
                    <Card>
                      <BlockStack gap="400">
                        <img 
                          src="/images/global-settings.png" 
                          alt="Global settings for all reviews"
                          style={{width: '100%', height: 'auto', borderRadius: '8px'}}
                        />
                        <BlockStack gap="200">
                          <Text as="h3" variant="headingMd">
                            Global settings for all reviews
                          </Text>
                          <Text as="p" variant="bodyMd">
                            Set it once, sync it everywhere. Control font, size, color, branding style, and more across all your widgets. Save time and keep your store consistent.
                          </Text>
                        </BlockStack>
                        <InlineStack align="space-between">
                          <Button variant="primary">Try it now</Button>
                          <Text as="span" variant="bodyMd" tone="subdued">Mar 30, 2025</Text>
                        </InlineStack>
                      </BlockStack>
                    </Card>
                  </Grid.Cell>
                </Grid>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
