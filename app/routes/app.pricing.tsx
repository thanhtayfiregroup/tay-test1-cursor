import { Page, Layout, Card, Text, List, Button, BlockStack, Grid, Badge, Box } from "@shopify/polaris";

export default function Pricing() {
  return (
    <Page title="Pricing">
      <Layout>
        <Layout.Section>
          <Grid>
            {/* Free Plan */}
            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6 }}>
              <Card>
                <BlockStack gap="300" align="center">
                  <Box padding="200">
                    <img src="https://cdn-icons-png.flaticon.com/512/1828/1828884.png" alt="Free" style={{ width: 48, height: 48 }} />
                  </Box>
                  <div style={{ minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Text as="h2" variant="headingMd"><span style={{fontSize: '2rem'}}>Free</span></Text>
                  </div>
                  <div style={{ minHeight: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Text as="p" variant="bodyMd" fontWeight="bold"><span style={{fontSize: '1.5rem'}}>$0<span style={{fontWeight: 400}}>/month</span></span></Text>
                  </div>
                  <div style={{ minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Text as="p" variant="bodySm" tone="subdued" alignment="center"><span style={{fontSize: '1.1rem'}}>Basic features for getting started.</span></Text>
                  </div>
                  <div style={{ minHeight: 100 }}>
                    <List>
                      <List.Item><span style={{fontSize: '1.1rem'}}>Up to 100 files</span></List.Item>
                      <List.Item><span style={{fontSize: '1.1rem'}}>1GB storage</span></List.Item>
                      <List.Item><span style={{fontSize: '1.1rem'}}>Email support</span></List.Item>
                    </List>
                  </div>
                  <Button variant="primary" size="large"><span style={{fontSize: '1rem'}}>Choose Free</span></Button>
                </BlockStack>
              </Card>
            </Grid.Cell>
            {/* Essential Plan */}
            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6 }}>
              <Card>
                <BlockStack gap="300" align="center">
                  <Box padding="200">
                    <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Essential" style={{ width: 48, height: 48 }} />
                  </Box>
                  <div style={{ minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Text as="h2" variant="headingMd"><span style={{fontSize: '2rem'}}>Essential</span></Text>
                  </div>
                  <div style={{ minHeight: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Text as="p" variant="bodyMd" fontWeight="bold"><span style={{fontSize: '1.5rem'}}>$19<span style={{fontWeight: 400}}>/month</span></span></Text>
                  </div>
                  <div style={{ minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Text as="p" variant="bodySm" tone="subdued" alignment="center"><span style={{fontSize: '1.1rem'}}>Advanced features for growing businesses.</span></Text>
                  </div>
                  <div style={{ minHeight: 100 }}>
                    <List>
                      <List.Item><span style={{fontSize: '1.1rem'}}>Unlimited files</span></List.Item>
                      <List.Item><span style={{fontSize: '1.1rem'}}>100GB storage</span></List.Item>
                      <List.Item><span style={{fontSize: '1.1rem'}}>Priority email support</span></List.Item>
                      <List.Item><span style={{fontSize: '1.1rem'}}>Advanced analytics</span></List.Item>
                    </List>
                  </div>
                  <Button variant="primary" size="large"><span style={{fontSize: '1rem'}}>Choose Essential</span></Button>
                </BlockStack>
              </Card>
            </Grid.Cell>
          </Grid>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 