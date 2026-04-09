"use client";

import { useCallback, useDeferredValue, useEffect, useState } from "react";
import { Calendar, Check, ChevronDown, ChevronUp, CircleDollarSign, Phone, Plus, Search, User, Users } from "lucide-react";
import Link from "next/link";

import { DebtActions } from "@/components/debts/DebtActions";
import { DebtFormModal } from "@/components/debts/DebtFormModal";
import { EmptyState } from "@/components/shared/EmptyState";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { buildDebtCustomerPath } from "@/lib/debt-customers";
import dayjs from "@/lib/dayjs";
import { Debt, DebtCustomerSummary, DebtListResponse, DebtStats } from "@/types/debt";

type DebtView = "unpaid-customers" | "paid-customers" | "all-debts";

const VIEW_FILTERS: Array<{ label: string; value: DebtView }> = [
  { label: "ลูกค้าค้างจ่าย", value: "unpaid-customers" },
  { label: "ลูกค้าจ่ายครบ", value: "paid-customers" },
  { label: "รายการหนี้", value: "all-debts" },
];

const EMPTY_STATS: DebtStats = { unpaidCount: 0, unpaidTotal: 0, unpaidCustomerCount: 0, paidCustomerCount: 0 };

function getStatusStyles(status: Debt["status"]) {
  if (status === "PAID") {
    return "bg-emerald-50 text-emerald-700 border border-emerald-100";
  }

  return "bg-amber-50 text-amber-700 border border-amber-100";
}

