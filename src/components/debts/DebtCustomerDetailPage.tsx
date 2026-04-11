"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Check, CircleDollarSign, Phone, Plus, User } from "lucide-react";

import { DebtActions } from "@/components/debts/DebtActions";
import { DebtFormModal } from "@/components/debts/DebtFormModal";
import { EmptyState } from "@/components/shared/EmptyState";
import dayjs from "@/lib/dayjs";
import { Debt, DebtCustomerDetailResponse } from "@/types/debt";

interface DebtCustomerDetailPageProps {
  customerKey: string;
}

function getStatusStyles(status: Debt["status"]) {
  if (status === "PAID") {
    return "border border-emerald-100 bg-emerald-50 text-emerald-700";
  }

  return "border border-amber-100 bg-amber-50 text-amber-700";
}

function formatCurrency(amount: number) {
  return `฿${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function DebtCustomerDetailPage({ customerKey }: Readonly<DebtCustomerDetailPageProps>) {
  const [data, setData] = useState<DebtCustomerDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDebtOpen, setIsAddDebtOpen] = useState(false);

  const fetchCustomer = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/debt-customers/${encodeURIComponent(customerKey)}`);
      const payload = (await response.json().catch(() => null)) as unknown;

      if (!response.ok) {
        const message =
          payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
            ? payload.error
            : "Failed to fetch customer detail";

        throw new Error(message);
      }

      setData(payload as DebtCustomerDetailResponse);
    } catch (fetchError) {
      console.error("Failed to fetch customer detail", fetchError);
      setData(null);
      setError(fetchError instanceof Error ? fetchError.message : "Failed to fetch customer detail");
    } finally {
      setLoading(false);
    }
  }, [customerKey]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  if (loading) {
    return (
      <div className="animate-in slide-in-from-right-4 flex flex-col gap-5 pb-8 pt-2 duration-500">
        <div className="h-10 w-40 animate-shimmer rounded-full" />
        <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
          <div className="space-y-4">
            <div className="h-6 w-56 animate-shimmer rounded-full" />
            <div className="h-4 w-40 animate-shimmer rounded-full" />
            <div className="grid gap-3 lg:grid-cols-3">
              <div className="h-36 animate-shimmer rounded-[1.75rem]" />
              <div className="h-36 animate-shimmer rounded-[1.75rem]" />
              <div className="h-36 animate-shimmer rounded-[1.75rem]" />
            </div>
          </div>
        </div>
        {[1, 2].map((item) => (
          <div
            key={item}
            className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-[0_2px_15px_rgba(0,0,0,0.02)]"
          >
            <div className="space-y-3">
              <div className="h-5 w-40 animate-shimmer rounded-full" />
              <div className="h-4 w-52 animate-shimmer rounded-full" />
              <div className="h-4 w-32 animate-shimmer rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="animate-in slide-in-from-right-4 flex flex-col gap-5 pb-8 pt-2 duration-500">
        <Link
          href="/debts"
          className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-100 transition-colors hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับไปหน้าหนี้ลูกค้า
        </Link>
        <div className="rounded-[2rem] border border-slate-100 bg-white shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
          <EmptyState
            title="ไม่พบข้อมูลลูกค้ารายนี้"
            description={error ?? "ข้อมูลลูกค้าอาจถูกลบไปแล้ว หรือคีย์ของหน้ารายละเอียดไม่ถูกต้อง"}
          />
        </div>
      </div>
    );
  }

  const { customer, debts } = data;

  return (
    <>
      <div className="animate-in slide-in-from-right-4 flex flex-col gap-5 pb-8 pt-2 duration-500">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/debts"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-100 transition-colors hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับไปหน้าหนี้ลูกค้า
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-4 py-2 text-sm font-bold ${getStatusStyles(customer.status)}`}>
              {customer.status === "UNPAID" ? "ยังค้างชำระ" : "จ่ายครบแล้ว"}
            </span>
            <button
              type="button"
              onClick={() => setIsAddDebtOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-[#B7791F] px-4 py-2 text-sm font-bold text-white shadow-md shadow-amber-500/20 transition-colors hover:bg-[#9B6418]"
            >
              <Plus className="h-4 w-4" />
              เพิ่มหนี้ให้ลูกค้าคนนี้
            </button>
          </div>
        </div>

        <div className="rounded-[2rem] border border-amber-100 bg-gradient-to-br from-[#FFF5E8] via-[#FFF9F0] to-white p-5 shadow-[0_10px_30px_rgba(180,120,31,0.08)] lg:p-6">
          <div className="space-y-5">
            <div className="space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#B7791F] shadow-sm">
                <User className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h1 className="break-words text-3xl font-extrabold leading-tight text-[#6F4A12] lg:text-4xl">
                  {customer.customerName}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-[#8E6C39]">
                  <Phone className="h-4 w-4" />
                  <span>{customer.customerPhone}</span>
                </div>
                <p className="max-w-3xl text-sm font-medium leading-7 text-[#9B7A49]">
                  ดูประวัติการติดหนี้และการชำระของลูกค้ารายนี้แบบรวมศูนย์ พร้อมเพิ่มรายการใหม่หรือรับชำระจากหน้าเดียว
                </p>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
              <div className="rounded-[1.75rem] border border-white/90 bg-white px-5 py-4 shadow-[0_10px_24px_rgba(148,92,13,0.08)]">
                <p className="text-sm font-extrabold text-slate-400">ยอดค้างปัจจุบัน</p>
                <div
                  className={`mt-4 break-words text-3xl font-extrabold leading-none ${
                    customer.unpaidTotal > 0 ? "text-[#C65D00]" : "text-emerald-600"
                  }`}
                >
                  {formatCurrency(customer.unpaidTotal)}
                </div>
                <div className="mt-5 inline-flex rounded-full bg-[#FFF3DE] px-4 py-2 text-sm font-bold text-[#C65D00]">
                  {customer.unpaidCount} รายการที่ยังค้าง
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-white/90 bg-white px-5 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                <p className="text-sm font-extrabold text-slate-400">ยอดหนี้รวม</p>
                <div className="mt-4 break-words text-3xl font-extrabold leading-none text-slate-800">
                  {formatCurrency(customer.totalAmount)}
                </div>
                <div className="mt-5 inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">
                  {customer.debts.length} รายการทั้งหมด
                </div>
              </div>

              <div className="rounded-[1.75rem] bg-[#8A5B12] px-5 py-4 text-white shadow-[0_16px_30px_rgba(111,74,18,0.2)]">
                <p className="text-sm font-extrabold text-white/80">จ่ายแล้ว</p>
                <div className="mt-4 break-words text-3xl font-extrabold leading-none">
                  {formatCurrency(customer.paidTotal)}
                </div>
                <div className="mt-5 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white">
                  {customer.paidCount} รายการที่ปิดแล้ว
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/70 bg-white/75 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <Calendar className="h-4 w-4" />
                <span>ติดหนี้ล่าสุด {dayjs(customer.latestDebtDate).tz("Asia/Bangkok").format("D MMM YYYY HH:mm น.")}</span>
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-white/70 bg-white/75 px-4 py-3">
              {customer.latestPaidAt ? (
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                  <Check className="h-4 w-4" />
                  <span>ชำระล่าสุด {dayjs(customer.latestPaidAt).tz("Asia/Bangkok").format("D MMM YYYY HH:mm น.")}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                  <Check className="h-4 w-4" />
                  <span>ยังไม่มีประวัติการชำระ</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">รายการหนี้ของลูกค้ารายนี้</h2>
              <p className="text-sm font-medium text-slate-500">
                เรียงรายการค้างขึ้นก่อน และสามารถกดรับชำระได้จากแต่ละรายการโดยตรง
              </p>
            </div>
            <div className="rounded-full border border-slate-100 bg-white px-3 py-1 text-xs font-bold text-slate-500 shadow-sm">
              {debts.length} รายการ
            </div>
          </div>

          <div className="space-y-3">
            {debts.map((debt, index) => (
              <div
                key={debt.id}
                className={`stagger-${Math.min(index + 1, 5)} animate-slide-up rounded-[2rem] border border-slate-100 bg-white p-5 opacity-0 shadow-[0_2px_15px_rgba(0,0,0,0.02)] md:p-6`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusStyles(debt.status)}`}>
                        {debt.status === "PAID" ? "จ่ายแล้ว" : "ค้างจ่าย"}
                      </span>
                      <span className="text-2xl font-extrabold text-[#6F4A12]">{formatCurrency(debt.amount)}</span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[1.5rem] bg-slate-50 px-4 py-3">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                          <CircleDollarSign className="h-4 w-4" />
                          วันที่ติดหนี้
                        </div>
                        <p className="mt-2 text-sm font-bold text-slate-700">
                          {dayjs(debt.debtDate).tz("Asia/Bangkok").format("D MMM YYYY HH:mm น.")}
                        </p>
                      </div>

                      <div className="rounded-[1.5rem] bg-slate-50 px-4 py-3">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                          <Check className="h-4 w-4" />
                          วันที่ชำระ
                        </div>
                        <p className={`mt-2 text-sm font-bold ${debt.paidAt ? "text-emerald-600" : "text-slate-500"}`}>
                          {debt.paidAt ? dayjs(debt.paidAt).tz("Asia/Bangkok").format("D MMM YYYY HH:mm น.") : "ยังไม่ชำระ"}
                        </p>
                      </div>
                    </div>

                    {debt.note ? (
                      <div className="rounded-[1.5rem] border border-slate-100 bg-[#FCFCFA] px-4 py-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">หมายเหตุ</p>
                        <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">{debt.note}</p>
                      </div>
                    ) : null}
                  </div>

                  <DebtActions debt={debt} onRefresh={fetchCustomer} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DebtFormModal
        isOpen={isAddDebtOpen}
        initialCustomer={{
          id: customer.customerId,
          name: customer.customerName,
          phone: customer.customerPhone,
        }}
        onClose={() => {
          setIsAddDebtOpen(false);
          fetchCustomer();
        }}
      />
    </>
  );
}
