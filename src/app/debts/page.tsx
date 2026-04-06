"use client";

import { useCallback, useDeferredValue, useEffect, useState } from "react";
import { Calendar, Check, CircleDollarSign, Phone, Plus, Search, User } from "lucide-react";

import { DebtActions } from "@/components/debts/DebtActions";
import { DebtFormModal } from "@/components/debts/DebtFormModal";
import { EmptyState } from "@/components/shared/EmptyState";
import { PaginationControls } from "@/components/shared/PaginationControls";
import dayjs from "@/lib/dayjs";
import { Debt, DebtFilterStatus, DebtListResponse, DebtStats } from "@/types/debt";

const FILTERS: Array<{ label: string; value: DebtFilterStatus }> = [
  { label: "ทั้งหมด", value: "all" },
  { label: "ค้างจ่าย", value: "unpaid" },
  { label: "จ่ายแล้ว", value: "paid" },
];
const EMPTY_STATS: DebtStats = { unpaidCount: 0, unpaidTotal: 0 };

function getStatusStyles(status: Debt["status"]) {
  if (status === "PAID") {
    return "bg-emerald-50 text-emerald-700 border border-emerald-100";
  }

  return "bg-amber-50 text-amber-700 border border-amber-100";
}

export default function DebtsPage() {
  const debtsPerPage = 10;
  const [debts, setDebts] = useState<Debt[]>([]);
  const [stats, setStats] = useState<DebtStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<DebtFilterStatus>("all");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [debtPage, setDebtPage] = useState(1);
  const deferredSearch = useDeferredValue(search);

  const fetchDebts = useCallback(async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.set("status", filter);

      if (deferredSearch.trim()) {
        params.set("search", deferredSearch.trim());
      }

      const response = await fetch(`/api/debts?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch debts");
      }

      const data = (await response.json()) as DebtListResponse;
      setDebts(Array.isArray(data.debts) ? data.debts : []);
      setStats(data.stats ?? EMPTY_STATS);
    } catch (error) {
      console.error("Failed to fetch debts", error);
      setDebts([]);
      setStats(EMPTY_STATS);
    } finally {
      setLoading(false);
    }
  }, [deferredSearch, filter]);

  useEffect(() => {
    fetchDebts();
  }, [fetchDebts]);

  useEffect(() => {
    setDebtPage(1);
  }, [deferredSearch, filter]);

  const totalDebtPages = Math.max(1, Math.ceil(debts.length / debtsPerPage));
  const paginatedDebts = debts.slice((debtPage - 1) * debtsPerPage, debtPage * debtsPerPage);

  useEffect(() => {
    if (debtPage > totalDebtPages) {
      setDebtPage(totalDebtPages);
    }
  }, [debtPage, totalDebtPages]);

  return (
    <div className="flex flex-col gap-5 pt-2 pb-8 animate-in slide-in-from-right-4 duration-500">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 rounded-[2rem] bg-gradient-to-br from-[#FFF5E8] via-[#FFF9F0] to-white p-5 shadow-[0_10px_30px_rgba(180,120,31,0.08)] border border-amber-100">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl lg:text-4xl font-extrabold text-[#6F4A12]">หนี้ลูกค้า</h1>
              <p className="text-sm font-medium text-[#9B7A49]">
                บันทึกรายการค้างจ่ายของลูกค้าแยกจากรายรับรายจ่าย
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="shrink-0 inline-flex items-center gap-2 rounded-full bg-[#B7791F] px-4 py-3 text-sm font-bold text-white shadow-md shadow-amber-500/20 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              เพิ่มหนี้
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.5rem] bg-white/80 border border-white p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">ค้างจ่าย</p>
              <div className="mt-2 flex items-end justify-between gap-4">
                <div className="text-3xl font-extrabold text-amber-700">
                  ฿{stats.unpaidTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                  {stats.unpaidCount} รายการ
                </div>
              </div>
            </div>
            <div className="rounded-[1.5rem] bg-[#6F4A12] p-4 text-white shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-white/70">ที่แสดงอยู่ตอนนี้</p>
              <div className="mt-2 flex items-end justify-between gap-4">
                <div className="text-3xl font-extrabold">{debts.length}</div>
                <div className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white/90">
                  ตามตัวกรองที่เลือก
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-4 shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-slate-100 space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อลูกค้าหรือเบอร์โทร"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-amber-400 focus:bg-white"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {FILTERS.map((item) => (
              <button
                key={item.value}
                onClick={() => setFilter(item.value)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${
                  filter === item.value
                    ? "bg-[#6F4A12] text-white shadow-sm"
                    : "bg-[#F5EFE6] text-[#8A6A37] hover:bg-[#EEE2D1]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          [1, 2, 3].map((index) => (
            <div key={index} className="rounded-[2rem] bg-white p-5 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="h-5 w-40 animate-shimmer rounded-full" />
                  <div className="h-4 w-28 animate-shimmer rounded-full" />
                  <div className="h-4 w-48 animate-shimmer rounded-full" />
                </div>
                <div className="h-9 w-9 animate-shimmer rounded-full" />
              </div>
            </div>
          ))
        ) : debts.length === 0 ? (
          <div className="rounded-[2rem] bg-white border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
            <EmptyState
              title="ยังไม่มีรายการหนี้ลูกค้า"
              description="เริ่มบันทึกรายการค้างจ่ายของลูกค้าได้จากปุ่มเพิ่มหนี้ด้านบน"
            />
          </div>
        ) : (
          paginatedDebts.map((debt, index) => (
            <div
              key={debt.id}
              className={`rounded-[2rem] bg-white p-5 md:p-6 border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] opacity-0 animate-slide-up stagger-${Math.min(index + 1, 5)}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-4 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-700">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-lg font-extrabold text-slate-800 truncate">{debt.customerName}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">
                        <Phone className="h-4 w-4" />
                        <span>{debt.customerPhone}</span>
                      </div>
                    </div>
                    <span className={`ml-auto rounded-full px-3 py-1 text-xs font-bold ${getStatusStyles(debt.status)}`}>
                      {debt.status === "PAID" ? "จ่ายแล้ว" : "ค้างจ่าย"}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.5rem] bg-slate-50 px-4 py-3">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                        <CircleDollarSign className="h-4 w-4" />
                        ยอดหนี้
                      </div>
                      <p className="mt-2 text-2xl font-extrabold text-[#6F4A12]">
                        ฿{debt.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="rounded-[1.5rem] bg-slate-50 px-4 py-3 space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                        <Calendar className="h-4 w-4" />
                        <span>ติดหนี้เมื่อ {dayjs(debt.debtDate).tz("Asia/Bangkok").format("D MMM YYYY HH:mm น.")}</span>
                      </div>
                      {debt.paidAt && (
                        <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                          <Check className="h-4 w-4" />
                          <span>จ่ายเมื่อ {dayjs(debt.paidAt).tz("Asia/Bangkok").format("D MMM YYYY HH:mm น.")}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {debt.note && (
                    <div className="rounded-[1.5rem] border border-slate-100 bg-[#FCFCFA] px-4 py-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">หมายเหตุ</p>
                      <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">{debt.note}</p>
                    </div>
                  )}
                </div>

                <DebtActions debt={debt} onRefresh={fetchDebts} />
              </div>
            </div>
          ))
        )}
      </div>

      <PaginationControls
        currentPage={debtPage}
        totalPages={totalDebtPages}
        onPageChange={setDebtPage}
      />

      <DebtFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          fetchDebts();
        }}
      />
    </div>
  );
}

