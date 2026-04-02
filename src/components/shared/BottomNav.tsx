"use client"
import Link from 'next/link'
import { Home, BarChart2 } from 'lucide-react'
import { usePathname } from 'next/navigation'

export function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="md:hidden fixed bottom-0 left-0 z-50 w-full border-t border-slate-100 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.02)] h-[88px] pb-safe rounded-t-3xl flex justify-around items-center px-4">
      <Link href="/" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname === '/' ? 'text-slate-800' : 'text-slate-400'}`}>
        <div className={`p-2.5 rounded-2xl ${pathname === '/' ? 'bg-slate-100' : 'bg-transparent'}`}>
            <Home className="h-8 w-8 stroke-[2.5]" />
        </div>
        <span className="text-sm font-semibold">หน้าหลัก</span>
      </Link>
      <Link href="/summary" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname === '/summary' ? 'text-slate-800' : 'text-slate-400'}`}>
        <div className={`p-2.5 rounded-2xl ${pathname === '/summary' ? 'bg-[#DDEBFA]' : 'bg-transparent'}`}>
            <BarChart2 className="h-8 w-8 stroke-[2.5]" />
        </div>
        <span className="text-sm font-semibold">สรุปผล</span>
      </Link>
    </div>
  )
}
