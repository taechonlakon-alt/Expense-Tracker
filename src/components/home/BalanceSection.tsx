import prisma from "@/lib/prisma"

export async function BalanceSection() {
  const transactions = await prisma.transaction.findMany();
  
  let totalIncome = 0;
  let totalExpense = 0;
  
  transactions.forEach((t: { type: string; amount: number }) => {
    if (t.type === "income") totalIncome += t.amount;
    if (t.type === "expense") totalExpense += t.amount;
  });

  const balance = totalIncome - totalExpense;
  const hasData = transactions.length > 0;

  return (
    <div className="flex flex-col items-center py-6 text-center space-y-5 animate-slide-up">
      <div className="space-y-1 w-full flex flex-col items-start px-2">
        <h2 className="text-sm font-semibold text-slate-500">ยอดเงินคงเหลือปัจจุบัน</h2>
        <div className={`text-[3.25rem] leading-none font-extrabold tracking-tight transition-colors duration-500 ${balance >= 0 ? 'text-[#42646D]' : 'text-[#A34E42]'}`}>
          ฿{balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        {!hasData && (
          <p className="text-xs text-slate-400 font-medium mt-1 animate-pulse">เริ่มต้นบันทึกข้อมูลเพื่อดูยอดคงเหลือ</p>
        )}
      </div>
      
      <div className="flex items-center gap-3 text-sm w-full px-2">
        <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-sm border border-slate-100 transition-transform hover:scale-105">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-slate-600 font-medium">รายรับเดือนนี้: <span className="font-semibold">+฿{totalIncome.toLocaleString()}</span></span>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-sm border border-slate-100 transition-transform hover:scale-105">
          <div className="h-2 w-2 rounded-full bg-rose-500" />
          <span className="text-slate-600 font-medium">รายจ่ายเดือนนี้: <span className="font-semibold">-฿{totalExpense.toLocaleString()}</span></span>
        </div>
      </div>
    </div>
  )
}
