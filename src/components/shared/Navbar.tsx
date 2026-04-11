"use client"
import { CircleDollarSign, Lock, KeyRound } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/shared/AuthProvider"

export function Navbar() {
  const { logout, changePin } = useAuth();
  const pathname = usePathname();

  const linkClassName = (href: string) =>
    pathname === href ? "text-slate-900" : "hover:text-slate-900 transition-colors";

  return (
    <header className="sticky top-0 z-50 w-full bg-transparent px-3 sm:px-4 py-2 sm:py-4">
      <div className="mx-auto flex h-11 sm:h-14 max-w-2xl items-center gap-3 bg-white">
        <div className="flex flex-1 items-center justify-between">
          <span className="font-bold text-slate-700 text-base sm:text-xl truncate">
            <Link href="/" className="hover:text-slate-900 transition-colors">ติดตาม รายรับ-รายจ่าย</Link>
          </span>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <nav className="hidden md:flex items-center gap-6 text-base font-semibold text-slate-500 mr-2">
              <Link href="/" className={linkClassName("/")}>หน้าหลัก</Link>
              <Link href="/summary" className={linkClassName("/summary")}>สรุปผล</Link>
              <Link href="/debts" className={`inline-flex items-center gap-1.5 ${linkClassName("/debts")}`}>
                <CircleDollarSign className="h-4 w-4" />
                <span>หนี้ลูกค้า</span>
              </Link>
            </nav>
            <button
              onClick={changePin}
              className="p-2 sm:p-2.5 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all active:scale-95 border border-slate-100"
              title="เปลี่ยนรหัสผ่าน"
            >
              <KeyRound className="h-4 w-4 sm:h-5 sm:w-5 stroke-[2.5]" />
            </button>
            <button
              onClick={logout}
              className="p-2 sm:p-2.5 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all active:scale-95 border border-slate-100"
              title="ล็อกแอป"
            >
              <Lock className="h-4 w-4 sm:h-5 sm:w-5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

