import prisma from "@/lib/prisma"
import { Banknote, Wallet, PiggyBank } from "lucide-react"

export async function SummaryCards() {
  const transactions = await prisma.transaction.findMany();
  
  let totalIncome = 0;
  let totalExpense = 0;
  
  transactions.forEach((t: { type: string; amount: number }) => {
    if (t.type === "income") totalIncome += t.amount;
    if (t.type === "expense") totalExpense += t.amount;
  });

  const balance = totalIncome - totalExpense;

  return (
    <div className="space-y-4 my-6">
      <div className="grid grid-cols-2 gap-4">
        {/* Income Card */}
        <div className="bg-white rounded-[1.75rem] p-5 shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-white relative overflow-hidden">
          <div className="absolute -left-4 -top-4 w-20 h-20 bg-[#EAF0F6] rounded-full blur-2xl opacity-70" />
          <div className="flex items-center gap-2 mb-3 relative z-10">
            <div className="bg-[#BCE3FB] p-2 rounded-full text-[#42646D]">
              <Banknote className="h-4 w-4 stroke-[2.5]" />
            </div>
            <span className="text-xs font-bold text-slate-600">รายรับทั้งหมด</span>
          </div>
          <div className="text-[1.35rem] font-bold text-[#42646D] relative z-10">฿ {totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>

        {/* Expense Card */}
        <div className="bg-white rounded-[1.75rem] p-5 shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-white relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-[#FCEAEA] rounded-full blur-2xl opacity-70" />
          <div className="flex items-center gap-2 mb-3 relative z-10">
            <div className="bg-[#F8D2D2] p-2 rounded-full text-[#A34E42]">
              <Wallet className="h-4 w-4 stroke-[2.5]" />
            </div>
            <span className="text-xs font-bold text-slate-600">รายจ่ายทั้งหมด</span>
          </div>
          <div className="text-[1.35rem] font-bold text-[#A34E42] relative z-10">฿ {totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      {/* Net Balance Card */}
      <div className="bg-[#42646D] rounded-[2rem] p-6 text-white shadow-lg relative overflow-hidden min-h-[140px] flex flex-col justify-center">
        <div className="absolute -right-8 -bottom-16 w-48 h-48 bg-white/10 rounded-full blur-md" />
        <div className="flex items-center gap-3 mb-2 relative z-10">
          <div className="bg-white/20 p-2 rounded-full text-white">
            <PiggyBank className="h-5 w-5 stroke-[2.5]" />
          </div>
          <span className="text-xs font-bold text-white/90">เงินคงเหลือสุทธิ</span>
        </div>
        <div className="text-[2.5rem] font-extrabold tracking-tight relative z-10">฿ {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        {balance > 0 && <p className="text-[11px] font-medium text-white/80 mt-1 relative z-10 tracking-tight">คุณประหยัดเงินได้ดีมาก!</p>}
      </div>
    </div>
  )
}
