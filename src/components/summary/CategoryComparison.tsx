import { MoreHorizontal } from "lucide-react"

export function CategoryComparison() {
  return (
    <div className="mt-4 bg-[#F5F4F1] rounded-t-[2rem] rounded-b-3xl p-6 shadow-inner min-h-[240px]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-extrabold text-slate-800 text-[1.15rem]">เปรียบเทียบตามหมวดหมู่</h3>
        <button className="text-slate-500 hover:text-slate-800 transition-colors">
          <MoreHorizontal className="h-5 w-5 stroke-[3]" />
        </button>
      </div>
      {/* Placeholder for real charts */}
      <div className="flex flex-col items-center justify-center py-6">
        <div className="relative w-36 h-36">
          <div className="absolute inset-0 rounded-full border-[12px] border-slate-200 border-t-[#719AA8] border-r-[#A34E42] border-b-[#EBEBEB] opacity-80 shadow-sm" />
          <div className="absolute inset-4 rounded-full bg-white shadow-sm flex items-center justify-center">
            <span className="text-xs font-bold text-slate-400">Chart</span>
          </div>
        </div>
      </div>
    </div>
  )
}
