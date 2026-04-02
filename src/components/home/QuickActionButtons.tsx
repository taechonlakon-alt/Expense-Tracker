"use client"
import { useState } from "react"
import { Plus, Minus } from "lucide-react"
import { TransactionFormModal } from "./TransactionFormModal"

export function QuickActionButtons() {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<"income" | "expense">("income")

  const handleOpen = (type: "income" | "expense") => {
    setModalType(type)
    setModalOpen(true)
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 my-2 px-2">
        <button 
          onClick={() => handleOpen("income")}
          className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#719AA8] to-[#99B6C3] p-6 text-white text-center shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98] h-44 flex flex-col items-center justify-center text-left"
        >
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-[#719AA8] shadow-sm mb-4 mx-auto">
            <Plus className="h-6 w-6 stroke-[3]" />
          </div>
          <h3 className="text-[1.15rem] font-bold text-center w-full">เพิ่มรายรับ</h3>
          <p className="text-[11px] font-medium text-white/90 mt-1 text-center w-full">บันทึกเงินที่ได้รับเข้ามา</p>
        </button>

        <button 
          onClick={() => handleOpen("expense")}
          className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#E6E8DB] to-[#F1F3EB] p-6 text-slate-700 text-center shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98] h-44 flex flex-col items-center justify-center text-left"
        >
          <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-[#C5D0B9]/30 blur-2xl" />
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#A34E42] text-white shadow-sm mb-4 mx-auto">
            <Minus className="h-6 w-6 stroke-[3]" />
          </div>
          <h3 className="text-[1.15rem] font-bold text-center w-full">เพิ่มรายจ่าย</h3>
          <p className="text-[11px] font-medium text-slate-500 mt-1 text-center w-full">บันทึกการใช้จ่ายของคุณ</p>
        </button>
      </div>

      <TransactionFormModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        type={modalType} 
      />
    </>
  )
}
