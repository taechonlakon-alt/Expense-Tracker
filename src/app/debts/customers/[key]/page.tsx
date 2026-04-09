import { DebtCustomerDetailPage } from "@/components/debts/DebtCustomerDetailPage";

interface DebtCustomerPageProps {
  params: Promise<{ key: string }>;
}

function normalizeRouteKey(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default async function DebtCustomerPage({
  params,
}: Readonly<DebtCustomerPageProps>) {
  const { key } = await params;

  return <DebtCustomerDetailPage customerKey={normalizeRouteKey(key)} />;
}
