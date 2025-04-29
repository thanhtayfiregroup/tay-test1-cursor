import {
  Page,
  Layout,
  Form,
  FormLayout,
  Card,
  Select,
  Button,
  Text,
  BlockStack,
  Box
} from "@shopify/polaris";
import { json } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { useState } from "react";
import { authenticate } from "../shopify.server";

interface SettingsData {
  status: boolean;
  layout: string;
  language: string;
  voice: string;
}

interface LoaderData {
  settings: SettingsData;
}

export const loader = async ({ request }: { request: Request }) => {
  await authenticate.admin(request);

  // Mock data - Replace with actual data fetching
  const settings: SettingsData = {
    status: true,
    layout: "default",
    language: "en",
    voice: "none"
  };

  return json<LoaderData>({ settings });
};

export const action = async ({ request }: { request: Request }) => {
  await authenticate.admin(request);
  const formData = await request.formData();
  
  // Handle form submission here
  // For now, we'll just return the submitted data
  return json({ success: true });
};

export default function SettingsPage() {
  const { settings } = useLoaderData<LoaderData>();
  const submit = useSubmit();

  const [formState, setFormState] = useState<SettingsData>({
    status: settings.status,
    layout: settings.layout,
    language: settings.language,
    voice: settings.voice
  });

  const layoutOptions = [
    { label: "Default", value: "default" },
    { label: "Compact", value: "compact" },
    { label: "Comfortable", value: "comfortable" }
  ];

  const languageOptions = [
    { label: "English", value: "en" },
    { label: "Vietnamese", value: "vi" }
  ];

  const voiceOptions = [
    { label: "None", value: "none" },
    { label: "Vietnamese Female", value: "vi_female", disabled: false },
    { label: "Vietnamese Male", value: "vi_male", disabled: false },
    { label: "Coming soon - English Female", value: "en_female", disabled: true },
    { label: "Coming soon - English Male", value: "en_male", disabled: true }
  ];

  const handleSubmit = () => {
    const formData = new FormData();
    Object.entries(formState).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });
    submit(formData, { method: "post" });
  };

  return (
    <Page title="Settings">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="500">
              <Form onSubmit={handleSubmit}>
                <FormLayout>
                  <BlockStack gap="400">
                    <Box padding="400">
                      <BlockStack gap="200">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text as="h2" variant="headingMd">Status audio player</Text>
                          <div style={{ 
                            backgroundColor: formState.status ? '#AEE9D1' : '#E4E5E7',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            display: 'inline-block',
                            cursor: 'pointer'
                          }}
                          onClick={() => setFormState({ ...formState, status: !formState.status })}
                          >
                            <Text as="span" variant="bodySm">
                              {formState.status ? 'On' : 'Off'}
                            </Text>
                          </div>
                        </div>
                        <Text as="p" variant="bodyMd" tone="subdued">
Enable audio player to let customers listen to product descriptions and content through voice playback.
                        </Text>
                      </BlockStack>
                    </Box>

                    <Select
                      label={<Text variant="headingMd" as="h2">Layout</Text>}
                      options={layoutOptions}
                      value={formState.layout}
                      onChange={(value) => setFormState({ ...formState, layout: value })}
                    />

                    <Select
                      label={<Text variant="headingMd" as="h2">Language</Text>}
                      options={languageOptions}
                      value={formState.language}
                      onChange={(value) => setFormState({ ...formState, language: value })}
                    />

                    <Select
                      label={<Text variant="headingMd" as="h2">Voice Assistant</Text>}
                      options={voiceOptions}
                      value={formState.voice}
                      onChange={(value) => setFormState({ ...formState, voice: value })}
                      helpText=""
                    />

                    <div style={{ marginTop: "1rem" }}>
                      <Button variant="primary" submit>Update Settings</Button>
                    </div>
                  </BlockStack>
                </FormLayout>
              </Form>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 