function formatCurrency(amount: number) {
  return `฿${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function DebtsPage() {
  const itemsPerPage = 10;
  const [debts, setDebts] = useState<Debt[]>([]);
  const [customerSummaries, setCustomerSummaries] = useState<DebtCustomerSummary[]>([]);
  const [stats, setStats] = useState<DebtStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<DebtView>("unpaid-customers");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedCustomerKey, setExpandedCustomerKey] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const deferredSearch = useDeferredValue(search);

  const fetchDebts = useCallback(async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.set("status", "all");
      params.set("view", view);
      params.set("page", currentPage.toString());
      params.set("pageSize", itemsPerPage.toString());

      if (deferredSearch.trim()) {
        params.set("search", deferredSearch.trim());
      }

      const response = await fetch(`/api/debts?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch debts");
      }

      const data = (await response.json()) as DebtListResponse;
      setDebts(Array.isArray(data.debts) ? data.debts : []);
      setCustomerSummaries(Array.isArray(data.customerSummaries) ? data.customerSummaries : []);
      setStats(data.stats ?? EMPTY_STATS);
      setTotalCount(Number.isFinite(data.totalCount) ? data.totalCount : 0);
    } catch (error) {
      console.error("Failed to fetch debts", error);
      setDebts([]);
      setCustomerSummaries([]);
      setStats(EMPTY_STATS);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, deferredSearch, itemsPerPage, view]);

  useEffect(() => {
    fetchDebts();
  }, [fetchDebts]);

  useEffect(() => {
    setCurrentPage(1);
    setExpandedCustomerKey(null);
  }, [deferredSearch, view]);

  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const listTitle =
    view === "unpaid-customers"
      ? "ลูกค้ายังค้างจ่าย"
      : view === "paid-customers"
        ? "ลูกค้าที่จ่ายครบแล้ว"
        : "รายการหนี้ทั้งหมด";

  const listCount = totalCount;

  return (
    <div className="flex flex-col gap-5 pt-2 pb-8 animate-in slide-in-from-right-4 duration-500">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 rounded-[2rem] border border-amber-100 bg-gradient-to-br from-[#FFF5E8] via-[#FFF9F0] to-white p-5 shadow-[0_10px_30px_rgba(180,120,31,0.08)]">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-extrabold text-[#6F4A12] lg:text-4xl">หนี้ลูกค้า</h1>
              <p className="text-sm font-medium text-[#9B7A49]">
                แยกลูกค้าที่ยังค้างจ่ายกับลูกค้าที่จ่ายครบแล้วให้ดูได้ชัดเจนในหน้าเดียว
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#B7791F] px-4 py-3 text-sm font-bold text-white shadow-md shadow-amber-500/20 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              เพิ่มหนี้
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white bg-white/80 p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">ยอดค้างรวม</p>
              <div className="mt-2 text-3xl font-extrabold text-amber-700">{formatCurrency(stats.unpaidTotal)}</div>
              <div className="mt-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                {stats.unpaidCount} รายการค้างจ่าย
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-white bg-white/80 p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">ลูกค้ายังค้าง</p>
              <div className="mt-2 flex items-end justify-between gap-4">
                <div className="text-3xl font-extrabold text-slate-800">{stats.unpaidCustomerCount}</div>
                <div className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-600">
                  ต้องติดตามต่อ
                </div>
              </div>
            </div>
            <div className="rounded-[1.5rem] bg-[#6F4A12] p-4 text-white shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-white/70">ลูกค้าจ่ายครบ</p>
              <div className="mt-2 flex items-end justify-between gap-4">
                <div className="text-3xl font-extrabold">{stats.paidCustomerCount}</div>
                <div className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white/90">
                  ปิดหนี้แล้ว
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-[2rem] border border-slate-100 bg-white p-4 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
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
            {VIEW_FILTERS.map((item) => (
              <button
                key={item.value}
                onClick={() => setView(item.value)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${
                  view === item.value
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

      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800">{listTitle}</h2>
            <p className="text-sm font-medium text-slate-500">
              {view === "all-debts"
                ? "ดูรายละเอียดระดับรายการหนี้แต่ละบิล"
                : "สรุปภาพรวมระดับลูกค้า พร้อมกดดูรายการหนี้ของแต่ละคนได้"}
            </p>
          </div>
          <div className="rounded-full border border-slate-100 bg-white px-3 py-1 text-xs font-bold text-slate-500 shadow-sm">
            {listCount} {view === "all-debts" ? "รายการ" : "ลูกค้า"}
          </div>
        </div>

        {loading ? (
          [1, 2, 3].map((index) => (
            <div key={index} className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-40 animate-shimmer rounded-full" />
                  <div className="h-4 w-28 animate-shimmer rounded-full" />
                  <div className="h-4 w-48 animate-shimmer rounded-full" />
                </div>
                <div className="h-9 w-9 animate-shimmer rounded-full" />
              </div>
            </div>
          ))
        ) : listCount === 0 ? (
          <div className="rounded-[2rem] border border-slate-100 bg-white shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
            <EmptyState
              title={
                view === "unpaid-customers"
                  ? "ยังไม่มีลูกค้าที่ค้างจ่าย"
                  : view === "paid-customers"
                    ? "ยังไม่มีลูกค้าที่จ่ายครบ"
                    : "ยังไม่มีรายการหนี้ลูกค้า"
              }
              description={
                deferredSearch.trim()
                  ? "ลองเปลี่ยนคำค้นหา หรือเคลียร์ช่องค้นหาเพื่อดูข้อมูลเพิ่มเติม"
                  : "เริ่มบันทึกรายการค้างจ่ายของลูกค้าได้จากปุ่มเพิ่มหนี้ด้านบน"
              }
            />
          </div>
        ) : view === "all-debts" ? (
          <div className="space-y-3">
            {debts.map((debt, index) => (
              <div
                key={debt.id}
                className={`rounded-[2rem] border border-slate-100 bg-white p-5 shadow-[0_2px_15px_rgba(0,0,0,0.02)] opacity-0 animate-slide-up stagger-${Math.min(index + 1, 5)} md:p-6`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-700">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={buildDebtCustomerPath(debt.customerId)}
                          className="truncate text-lg font-extrabold text-slate-800 transition-colors hover:text-[#B7791F]"
                        >
                          {debt.customerName}
                        </Link>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">
                          <Phone className="h-4 w-4" />
                          <span>{debt.customerPhone}</span>
                        </div>
                        <Link
                          href={buildDebtCustomerPath(debt.customerId)}
                          className="mt-2 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 transition-colors hover:bg-amber-50 hover:text-amber-700"
                        >
                          ดูประวัติลูกค้า
                        </Link>
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
                        <p className="mt-2 text-2xl font-extrabold text-[#6F4A12]">{formatCurrency(debt.amount)}</p>
                      </div>
                      <div className="space-y-2 rounded-[1.5rem] bg-slate-50 px-4 py-3">
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
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {customerSummaries.map((customer, index) => {
              const isExpanded = expandedCustomerKey === customer.key;

              return (
                <div
                  key={customer.key}
                  className={`rounded-[2rem] border border-slate-100 bg-white p-5 shadow-[0_2px_15px_rgba(0,0,0,0.02)] opacity-0 animate-slide-up stagger-${Math.min(index + 1, 5)} md:p-6`}
                >
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex min-w-0 items-start gap-4">
                        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${
                          customer.status === "UNPAID" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                        }`}>
                          <Users className="h-6 w-6" />
                        </div>
                        <div className="min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={buildDebtCustomerPath(customer.customerId)}
                              className="truncate text-xl font-extrabold text-slate-800 transition-colors hover:text-[#B7791F]"
                            >
                              {customer.customerName}
                            </Link>
                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusStyles(customer.status)}`}>
                              {customer.status === "UNPAID" ? "ยังค้างจ่าย" : "จ่ายครบแล้ว"}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">
                            <Phone className="h-4 w-4" />
                            <span>{customer.customerPhone}</span>
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs font-bold">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                              ทั้งหมด {customer.debts.length} รายการ
                            </span>
                            <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                              ค้าง {customer.unpaidCount} รายการ
                            </span>
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                              จ่ายแล้ว {customer.paidCount} รายการ
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 md:min-w-[300px]">
                        <div className="rounded-[1.35rem] bg-slate-50 px-4 py-3">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">ยอดค้าง</p>
                          <p className={`mt-2 text-2xl font-extrabold ${
                            customer.unpaidTotal > 0 ? "text-amber-700" : "text-emerald-600"
                          }`}>
                            {formatCurrency(customer.unpaidTotal)}
                          </p>
                        </div>
                        <div className="rounded-[1.35rem] bg-slate-50 px-4 py-3">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">ยอดหนี้รวม</p>
                          <p className="mt-2 text-2xl font-extrabold text-[#6F4A12]">
                            {formatCurrency(customer.totalAmount)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-slate-100 bg-[#FCFCFA] px-4 py-3">
                      <div className="space-y-1 text-sm font-medium text-slate-500">
                        <p>ติดหนี้ล่าสุด {dayjs(customer.latestDebtDate).tz("Asia/Bangkok").format("D MMM YYYY HH:mm น.")}</p>
                        <p>
                          {customer.latestPaidAt
                            ? `ชำระล่าสุด ${dayjs(customer.latestPaidAt).tz("Asia/Bangkok").format("D MMM YYYY HH:mm น.")}`
                            : "ยังไม่มีประวัติการชำระ"}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={buildDebtCustomerPath(customer.customerId)}
                          className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700 transition-colors hover:bg-amber-100"
                        >
                          ดูประวัติลูกค้า
                        </Link>
                        <button
                          type="button"
                          onClick={() => setExpandedCustomerKey(isExpanded ? null : customer.key)}
                          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#6F4A12] shadow-sm ring-1 ring-slate-100 transition-colors hover:bg-slate-50"
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          {isExpanded ? "ซ่อนรายการหนี้" : "ดูรายการหนี้"}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="space-y-3 rounded-[1.75rem] border border-slate-100 bg-slate-50/70 p-4">
                        {customer.debts.map((debt) => (
                          <div
                            key={debt.id}
                            className="rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0 flex-1 space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusStyles(debt.status)}`}>
                                    {debt.status === "PAID" ? "จ่ายแล้ว" : "ค้างจ่าย"}
                                  </span>
                                  <span className="text-lg font-extrabold text-[#6F4A12]">{formatCurrency(debt.amount)}</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">
                                  <Calendar className="h-4 w-4" />
                                  <span>ติดหนี้เมื่อ {dayjs(debt.debtDate).tz("Asia/Bangkok").format("D MMM YYYY HH:mm น.")}</span>
                                </div>
                                {debt.paidAt && (
                                  <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-emerald-600">
                                    <Check className="h-4 w-4" />
                                    <span>จ่ายเมื่อ {dayjs(debt.paidAt).tz("Asia/Bangkok").format("D MMM YYYY HH:mm น.")}</span>
                                  </div>
                                )}
                                {debt.note && (
                                  <p className="text-sm font-medium leading-relaxed text-slate-600">{debt.note}</p>
                                )}
                              </div>

                              <DebtActions debt={debt} onRefresh={fetchDebts} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

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
