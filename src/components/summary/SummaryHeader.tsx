import { ChevronLeft, ChevronRight } from "lucide-react"

export function SummaryHeader() {
  return (
    <div className="space-y-6 px-1">
      <div className="flex items-center justify-between">
        <div className="mt-2">
           <h1 className="text-2xl font-extrabold text-[#365058]">สรุปผล</h1>
           <p className="text-[11px] font-medium text-slate-500 mt-1 tracking-tight">ภาพรวมการเงินของคุณในสัปดาห์นี้</p>
        </div>
        <div className="flex bg-[#F2F0E9] rounded-full p-1 shadow-inner border border-slate-100">
          <button className="px-4 py-1.5 rounded-full text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">วัน</button>
          <button className="px-4 py-1.5 rounded-full text-xs font-bold bg-white text-[#42646D] shadow-sm">เดือน</button>
          <button className="px-4 py-1.5 rounded-full text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">ปี</button>
        </div>
      </div>

      <div className="flex items-center justify-between bg-[#F2F0E9] rounded-[1.25rem] p-1.5 px-4">
        <button className="p-2 hover:bg-white rounded-full text-slate-600 transition-colors"><ChevronLeft className="h-4 w-4 stroke-[3]" /></button>
        <span className="font-extrabold text-slate-800 text-sm">พฤศจิกายน 2567</span>
        <button className="p-2 hover:bg-white rounded-full text-slate-600 transition-colors"><ChevronRight className="h-4 w-4 stroke-[3]" /></button>
      </div>
    </div>
  )
}
