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

interface Transaction {
  id: number
  type: string
  amount: number
  category: string
  note: string | null
  transactionDate: string
}

interface TransactionsResponse {
  transactions: Transaction[]
  totalCount: number
  totalIncome: number
  totalExpense: number
  balance: number
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
  const [totalCount, setTotalCount] = useState(0)
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalExpense, setTotalExpense] = useState(0)
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<"income" | "expense">("income")
  const [transactionPage, setTransactionPage] = useState(1)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        date: selectedDate.format("YYYY-MM-DD"),
        page: transactionPage.toString(),
        pageSize: transactionsPerPage.toString(),
      })

      const res = await fetch(`/api/transactions?${params.toString()}`)
      const data = (await res.json()) as TransactionsResponse | { error?: string }

      if (!res.ok || !("transactions" in data) || !Array.isArray(data.transactions)) {
        throw new Error("Failed to fetch transactions")
      }

      setTransactions(data.transactions)
      setTotalCount(data.totalCount)
      setTotalIncome(data.totalIncome)
      setTotalExpense(data.totalExpense)
      setBalance(data.balance)
    } catch (err) {
      console.error(err)
      setTransactions([])
      setTotalCount(0)
      setTotalIncome(0)
      setTotalExpense(0)
      setBalance(0)
    } finally {
      setLoading(false)
    }
  }, [selectedDate, transactionPage])

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

  const totalTransactionPages = Math.max(1, Math.ceil(totalCount / transactionsPerPage))

  useEffect(() => {
    if (transactionPage > totalTransactionPages) {
      setTransactionPage(totalTransactionPages)
    }
  }, [transactionPage, totalTransactionPages])

  return (
    <div className="flex flex-col gap-2">
      <div className="mt-4 px-2 animate-slide-up">
        <DateNavigator selectedDate={selectedDate} onChange={setSelectedDate} />
      </div>

      <div className="flex flex-col space-y-5 px-2 py-4 animate-slide-up stagger-1">
        <div className="flex w-full flex-col items-start space-y-1">
          <h2 className="text-sm font-semibold text-slate-500">ยอดเงินคงเหลือประจำวัน</h2>
          {loading ? (
            <div className="h-12 w-64 animate-shimmer rounded-xl" />
          ) : (
            <div className={`py-2 text-4xl font-extrabold leading-none tracking-tight transition-colors duration-500 xs:text-5xl sm:text-6xl md:text-7xl ${balance >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              ฿{balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          )}
        </div>
        <div className="flex w-full items-center gap-3 overflow-x-auto text-sm">
          <div className="flex items-center gap-2 whitespace-nowrap rounded-full border border-slate-100 bg-white px-3 py-1.5 shadow-sm">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-medium text-slate-600">รายรับ: <span className="font-semibold">+฿{totalIncome.toLocaleString()}</span></span>
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap rounded-full border border-slate-100 bg-white px-3 py-1.5 shadow-sm">
            <div className="h-2 w-2 rounded-full bg-rose-500" />
            <span className="font-medium text-slate-600">รายจ่าย: <span className="font-semibold">-฿{totalExpense.toLocaleString()}</span></span>
          </div>
        </div>
      </div>

      <div className="my-2 grid grid-cols-2 gap-4 px-2">
        <button
          onClick={() => handleOpenModal("income")}
          className="relative flex h-40 flex-col items-center justify-center overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-500 to-emerald-400 p-4 text-center text-white shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98] md:h-52 md:p-6"
        >
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-emerald-600 shadow-sm md:mb-4 md:h-16 md:w-16">
            <Plus className="h-6 w-6 stroke-[3] md:h-8 md:w-8" />
          </div>
          <h3 className="w-full text-center text-xl font-bold md:text-2xl">เพิ่มรายรับ</h3>
          <p className="mt-0.5 w-full text-center text-[10px] font-medium uppercase tracking-tighter text-white/90 md:mt-1 md:text-sm md:tracking-normal">บันทึกเงินที่ได้</p>
        </button>

        <button
          onClick={() => handleOpenModal("expense")}
          className="relative flex h-40 flex-col items-center justify-center overflow-hidden rounded-[2rem] bg-gradient-to-br from-rose-500 to-rose-400 p-4 text-center text-white shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98] md:h-52 md:p-6"
        >
          <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-rose-600 shadow-sm md:mb-4 md:h-16 md:w-16">
            <Minus className="h-6 w-6 stroke-[3] md:h-8 md:w-8" />
          </div>
          <h3 className="w-full text-center text-xl font-bold md:text-2xl">เพิ่มรายจ่าย</h3>
          <p className="mt-0.5 w-full text-center text-[10px] font-medium uppercase tracking-tighter text-white/90 md:mt-1 md:text-sm md:tracking-normal">บันทึกใช้จ่าย</p>
        </button>
      </div>

      <div className="mt-6 space-y-4 px-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">รายการประจำวัน</h3>
          <Link href="/summary" className="text-sm font-semibold text-[#42646D] transition-colors hover:text-[#2c444a]">
            ดูภาพรวม &rarr;
          </Link>
        </div>

        <div className="space-y-3">
          {loading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between rounded-3xl border border-slate-50 bg-white p-4 px-5">
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
          ) : totalCount === 0 ? (
            <EmptyState
              title={selectedDate.isSame(dayjs(), "day") ? "ยังไม่มีรายการสำหรับวันนี้" : `ยังไม่มีรายการสำหรับวันที่ ${selectedDate.format("D MMM")}`}
              description="เริ่มต้นบันทึกรายรับรายจ่ายของคุณ ด้วยการกดปุ่มด้านบนเลย!"
            />
          ) : transactions.map((t, index) => (
            <div key={t.id} className={`flex items-center justify-between rounded-3xl border border-slate-100 bg-white p-4 px-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all hover:shadow-md opacity-0 animate-slide-up stagger-${Math.min(index + 1, 5)} md:p-5 md:px-6`}>
              <div className="flex items-center gap-3 md:gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full md:h-14 md:w-14 ${t.type === "income" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                  {getCategoryIcon(t.type, t.category)}
                </div>
                <div>
                  <p className="line-clamp-1 text-base font-bold text-slate-800 md:text-lg">{t.note || t.category}</p>
                  <p className="mt-0.5 text-[10px] font-medium text-slate-400 md:text-sm">{dayjs(t.transactionDate).tz("Asia/Bangkok").format("HH:mm น.")} • {t.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <p className={`text-xl font-bold md:text-2xl ${t.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>
                  {t.type === "income" ? "+" : "-"}฿{t.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
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
