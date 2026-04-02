import { Suspense } from "react";
import { BalanceSection } from "@/components/home/BalanceSection";
import { QuickActionButtons } from "@/components/home/QuickActionButtons";
import { RecentTransactionList } from "@/components/home/RecentTransactionList";

export const dynamic = "force-dynamic";

function BalanceSkeleton() {
  return (
    <div className="flex flex-col py-6 space-y-5 px-2 animate-in fade-in duration-300">
      <div className="space-y-3">
        <div className="h-4 w-40 animate-shimmer rounded-lg" />
        <div className="h-12 w-64 animate-shimmer rounded-xl" />
      </div>
      <div className="flex gap-3">
        <div className="h-8 w-44 animate-shimmer rounded-full" />
        <div className="h-8 w-44 animate-shimmer rounded-full" />
      </div>
    </div>
  );
}

function TransactionsSkeleton() {
  return (
    <div className="mt-6 space-y-4 px-2 animate-in fade-in duration-300">
      <div className="flex justify-between">
        <div className="h-5 w-28 animate-shimmer rounded-lg" />
        <div className="h-5 w-20 animate-shimmer rounded-lg" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center justify-between rounded-3xl bg-white p-4 px-5 border border-slate-50">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 animate-shimmer rounded-full" />
              <div className="space-y-2">
                <div className="h-4 w-24 animate-shimmer rounded-md" />
                <div className="h-3 w-32 animate-shimmer rounded-md" />
              </div>
            </div>
            <div className="h-6 w-20 animate-shimmer rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col gap-2">
      <Suspense fallback={<BalanceSkeleton />}>
        <BalanceSection />
      </Suspense>
      <QuickActionButtons />
      <Suspense fallback={<TransactionsSkeleton />}>
        <RecentTransactionList />
      </Suspense>
    </div>
  );
}
