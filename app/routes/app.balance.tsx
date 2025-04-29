import { Page, Layout, Card, DataTable, Button, Text, ButtonGroup, Select } from "@shopify/polaris";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { useState } from "react";

interface Transaction {
  id: string;
  date: string;
  type: string;
  amount: number;
  status: string;
  description: string;
}

interface BalanceData {
  currentBalance: number;
  currency: string;
  transactions: Transaction[];
}

interface LoaderData {
  balanceData: BalanceData;
}

export const loader = async ({ request }: { request: Request }) => {
  await authenticate.admin(request);
  
  // Mock data - Replace with actual data fetching
  const balanceData: BalanceData = {
    currentBalance: 1500000,
    currency: "VND",
    transactions: [
      {
        id: "1",
        date: "2024-03-28",
        type: "Deposit",
        amount: 500000,
        status: "Completed",
        description: "Bank transfer"
      },
      {
        id: "2",
        date: "2024-03-27",
        type: "Withdrawal",
        amount: -200000,
        status: "Completed",
        description: "Service fee"
      },
      {
        id: "3",
        date: "2024-03-26",
        type: "Deposit",
        amount: 1200000,
        status: "Completed",
        description: "Sales revenue"
      }
    ]
  };

  return json<LoaderData>({ balanceData });
};

export default function BalancePage() {
  const { balanceData } = useLoaderData<LoaderData>();
  const [selectedAmount, setSelectedAmount] = useState('500000');

  const depositOptions = [
    {label: '500,000 VND', value: '500000'},
    {label: '1,000,000 VND', value: '1000000'},
    {label: '2,000,000 VND', value: '2000000'},
    {label: '5,000,000 VND', value: '5000000'},
    {label: '10,000,000 VND', value: '10000000'},
  ];

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const rows = balanceData.transactions.map((transaction: Transaction) => [
    transaction.date,
    transaction.type,
    formatCurrency(transaction.amount),
    transaction.status,
    transaction.description
  ]);

  const handleAmountChange = (value: string) => {
    setSelectedAmount(value);
  };

  return (
    <Page
      title="Balance Management"
      primaryAction={
        <ButtonGroup>
          <div style={{ minWidth: '200px' }}>
            <Select
              label=""
              options={depositOptions}
              value={selectedAmount}
              onChange={handleAmountChange}
              labelHidden
            />
          </div>
          <Button variant="primary">Deposit</Button>
        </ButtonGroup>
      }
    >
      <Layout>
        <Layout.Section>
          <Card>
            <div style={{ padding: "20px", textAlign: "center" }}>
              <Text variant="headingLg" as="h2">Current Balance</Text>
              <div style={{ margin: "20px 0" }}>
                <Text variant="heading3xl" as="p" tone="success">
                  {formatCurrency(balanceData.currentBalance)}
                </Text>
              </div>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div style={{ padding: "16px" }}>
              <Text variant="headingMd" as="h3">Transaction History</Text>
            </div>
            <DataTable
              columnContentTypes={[
                'text',
                'text',
                'text',
                'text',
                'text',
              ]}
              headings={[
                'Date',
                'Transaction Type',
                'Amount',
                'Status',
                'Description'
              ]}
              rows={rows}
            />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 