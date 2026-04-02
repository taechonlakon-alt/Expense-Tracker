export default function SummaryLoading() {
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Filter Tabs Skeleton */}
      <div className="space-y-4">
        <div className="h-10 animate-shimmer rounded-2xl" />
        <div className="h-12 animate-shimmer rounded-[1.25rem]" />
      </div>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-[1.5rem] bg-white p-4 border border-slate-50">
            <div className="space-y-3">
              <div className="h-3 w-12 animate-shimmer rounded-md" />
              <div className="h-6 w-20 animate-shimmer rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="rounded-[2rem] bg-white p-5 border border-white">
        <div className="h-5 w-32 animate-shimmer rounded-md mb-4" />
        <div className="h-52 animate-shimmer rounded-xl" />
      </div>

      {/* Category Skeleton */}
      <div className="rounded-[2rem] bg-white p-5 border border-white">
        <div className="h-5 w-40 animate-shimmer rounded-md mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <div className="h-4 w-20 animate-shimmer rounded-md" />
                <div className="h-4 w-16 animate-shimmer rounded-md" />
              </div>
              <div className="h-2.5 animate-shimmer rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
