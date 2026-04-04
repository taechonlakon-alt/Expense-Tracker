import prisma from "@/lib/prisma"
import { ShoppingBag, Banknote, Car, CircleDollarSign } from "lucide-react"
import Link from "next/link"
import dayjs from "@/lib/dayjs"
import { TransactionActions } from "./TransactionActions"
import { EmptyState } from "../shared/EmptyState"

// dayjs locale and plugins are set in lib/dayjs

function getCategoryIcon(type: string, category: string) {
  if (type === "income") return <Banknote className="h-5 w-5" />
  if (category.includes("อาหาร")) return <ShoppingBag className="h-5 w-5" />
  if (category.includes("เดินทาง") || category.includes("น้ำมัน")) return <Car className="h-5 w-5" />
  return <CircleDollarSign className="h-5 w-5" />
}

export async function RecentTransactionList() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { transactionDate: 'desc' },
    take: 5
  });

  return (
    <div className="mt-6 space-y-4 px-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800">รายการล่าสุด</h3>
        <Link href="/summary" className="text-sm font-semibold text-[#42646D] hover:text-[#2c444a] transition-colors">
          ดูทั้งหมด &rarr;
        </Link>
      </div>

      <div className="space-y-3">
        {transactions.length === 0 ? (
          <EmptyState 
            title="ยังไม่มีรายการ" 
            description="เริ่มต้นบันทึกรายรับรายจ่ายของคุณ ด้วยการกดปุ่มด้านบนเลย!" 
          />
        ) : transactions.map((t: { id: number; type: string; amount: number; note: string | null; category: string; transactionDate: Date }, index: number) => (
          <div key={t.id} className={`flex items-center justify-between rounded-3xl bg-white p-4 px-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-50 transition-all hover:shadow-md opacity-0 animate-slide-up stagger-${Math.min(index + 1, 5)}`}>
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-transform hover:scale-110 ${t.type === 'income' ? 'bg-[#EAF0F6] text-[#42646D]' : 'bg-[#EEF2F0] text-slate-600'}`}>
                {getCategoryIcon(t.type, t.category)}
              </div>
              <div>
                <p className="font-bold text-slate-800">{t.note || t.category}</p>
                <p className="text-xs font-medium text-slate-400 mt-0.5">{dayjs(t.transactionDate).tz("Asia/Bangkok").format('DD MMM HH:mm น.')} • {t.category}</p>
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
              <TransactionActions transaction={t} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
