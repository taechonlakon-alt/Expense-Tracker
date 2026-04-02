import { Menu } from "lucide-react"
import Link from "next/link"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-transparent px-4 py-4">
      <div className="mx-auto flex h-14 max-w-2xl items-center gap-4 bg-white">
        
        <div className="flex flex-1 items-center justify-between">
          <span className="font-bold text-slate-700 text-lg">
            <Link href="/" className="hover:text-slate-900 transition-colors">Simple Income & Expense Tracker</Link>
            </span>
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-500">
            <Link href="/" className="hover:text-slate-900 transition-colors">หน้าหลัก</Link>
            <Link href="/summary" className="hover:text-slate-900 transition-colors">สรุปผล</Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
