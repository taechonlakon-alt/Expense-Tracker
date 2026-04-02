"use client"

import { useState, useEffect, useCallback } from "react"
import { ShoppingBag, Banknote, Car, CircleDollarSign, Plus, Minus } from "lucide-react"
import Link from "next/link"
import dayjs from "dayjs"
import "dayjs/locale/th"
import { TransactionActions } from "@/components/home/TransactionActions"
import { EmptyState } from "@/components/shared/EmptyState"
import { TransactionFormModal } from "@/components/home/TransactionFormModal"

dayjs.locale('th')

interface Transaction {
  id: number
  type: string
  amount: number
  category: string
  note: string | null
  transactionDate: string
}

function getCategoryIcon(type: string, category: string) {
  if (type === "income") return <Banknote className="h-5 w-5" />
  if (category.includes("อาหาร")) return <ShoppingBag className="h-5 w-5" />
  if (category.includes("เดินทาง") || category.includes("น้ำมัน")) return <Car className="h-5 w-5" />
  return <CircleDollarSign className="h-5 w-5" />
}

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<"income" | "expense">("income")

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/transactions")
      const data = await res.json()
      setTransactions(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleOpenModal = (type: "income" | "expense") => {
    setModalType(type)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    fetchData()
  }

  // Calculate totals
  let totalIncome = 0
  let totalExpense = 0
  transactions.forEach(t => {
    if (t.type === "income") totalIncome += t.amount
    if (t.type === "expense") totalExpense += t.amount
  })
  const balance = totalIncome - totalExpense
  const recent = transactions.slice(0, 5)

  return (
    <div className="flex flex-col gap-2">

      {/* Balance Section */}
      <div className="flex flex-col py-6 space-y-5 px-2 animate-slide-up">
        <div className="space-y-1 w-full flex flex-col items-start">
          <h2 className="text-sm font-semibold text-slate-500">ยอดเงินคงเหลือปัจจุบัน</h2>
          {loading ? (
            <div className="h-12 w-64 animate-shimmer rounded-xl" />
          ) : (
            <div className={`text-[3.25rem] leading-none font-extrabold tracking-tight transition-colors duration-500 ${balance >= 0 ? 'text-[#42646D]' : 'text-[#A34E42]'}`}>
              ฿{balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm w-full overflow-x-auto">
          <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-sm border border-slate-100 whitespace-nowrap">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-slate-600 font-medium">รายรับ: <span className="font-semibold">+฿{totalIncome.toLocaleString()}</span></span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-sm border border-slate-100 whitespace-nowrap">
            <div className="h-2 w-2 rounded-full bg-rose-500" />
            <span className="text-slate-600 font-medium">รายจ่าย: <span className="font-semibold">-฿{totalExpense.toLocaleString()}</span></span>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 gap-4 my-2 px-2">
        <button 
          onClick={() => handleOpenModal("income")}
          className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#719AA8] to-[#99B6C3] p-6 text-white text-center shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98] h-44 flex flex-col items-center justify-center"
        >
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-[#719AA8] shadow-sm mb-4 mx-auto">
            <Plus className="h-6 w-6 stroke-[3]" />
          </div>
          <h3 className="text-[1.15rem] font-bold text-center w-full">เพิ่มรายรับ</h3>
          <p className="text-[11px] font-medium text-white/90 mt-1 text-center w-full">บันทึกเงินที่ได้รับเข้ามา</p>
        </button>

        <button 
          onClick={() => handleOpenModal("expense")}
          className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#E6E8DB] to-[#F1F3EB] p-6 text-slate-700 text-center shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98] h-44 flex flex-col items-center justify-center"
        >
          <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-[#C5D0B9]/30 blur-2xl" />
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#A34E42] text-white shadow-sm mb-4 mx-auto">
            <Minus className="h-6 w-6 stroke-[3]" />
          </div>
          <h3 className="text-[1.15rem] font-bold text-center w-full">เพิ่มรายจ่าย</h3>
          <p className="text-[11px] font-medium text-slate-500 mt-1 text-center w-full">บันทึกการใช้จ่ายของคุณ</p>
        </button>
      </div>

      {/* Recent Transactions */}
      <div className="mt-6 space-y-4 px-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">รายการล่าสุด</h3>
          <Link href="/summary" className="text-sm font-semibold text-[#42646D] hover:text-[#2c444a] transition-colors">
            ดูทั้งหมด &rarr;
          </Link>
        </div>

        <div className="space-y-3">
          {loading ? (
            [1, 2, 3].map(i => (
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
            ))
          ) : recent.length === 0 ? (
            <EmptyState 
              title="ยังไม่มีรายการ" 
              description="เริ่มต้นบันทึกรายรับรายจ่ายของคุณ ด้วยการกดปุ่มด้านบนเลย!" 
            />
          ) : recent.map((t, index) => (
            <div key={t.id} className={`flex items-center justify-between rounded-3xl bg-white p-4 px-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-50 transition-all hover:shadow-md opacity-0 animate-slide-up stagger-${Math.min(index + 1, 5)}`}>
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${t.type === 'income' ? 'bg-[#EAF0F6] text-[#42646D]' : 'bg-[#EEF2F0] text-slate-600'}`}>
                  {getCategoryIcon(t.type, t.category)}
                </div>
                <div>
                  <p className="font-bold text-slate-800">{t.note || t.category}</p>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">{dayjs(t.transactionDate).format('DD MMM HH:mm น.')} • {t.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className={`font-bold text-lg ${t.type === 'income' ? 'text-[#42646D]' : 'text-[#A34E42]'}`}>
                    {t.type === 'income' ? '+' : '-'}฿{t.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}
                  </p>
                  <span className={`inline-block mt-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${t.type === 'income' ? 'bg-[#E5F3F7] text-[#42646D]' : 'bg-[#FCEAEA] text-[#A34E42]'}`}>
                    {t.category}
                  </span>
                </div>
                <TransactionActions transaction={t} onRefresh={fetchData} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <TransactionFormModal 
        isOpen={modalOpen} 
        onClose={handleCloseModal} 
        type={modalType} 
      />
    </div>
  )
}
