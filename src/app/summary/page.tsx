"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, ChevronDown, Banknote, Wallet, PiggyBank, Download, ShoppingBag, Car, CircleDollarSign, ChartColumn, ChartPie } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { th } from "date-fns/locale"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import dayjs from "@/lib/dayjs"
import { TransactionActions } from "@/components/home/TransactionActions"
import { BackupPanel } from "@/components/summary/BackupPanel"
import { PaginationControls } from "@/components/shared/PaginationControls"

// dayjs locale and plugins are set in lib/dayjs

type FilterType = "day" | "month" | "year"
type ChartMode = "bar" | "pie"

interface SummaryData {
  totalIncome: number
  totalExpense: number
  balance: number
  categories: { name: string; amount: number; type: string }[]
  chartData: { label: string; income: number; expense: number }[]
  transactions: { id: number; type: string; amount: number; category: string; note: string | null; transactionDate: string }[]
  totalTransactionCount: number
}

function getCategoryIcon(type: string, category: string) {
  if (type === "income") return <Banknote className="h-5 w-5" />
  if (category.includes("อาหาร")) return <ShoppingBag className="h-5 w-5" />
  if (category.includes("เดินทาง") || category.includes("น้ำมัน")) return <Car className="h-5 w-5" />
  return <CircleDollarSign className="h-5 w-5" />
}

