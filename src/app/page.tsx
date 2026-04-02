import { BalanceSection } from "@/components/home/BalanceSection";
import { QuickActionButtons } from "@/components/home/QuickActionButtons";
import { RecentTransactionList } from "@/components/home/RecentTransactionList";

export default function Home() {
  return (
    <div className="flex flex-col gap-2 animate-in fade-in duration-500">
      <BalanceSection />
      <QuickActionButtons />
      <RecentTransactionList />
    </div>
  );
}
