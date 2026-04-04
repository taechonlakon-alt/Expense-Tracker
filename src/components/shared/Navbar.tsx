"use client"
import { Lock, KeyRound } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/shared/AuthProvider"

export function Navbar() {
  const { logout, changePin } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full bg-transparent px-4 py-4">
      <div className="mx-auto flex h-14 max-w-2xl items-center gap-4 bg-white">
        <div className="flex flex-1 items-center justify-between">
          <span className="font-bold text-slate-700 text-xl">
            <Link href="/" className="hover:text-slate-900 transition-colors">อู่สะกลการช่าง รายรับ-รายจ่าย</Link>
          </span>
          <div className="flex items-center gap-2">
            <nav className="hidden md:flex items-center gap-6 text-base font-semibold text-slate-500 mr-2">
              <Link href="/" className="hover:text-slate-900 transition-colors">หน้าหลัก</Link>
              <Link href="/summary" className="hover:text-slate-900 transition-colors">สรุปผล</Link>
            </nav>
            <button
              onClick={changePin}
              className="p-2.5 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all active:scale-95 border border-slate-100"
              title="เปลี่ยนรหัสผ่าน"
            >
              <KeyRound className="h-5 w-5 stroke-[2.5]" />
            </button>
            <button
              onClick={logout}
              className="p-2.5 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all active:scale-95 border border-slate-100"
              title="ล็อกแอป"
            >
              <Lock className="h-5 w-5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
