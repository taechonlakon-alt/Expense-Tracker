"use client"

import { useState, useEffect, useCallback } from "react"
import { ShoppingBag, Banknote, Car, CircleDollarSign, Plus, Minus } from "lucide-react"
import Link from "next/link"
import dayjs from "@/lib/dayjs"
import { TransactionActions } from "@/components/home/TransactionActions"
import { EmptyState } from "@/components/shared/EmptyState"
import { PaginationControls } from "@/components/shared/PaginationControls"
import { TransactionFormModal } from "@/components/home/TransactionFormModal"
import { DateNavigator } from "@/components/home/DateNavigator"

// dayjs locale and plugins are set in lib/dayjs

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
  const transactionsPerPage = 10
  const [selectedDate, setSelectedDate] = useState(dayjs())
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<"income" | "expense">("income")
  const [transactionPage, setTransactionPage] = useState(1)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/transactions?date=${selectedDate.format("YYYY-MM-DD")}`)
      const data = await res.json()
      setTransactions(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    setTransactionPage(1)
  }, [selectedDate])

  const handleOpenModal = (type: "income" | "expense") => {
    setModalType(type)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    fetchData()
  }

  // Calculate totals (These are now daily totals because the API is filtered)
  let totalIncome = 0
  let totalExpense = 0
  transactions.forEach(t => {
    if (t.type === "income") totalIncome += t.amount
    if (t.type === "expense") totalExpense += t.amount
  })
  const balance = totalIncome - totalExpense
  const totalTransactionPages = Math.max(1, Math.ceil(transactions.length / transactionsPerPage))
  const paginatedTransactions = transactions.slice(
    (transactionPage - 1) * transactionsPerPage,
    transactionPage * transactionsPerPage
  )

  useEffect(() => {
    if (transactionPage > totalTransactionPages) {
      setTransactionPage(totalTransactionPages)
    }
  }, [transactionPage, totalTransactionPages])

  return (
    <div className="flex flex-col gap-2">

      {/* Date Navigator */}
      <div className="px-2 mt-4 animate-slide-up">
        <DateNavigator selectedDate={selectedDate} onChange={setSelectedDate} />
      </div>

      {/* Balance Section */}
      <div className="flex flex-col py-4 space-y-5 px-2 animate-slide-up stagger-1">
        <div className="space-y-1 w-full flex flex-col items-start">
          <h2 className="text-sm font-semibold text-slate-500">ยอดเงินคงเหลือประจำวัน</h2>
          {loading ? (
            <div className="h-12 w-64 animate-shimmer rounded-xl" />
          ) : (
            <div className={`text-4xl xs:text-5xl sm:text-6xl md:text-7xl leading-none font-extrabold tracking-tight transition-colors duration-500 py-2 ${balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
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
          className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-500 to-emerald-400 p-4 md:p-6 text-white text-center shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98] h-40 md:h-52 flex flex-col items-center justify-center"
        >
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
          <div className="flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full bg-white/90 text-emerald-600 shadow-sm mb-3 md:mb-4 mx-auto">
            <Plus className="h-6 w-6 md:h-8 md:w-8 stroke-[3]" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-center w-full">เพิ่มรายรับ</h3>
          <p className="text-[10px] md:text-sm font-medium text-white/90 mt-0.5 md:mt-1 text-center w-full uppercase tracking-tighter md:tracking-normal">บันทึกเงินที่ได้</p>
        </button>

        <button 
          onClick={() => handleOpenModal("expense")}
          className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-rose-500 to-rose-400 p-4 md:p-6 text-white text-center shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98] h-40 md:h-52 flex flex-col items-center justify-center"
        >
          <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
          <div className="flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full bg-white/90 text-rose-600 shadow-sm mb-3 md:mb-4 mx-auto">
            <Minus className="h-6 w-6 md:h-8 md:w-8 stroke-[3]" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-center w-full">เพิ่มรายจ่าย</h3>
          <p className="text-[10px] md:text-sm font-medium text-white/90 mt-0.5 md:mt-1 text-center w-full uppercase tracking-tighter md:tracking-normal">บันทึกใช้จ่าย</p>
        </button>
      </div>

      {/* Daily Transactions */}
      <div className="mt-6 space-y-4 px-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">รายการประจำวัน</h3>
          <Link href="/summary" className="text-sm font-semibold text-[#42646D] hover:text-[#2c444a] transition-colors">
            ดูภาพรวม &rarr;
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
          ) : transactions.length === 0 ? (
            <EmptyState 
              title={selectedDate.isSame(dayjs(), 'day') ? "ยังไม่มีรายการสำหรับวันนี้" : `ยังไม่มีรายการสำหรับวันที่ ${selectedDate.format('D MMM')}`} 
              description="เริ่มต้นบันทึกรายรับรายจ่ายของคุณ ด้วยการกดปุ่มด้านบนเลย!" 
            />
          ) : paginatedTransactions.map((t, index) => (
            <div key={t.id} className={`flex items-center justify-between rounded-3xl bg-white p-4 md:p-5 px-5 md:px-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 transition-all hover:shadow-md opacity-0 animate-slide-up stagger-${Math.min(index + 1, 5)}`}>
              <div className="flex items-center gap-3 md:gap-4">
                <div className={`flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full ${t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {getCategoryIcon(t.type, t.category)}
                </div>
                <div>
                  <p className="font-bold text-base md:text-lg text-slate-800 line-clamp-1">{t.note || t.category}</p>
                  <p className="text-[10px] md:text-sm font-medium text-slate-400 mt-0.5">{dayjs(t.transactionDate).tz("Asia/Bangkok").format('HH:mm น.')} • {t.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <p className={`font-bold text-xl md:text-2xl ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {t.type === 'income' ? '+' : '-'}฿{t.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}
                </p>
                <TransactionActions transaction={t} onRefresh={fetchData} />
              </div>
            </div>
          ))}
        </div>

        <PaginationControls
          currentPage={transactionPage}
          totalPages={totalTransactionPages}
          onPageChange={setTransactionPage}
        />
      </div>

      <TransactionFormModal 
        isOpen={modalOpen} 
        onClose={handleCloseModal} 
        type={modalType} 
      />
    </div>
  )
}
