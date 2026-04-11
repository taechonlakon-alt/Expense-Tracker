"use client"
import Link from 'next/link'
import { BarChart2, CircleDollarSign, Home } from 'lucide-react'
import { usePathname } from 'next/navigation'

export function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="md:hidden fixed bottom-0 left-0 z-50 w-full border-t border-slate-100 bg-white/95 backdrop-blur-md shadow-[0_-2px_16px_rgba(0,0,0,0.04)] h-[68px] pb-safe rounded-t-2xl flex justify-around items-center px-2">
      <Link href="/" className={`flex flex-col items-center justify-center w-full h-full space-y-0.5 ${pathname === '/' ? 'text-slate-800' : 'text-slate-400'}`}>
        <div className={`p-1.5 rounded-xl ${pathname === '/' ? 'bg-slate-100' : 'bg-transparent'}`}>
          <Home className="h-6 w-6 stroke-[2.5]" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-tighter">หน้าหลัก</span>
      </Link>
      <Link href="/summary" className={`flex flex-col items-center justify-center w-full h-full space-y-0.5 ${pathname === '/summary' ? 'text-slate-800' : 'text-slate-400'}`}>
        <div className={`p-1.5 rounded-xl ${pathname === '/summary' ? 'bg-[#DDEBFA]' : 'bg-transparent'}`}>
          <BarChart2 className="h-6 w-6 stroke-[2.5]" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-tighter">สรุปผล</span>
      </Link>
      <Link href="/debts" className={`flex flex-col items-center justify-center w-full h-full space-y-0.5 ${pathname === '/debts' ? 'text-[#6F4A12]' : 'text-slate-400'}`}>
        <div className={`p-1.5 rounded-xl ${pathname === '/debts' ? 'bg-[#F7E7C7]' : 'bg-transparent'}`}>
          <CircleDollarSign className="h-6 w-6 stroke-[2.5]" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-tighter">หนี้ลูกค้า</span>
      </Link>
    </div>
  )
}

