"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, ChevronDown, Banknote, Wallet, PiggyBank, Download, ShoppingBag, Car, CircleDollarSign } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { th } from "date-fns/locale"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import dayjs from "@/lib/dayjs"
import { TransactionActions } from "@/components/home/TransactionActions"
import { TrendingUp as TrendingUpIcon } from "lucide-react"

// dayjs locale and plugins are set in lib/dayjs

type FilterType = "day" | "month" | "year"

interface SummaryData {
  totalIncome: number
  totalExpense: number
  balance: number
  categories: { name: string; amount: number; type: string }[]
  chartData: { label: string; income: number; expense: number }[]
  transactions: { id: number; type: string; amount: number; category: string; note: string | null; transactionDate: string }[]
}

function getCategoryIcon(type: string, category: string) {
  if (type === "income") return <Banknote className="h-5 w-5" />
  if (category.includes("อาหาร")) return <ShoppingBag className="h-5 w-5" />
  if (category.includes("เดินทาง") || category.includes("น้ำมัน")) return <Car className="h-5 w-5" />
  return <CircleDollarSign className="h-5 w-5" />
}

export default function SummaryPage() {
  const [filter, setFilter] = useState<FilterType>("month")
  const [currentDate, setCurrentDate] = useState(dayjs())
  const [data, setData] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const fetchSummary = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/summary?filter=${filter}&date=${currentDate.format("YYYY-MM-DD")}`)
      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error("Failed to fetch summary", err)
    } finally {
      setLoading(false)
    }
  }, [filter, currentDate])

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  const navigateDate = (direction: "prev" | "next") => {
    const unit = filter === "day" ? "day" : filter === "month" ? "month" : "year"
    setCurrentDate(prev => direction === "prev" ? prev.subtract(1, unit) : prev.add(1, unit))
  }

  const getDateLabel = () => {
    if (filter === "day") return currentDate.format("D MMMM YYYY")
    if (filter === "month") return currentDate.format("MMMM YYYY")
    return currentDate.format("YYYY")
  }

  const handleExportCSV = () => {
    window.open(`/api/export?filter=${filter}&date=${currentDate.format("YYYY-MM-DD")}`, "_blank")
  }

  const refreshData = () => {
    fetchSummary()
  }

  const totalExpenseForPercent = data?.categories
    .filter(c => c.type === "expense")
    .reduce((sum, c) => sum + c.amount, 0) || 1

  const CATEGORY_COLORS: Record<string, string> = {
    "อาหาร": "#F87171",
    "เดินทาง": "#FB923C",
    "ค่าน้ำมัน": "#FBBF24",
    "ค่าหอ": "#A78BFA",
    "ค่าเรียน": "#60A5FA",
    "บันเทิง": "#F472B6",
    "ช้อปปิ้ง": "#34D399",
    "เงินเดือน": "#6EE7B7",
    "เงินพิเศษ": "#93C5FD",
    "โบนัส": "#C4B5FD",
    "ขายของ": "#FDE68A",
    "อื่นๆ": "#CBD5E1",
  }

  return (
    <div className="flex flex-col pb-8 pt-2 animate-in slide-in-from-right-4 duration-500">
      {/* Header + Filter Tabs */}
      <div className="space-y-6 px-1">
        <div className="flex items-center justify-between">
          <div className="mt-2">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-[#365058]">สรุปผล</h1>
            <p className="text-sm font-medium text-slate-500 mt-1 tracking-tight">ภาพรวมการเงินของคุณ</p>
          </div>
          <div className="flex bg-[#F2F0E9] rounded-full p-1 shadow-inner border border-slate-100">
            {(["day", "month", "year"] as FilterType[]).map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${filter === f ? "bg-white text-[#42646D] shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                {f === "day" ? "วัน" : f === "month" ? "เดือน" : "ปี"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between bg-[#F2F0E9] rounded-[1.25rem] p-1.5 px-4">
          <button onClick={() => navigateDate("prev")} className="p-2 hover:bg-white rounded-full text-slate-600 transition-colors">
            <ChevronLeft className="h-4 w-4 stroke-[3]" />
          </button>
          
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white hover:shadow-sm transition-all focus:outline-none">
              <span className="font-extrabold text-slate-800 text-sm">{getDateLabel()}</span>
              <ChevronDown className="h-3 w-3 stroke-[3] text-slate-400" />
            </PopoverTrigger>
            <PopoverContent align="center" className={`p-4 rounded-[2rem] border-0 shadow-[0_10px_40px_rgba(0,0,0,0.08)] bg-white overflow-hidden ${filter === "day" ? "w-auto" : "w-[280px]"}`}>
              {filter === "day" && (
                <Calendar
                  mode="single"
                  locale={th}
                  selected={currentDate.toDate()}
                  onSelect={(date) => {
                    if (date) {
                      setCurrentDate(dayjs(date))
                      setIsCalendarOpen(false)
                    }
                  }}
                  initialFocus
                  className="p-2"
                />
              )}

              {filter === "month" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <button onClick={() => setCurrentDate(prev => prev.subtract(1, "year"))} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
                      <ChevronLeft className="h-4 w-4 stroke-[3]" />
                    </button>
                    <div className="font-bold text-slate-800 text-lg">{currentDate.format("YYYY")}</div>
                    <button onClick={() => setCurrentDate(prev => prev.add(1, "year"))} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
                      <ChevronRight className="h-4 w-4 stroke-[3]" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."].map((m, i) => (
                      <button 
                        key={m} 
                        onClick={() => {
                          setCurrentDate(currentDate.month(i));
                          setIsCalendarOpen(false);
                        }}
                        className={`p-2.5 text-sm rounded-xl font-bold transition-colors ${currentDate.month() === i ? "bg-[#42646D] text-white shadow-sm" : "hover:bg-slate-100 text-slate-600"}`}
                      >
                         {m}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {filter === "year" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <button onClick={() => setCurrentDate(prev => prev.subtract(12, "year"))} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
                       <ChevronLeft className="h-4 w-4 stroke-[3]" />
                    </button>
                    <div className="font-bold text-slate-800 text-sm">เลือกปี</div>
                    <button onClick={() => setCurrentDate(prev => prev.add(12, "year"))} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
                       <ChevronRight className="h-4 w-4 stroke-[3]" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                     {Array.from({length: 12}).map((_, i) => {
                        const yearVal = currentDate.year() - 5 + i;
                        return (
                          <button
                             key={yearVal}
                             onClick={() => {
                                setCurrentDate(currentDate.year(yearVal));
                                setIsCalendarOpen(false);
                             }}
                             className={`p-3 text-sm rounded-xl font-bold transition-colors ${currentDate.year() === yearVal ? "bg-[#42646D] text-white shadow-sm" : "hover:bg-slate-100 text-slate-600"}`}
                          >
                            {yearVal}
                          </button>
                        )
                     })}
                  </div>
                </div>
              )}
            </PopoverContent>
          </Popover>

          <button onClick={() => navigateDate("next")} className="p-2 hover:bg-white rounded-full text-slate-600 transition-colors">
            <ChevronRight className="h-4 w-4 stroke-[3]" />
          </button>
        </div>

        <button
          onClick={handleExportCSV}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-white border border-slate-100 shadow-sm text-sm font-bold text-[#42646D] hover:bg-[#EAF0F6] transition-all active:scale-[0.98]"
        >
          <Download className="h-4 w-4 stroke-[2.5]" />
          ดาวน์โหลด CSV ประจำ{filter === "day" ? "วัน" : filter === "month" ? "เดือน" : "ปี"}นี้
        </button>
      </div>

      {/* States */}
      {loading ? (
        <div className="space-y-4 my-6 animate-pulse">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-[1.75rem] h-28" />
            <div className="bg-white rounded-[1.75rem] h-28" />
          </div>
          <div className="bg-slate-200 rounded-[2rem] h-36" />
          <div className="bg-white rounded-[2rem] h-64" />
        </div>
      ) : data ? (
        <>
          {/* Summary Cards */}
          <div className="space-y-4 my-6 px-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-[1.75rem] p-5 shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-white relative overflow-hidden transition-all hover:shadow-md">
                <div className="absolute -left-4 -top-4 w-20 h-20 bg-emerald-50 rounded-full blur-2xl opacity-70" />
                <div className="flex items-center gap-2 mb-3 relative z-10">
                  <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                    <Banknote className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <span className="text-sm font-bold text-slate-600">รายรับ</span>
                </div>
                <div className="text-2xl lg:text-3xl font-bold text-emerald-600 relative z-10">
                  ฿ {data.totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="bg-white rounded-[1.75rem] p-5 shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-white relative overflow-hidden transition-all hover:shadow-md">
                <div className="absolute -right-4 -top-4 w-20 h-20 bg-rose-50 rounded-full blur-2xl opacity-70" />
                <div className="flex items-center gap-2 mb-3 relative z-10">
                  <div className="bg-rose-100 p-2 rounded-full text-rose-600">
                    <Wallet className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <span className="text-sm font-bold text-slate-600">รายจ่าย</span>
                </div>
                <div className="text-2xl lg:text-3xl font-bold text-rose-600 relative z-10">
                  ฿ {data.totalExpense.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-[2rem] p-6 text-white shadow-lg relative overflow-hidden min-h-[140px] flex flex-col justify-center transition-all hover:shadow-xl">
              <div className="absolute -right-8 -bottom-16 w-48 h-48 bg-white/10 rounded-full blur-md" />
              <div className="flex items-center gap-3 mb-2 relative z-10">
                <div className="bg-white/20 p-2 rounded-full text-white">
                  <PiggyBank className="h-6 w-6 stroke-[2.5]" />
                </div>
                <span className="text-sm font-bold text-white/90">เงินคงเหลือสุทธิ</span>
              </div>
              <div className="text-5xl font-extrabold tracking-tight relative z-10">
                ฿ {data.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              {data.balance > 0 && <p className="text-sm font-medium text-white/80 mt-1 relative z-10 tracking-tight">คุณประหยัดเงินได้ดีมาก!</p>}
            </div>
          </div>

          {/* Chart */}
          {filter !== "day" && data.chartData.length > 0 && (
            <div className="bg-white rounded-[2rem] p-6 shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-white mb-6">
              <h3 className="font-extrabold text-slate-800 text-xl mb-6">
                {filter === "month" ? "รายรับ-รายจ่ายรายวัน" : "รายรับ-รายจ่ายรายเดือน"}
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="label" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      tickFormatter={(value) => `฿${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                      formatter={(value: any) => [`฿${value.toLocaleString()}`, '']}
                      labelStyle={{ fontWeight: 'bold', marginBottom: '4px', color: '#1e293b' }}
                    />
                    <Bar 
                      dataKey="income" 
                      name="รายรับ" 
                      fill="#10b981" 
                      radius={[6, 6, 0, 0]} 
                      barSize={filter === "month" ? 8 : 20}
                    />
                    <Bar 
                      dataKey="expense" 
                      name="รายจ่าย" 
                      fill="#ef4444" 
                      radius={[6, 6, 0, 0]} 
                      barSize={filter === "month" ? 8 : 20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Category Comparison */}
          <div className="bg-[#F5F4F1] rounded-t-[2rem] rounded-b-[2.5rem] p-6 shadow-inner min-h-[200px] mb-6">
            <h3 className="font-extrabold text-slate-800 text-[1.15rem] mb-5 tracking-tight">เปรียบเทียบตามหมวดหมู่</h3>
            {data.categories.length === 0 ? (
              <p className="text-center text-slate-400 py-8 text-sm font-medium italic">ยังไม่มีข้อมูลสำหรับการเปรียบเทียบ</p>
            ) : (
              <div className="space-y-5">
                {data.categories.filter(c => c.type === "expense").map(cat => {
                  const percent = Math.round((cat.amount / totalExpenseForPercent) * 100)
                  const color = CATEGORY_COLORS[cat.name] || "#94a3b8"
                  return (
                    <div key={cat.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: color }} />
                          <span className="text-sm font-bold text-slate-700">{cat.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800">฿{cat.amount.toLocaleString()}</span>
                          <span className="text-[10px] font-extrabold text-slate-400 bg-white/60 px-2 py-0.5 rounded-full border border-slate-100">{percent}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200/60 rounded-full h-3 overflow-hidden border border-slate-100 shadow-inner">
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                          style={{ width: `${percent}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  )
                })}

                {data.categories.filter(c => c.type === "income").length > 0 && (
                  <>
                    <div className="border-t border-slate-200 my-6 opacity-60" />
                    <h4 className="text-xs font-bold text-slate-500 mb-4 flex items-center gap-1.5 uppercase tracking-wider">
                      <TrendingUpIcon className="h-3.5 w-3.5 text-emerald-500" /> หมวดหมู่รายรับ
                    </h4>
                    {data.categories.filter(c => c.type === "income").map(cat => {
                      const totalIncomeForPercent = data.categories.filter(c => c.type === "income").reduce((s, c) => s + c.amount, 0) || 1
                      const percent = Math.round((cat.amount / totalIncomeForPercent) * 100)
                      const color = CATEGORY_COLORS[cat.name] || "#6EE7B7"
                      return (
                        <div key={cat.name} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: color }} />
                              <span className="text-sm font-bold text-slate-700">{cat.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-emerald-600">+฿{cat.amount.toLocaleString()}</span>
                              <span className="text-[10px] font-extrabold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">{percent}%</span>
                            </div>
                          </div>
                          <div className="w-full bg-slate-200/60 rounded-full h-3 overflow-hidden border border-slate-100 shadow-inner">
                            <div
                              className="h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                              style={{ width: `${percent}%`, backgroundColor: color }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Full Transaction List */}
          <div className="bg-white rounded-[2rem] p-6 shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-white">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-extrabold text-slate-800 text-lg tracking-tight">
                รายการล่าสุด {data.transactions.length > 10 ? `(แสดง 10 จาก ${data.transactions.length})` : ""}
              </h3>
              <div className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                {data.transactions.length} รายการ
              </div>
            </div>
            
            {data.transactions.length === 0 ? (
              <p className="text-center text-slate-400 py-10 text-sm font-medium italic">ไม่มีรายการธุรกรรมในช่วงเวลานี้</p>
            ) : (
              <div className="space-y-2">
                {data.transactions.slice(0, 10).map((t, index) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between py-4 px-2 hover:bg-slate-50 rounded-2xl transition-all border-b border-slate-50 last:border-0 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-full shadow-sm transition-transform group-hover:scale-110 ${t.type === "income" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                        {getCategoryIcon(t.type, t.category)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 leading-tight">{t.note || t.category}</p>
                        <p className="text-xs text-slate-400 font-bold mt-1">
                          {filter === "year" 
                            ? dayjs(t.transactionDate).tz("Asia/Bangkok").format("D MMM HH:mm น.")
                            : filter === "day"
                            ? dayjs(t.transactionDate).tz("Asia/Bangkok").format("HH:mm น.")
                            : dayjs(t.transactionDate).tz("Asia/Bangkok").format("D MMM YYYY HH:mm น.")
                          } • <span className="text-[#42646D]">{t.category}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className={`font-bold text-xl tracking-tight ${t.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>
                        {t.type === "income" ? "+" : "-"}฿{t.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                      <TransactionActions transaction={t} onRefresh={refreshData} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}