export default function SummaryPage() {
  const transactionsPerPage = 10
  const [filter, setFilter] = useState<FilterType>("month")
  const [currentDate, setCurrentDate] = useState(dayjs())
  const [data, setData] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [chartMode, setChartMode] = useState<ChartMode>("bar")
  const [transactionPage, setTransactionPage] = useState(1)

  const fetchSummary = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        filter,
        date: currentDate.format("YYYY-MM-DD"),
        page: transactionPage.toString(),
        pageSize: transactionsPerPage.toString(),
      })

      const res = await fetch(`/api/summary?${params.toString()}`)
      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error("Failed to fetch summary", err)
    } finally {
      setLoading(false)
    }
  }, [currentDate, filter, transactionPage])

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  useEffect(() => {
    setTransactionPage(1)
  }, [filter, currentDate])

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

  const pieData = [
    { name: "รายรับ", value: data?.totalIncome || 0, color: "#159A61" },
    { name: "รายจ่าย", value: data?.totalExpense || 0, color: "#FF1616" },
  ]

  const pieTotal = pieData.reduce((sum, item) => sum + item.value, 0)
  const totalExpenseForPercent = data?.categories
    .filter(category => category.type === "expense")
    .reduce((sum, category) => sum + category.amount, 0) || 1
  const totalIncomeForPercent = data?.categories
    .filter(category => category.type === "income")
    .reduce((sum, category) => sum + category.amount, 0) || 1
  const totalTransactionCount = data?.totalTransactionCount || 0
  const totalTransactionPages = Math.max(1, Math.ceil(totalTransactionCount / transactionsPerPage))
  const transactionRangeStart = totalTransactionCount ? (transactionPage - 1) * transactionsPerPage + 1 : 0
  const transactionRangeEnd = totalTransactionCount
    ? Math.min(transactionPage * transactionsPerPage, totalTransactionCount)
    : 0

  useEffect(() => {
    if (transactionPage > totalTransactionPages) {
      setTransactionPage(totalTransactionPages)
    }
  }, [transactionPage, totalTransactionPages])

  const formatBarTooltipLabel = (label: string | number) => {
    if (filter === "year") {
      return dayjs(`${currentDate.year()}-${String(label).padStart(2, "0")}-01`).format("MMM YYYY")
    }

    return dayjs(`${currentDate.format("YYYY-MM")}-${String(label).padStart(2, "0")}`).format("D/MM/YY")
  }

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

        <BackupPanel onRestoreSuccess={refreshData} />
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
                <div className="text-xl xs:text-2xl lg:text-3xl font-bold text-emerald-600 relative z-10">
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
                <div className="text-xl xs:text-2xl lg:text-3xl font-bold text-rose-600 relative z-10">
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
              <div className="text-3xl xs:text-4xl md:text-5xl font-extrabold tracking-tight relative z-10">
                ฿ {data.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              {data.balance > 0 && <p className="text-sm font-medium text-white/80 mt-1 relative z-10 tracking-tight">คุณประหยัดเงินได้ดีมาก!</p>}
            </div>
          </div>

          <div className="mb-6 space-y-4">
            <div className="flex flex-wrap justify-end gap-3">
              <button
                onClick={() => setChartMode("bar")}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-extrabold shadow-[0_8px_16px_rgba(0,0,0,0.18)] transition-all ${
                  chartMode === "bar" ? "bg-[#D3D4D7] text-slate-900" : "bg-white text-slate-900 hover:bg-slate-50"
                }`}
              >
                <ChartColumn className="h-5 w-5" />
                <span>แผนภูมิแท่ง</span>
              </button>
              <button
                onClick={() => setChartMode("pie")}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-extrabold shadow-[0_8px_16px_rgba(0,0,0,0.18)] transition-all ${
                  chartMode === "pie" ? "bg-[#D3D4D7] text-slate-900" : "bg-white text-slate-900 hover:bg-slate-50"
                }`}
              >
                <ChartPie className="h-5 w-5" />
                <span>แผนภูมิวงกลม</span>
              </button>
            </div>

            <div className="rounded-[2.25rem] border border-slate-200 bg-white/95 p-4 md:p-6 shadow-[0_6px_18px_rgba(15,23,42,0.1)]">
              {chartMode === "bar" ? (
                filter === "day" ? (
                  <div className="flex min-h-[300px] items-center justify-center rounded-[1.75rem] bg-[#F8F7F2] text-center">
                    <div className="space-y-2 px-6">
                      <p className="text-lg font-extrabold text-slate-800">แผนภูมิแท่งใช้ได้กับมุมมองเดือนและปี</p>
                      <p className="text-sm font-medium text-slate-500">เปลี่ยนตัวกรองด้านบนเป็นเดือนหรือปีเพื่อดูกราฟเปรียบเทียบรายรับและรายจ่าย</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-[320px] md:h-[340px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.chartData} barGap={8} barCategoryGap="28%" margin={{ top: 14, right: 12, left: 0, bottom: 0 }}>
                        <CartesianGrid vertical={false} stroke="#E9E5DB" />
                        <XAxis
                          dataKey="label"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#292524", fontSize: 12, fontWeight: 500 }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          width={46}
                          tick={{ fill: "#292524", fontSize: 12, fontWeight: 500 }}
                          tickFormatter={(value) => `฿${value >= 1000 ? `${Math.round(value / 1000)}k` : value}`}
                        />
                        <Tooltip
                          cursor={{ fill: "rgba(0,0,0,0)" }}
                          content={({ active, label, payload }) => {
                            if (!active || !payload || payload.length === 0) return null

                            const items = payload.filter(
                              (item): item is typeof item & { value: number; color: string; dataKey: string } =>
                                typeof item.value === "number" && item.value > 0 && typeof item.color === "string" && typeof item.dataKey === "string"
                            )

                            if (items.length === 0) return null

                            return (
                              <div className="space-y-3">
                                {items.map(item => (
                                  <div
                                    key={item.dataKey}
                                    className="min-w-[104px] rounded-[1.6rem] border border-slate-200 bg-white px-4 py-3 shadow-[0_10px_22px_rgba(15,23,42,0.16)]"
                                  >
                                    <p className="text-sm font-semibold text-slate-900">{formatBarTooltipLabel(label ?? "")}</p>
                                    <p className="mt-1 text-[1.05rem] font-extrabold" style={{ color: item.color }}>
                                      ฿{item.value.toLocaleString()}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )
                          }}
                        />
                        <Bar dataKey="income" fill="#159A61" radius={[999, 999, 0, 0]} maxBarSize={filter === "month" ? 8 : 22} />
                        <Bar dataKey="expense" fill="#FF1616" radius={[999, 999, 0, 0]} maxBarSize={filter === "month" ? 8 : 22} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )
              ) : pieTotal === 0 ? (
                <div className="flex min-h-[300px] items-center justify-center rounded-[1.75rem] bg-[#F8F7F2] text-center">
                  <div className="space-y-2 px-6">
                    <p className="text-lg font-extrabold text-slate-800">ยังไม่มีข้อมูลสำหรับแผนภูมิวงกลม</p>
                    <p className="text-sm font-medium text-slate-500">เพิ่มรายการรายรับหรือรายจ่ายก่อน แล้วค่อยกลับมาดูสัดส่วนในช่วงเวลานี้</p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_220px] md:items-center">
                  <div className="h-[320px] md:h-[360px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip
                          formatter={(value) => [`฿${Number(value ?? 0).toLocaleString()}`, ""]}
                          contentStyle={{ borderRadius: "20px", border: "1px solid #E7E5E4", boxShadow: "0 12px 24px rgba(15,23,42,0.12)" }}
                        />
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={140}
                          stroke="#1D86FF"
                          strokeWidth={2}
                          labelLine={false}
                          label={({ cx, cy, midAngle, innerRadius, outerRadius, name, percent }: {
                            cx?: number
                            cy?: number
                            midAngle?: number
                            innerRadius?: number
                            outerRadius?: number
                            name?: string
                            percent?: number
                          }) => {
                            if (
                              typeof cx !== "number" ||
                              typeof cy !== "number" ||
                              typeof midAngle !== "number" ||
                              typeof innerRadius !== "number" ||
                              typeof outerRadius !== "number" ||
                              typeof name !== "string" ||
                              !percent
                            ) {
                              return null
                            }

                            const radius = innerRadius + (outerRadius - innerRadius) * 0.55
                            const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180)
                            const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180)

                            return (
                              <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="middle" className="text-xl font-extrabold">
                                {name}
                              </text>
                            )
                          }}
                        >
                          {pieData.map(item => (
                            <Cell key={item.name} fill={item.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-8 px-4 md:px-0">
                    {pieData.map(item => {
                      const percent = pieTotal === 0 ? 0 : Math.round((item.value / pieTotal) * 100)

                      return (
                        <div key={item.name} className="flex items-center gap-4">
                          <div className="h-4 w-4 rounded-full" style={{ backgroundColor: item.color }} />
                          <p className="text-2xl font-extrabold text-slate-900">
                            {item.name} {percent}%
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mb-6 rounded-[2rem] bg-[#F5F4F1] p-6 shadow-inner">
            <h3 className="mb-5 text-[1.15rem] font-extrabold tracking-tight text-slate-800">เปรียบเทียบตามหมวดหมู่</h3>
            {data.categories.length === 0 ? (
              <p className="py-8 text-center text-sm font-medium italic text-slate-400">ยังไม่มีข้อมูลสำหรับการเปรียบเทียบ</p>
            ) : (
              <div className="space-y-6">
                <div className="space-y-5">
                  {data.categories.filter(category => category.type === "expense").map(category => {
                    const percent = Math.round((category.amount / totalExpenseForPercent) * 100)
                    const color = CATEGORY_COLORS[category.name] || "#94a3b8"

                    return (
                      <div key={`expense-${category.name}`} className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="h-3.5 w-3.5 rounded-full shadow-sm" style={{ backgroundColor: color }} />
                            <span className="text-sm font-bold text-slate-700">{category.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-800">฿{category.amount.toLocaleString()}</span>
                            <span className="rounded-full border border-slate-100 bg-white/70 px-2 py-0.5 text-[10px] font-extrabold text-slate-400">{percent}%</span>
                          </div>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full border border-slate-100 bg-slate-200/60 shadow-inner">
                          <div
                            className="h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                            style={{ width: `${percent}%`, backgroundColor: color }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                {data.categories.some(category => category.type === "income") && (
                  <div className="space-y-5 border-t border-slate-200/80 pt-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">หมวดหมู่รายรับ</h4>
                    {data.categories.filter(category => category.type === "income").map(category => {
                      const percent = Math.round((category.amount / totalIncomeForPercent) * 100)
                      const color = CATEGORY_COLORS[category.name] || "#6EE7B7"

                      return (
                        <div key={`income-${category.name}`} className="space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <div className="h-3.5 w-3.5 rounded-full shadow-sm" style={{ backgroundColor: color }} />
                              <span className="text-sm font-bold text-slate-700">{category.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-emerald-600">฿{category.amount.toLocaleString()}</span>
                              <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-500">{percent}%</span>
                            </div>
                          </div>
                          <div className="h-3 overflow-hidden rounded-full border border-slate-100 bg-slate-200/60 shadow-inner">
                            <div
                              className="h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                              style={{ width: `${percent}%`, backgroundColor: color }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Full Transaction List */}
          <div className="bg-white rounded-[2rem] p-6 shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-white">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-extrabold text-slate-800 text-lg tracking-tight">
                รายการล่าสุด {totalTransactionCount > 0 ? `(แสดง ${transactionRangeStart}-${transactionRangeEnd} จาก ${totalTransactionCount})` : ""}
              </h3>
              <div className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                {totalTransactionCount} รายการ
              </div>
            </div>
            
            {data.transactions.length === 0 ? (
              <p className="text-center text-slate-400 py-10 text-sm font-medium italic">ไม่มีรายการธุรกรรมในช่วงเวลานี้</p>
            ) : (
              <div className="space-y-2">
                {data.transactions.map((t) => (
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

            <PaginationControls
              currentPage={transactionPage}
              totalPages={totalTransactionPages}
              onPageChange={setTransactionPage}
            />
          </div>
        </>
      ) : null}
    </div>
  )
}
