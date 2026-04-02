"use client"
import { Wallet2 } from "lucide-react"

interface EmptyStateProps {
  title?: string
  description?: string
}

export function EmptyState({ 
  title = "ยังไม่มีรายการ",
  description = "กดปุ่ม เพิ่มรายรับ หรือ เพิ่มรายจ่าย เพื่อเริ่มบันทึกข้อมูลกันเลย!"
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-[#719AA8]/10 blur-xl scale-150 animate-pulse" />
        <div className="relative bg-gradient-to-br from-[#EAF0F6] to-[#E5F3F7] h-24 w-24 rounded-full flex items-center justify-center shadow-sm">
          <Wallet2 className="h-10 w-10 text-[#719AA8] stroke-[1.5]" />
        </div>
      </div>
      <h3 className="text-lg font-extrabold text-slate-700 mb-2 text-center">{title}</h3>
      <p className="text-sm font-medium text-slate-400 text-center max-w-[260px] leading-relaxed">{description}</p>
    </div>
  )
}
