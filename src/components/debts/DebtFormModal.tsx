"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { findPotentialCustomerMatches, type CustomerMatch } from "@/lib/customer-match";
import dayjs from "@/lib/dayjs";
import { Customer, CustomerListResponse, Debt } from "@/types/debt";

interface DebtFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: Debt | null;
}

type CustomerMode = "existing" | "new";

interface DebtFormState {
  customerMode: CustomerMode;
  customerSearch: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  amount: string;
  date: string;
  time: string;
  note: string;
}

const FIELD_IDS = {
  customerModeExisting: "debt-customer-mode-existing",
  customerModeNew: "debt-customer-mode-new",
  customerSelect: "debt-customer-select",
  customerName: "debt-customer-name",
  customerPhone: "debt-customer-phone",
  amount: "debt-amount",
  date: "debt-date",
  time: "debt-time",
  note: "debt-note",
} as const;

function getCustomerWarningMessage(matches: CustomerMatch<Customer>[]) {
  if (matches.some((match) => match.kind === "exact-name-phone")) {
    return "พบลูกค้าในระบบที่ชื่อและเบอร์ตรงกัน ระบบจะใช้ข้อมูลลูกค้าเดิมให้โดยอัตโนมัติ";
  }

  if (matches.some((match) => match.kind === "exact-name")) {
    return "พบชื่อลูกค้าที่ซ้ำกับข้อมูลเดิมในระบบ ควรตรวจสอบก่อนบันทึก";
  }

  if (matches.some((match) => match.kind === "phone-match")) {
    return "พบเบอร์โทรที่มีอยู่ในระบบแล้ว อาจเป็นลูกค้าคนเดิม";
  }

  return "พบชื่อลูกค้าที่ใกล้เคียงกับข้อมูลเดิมในระบบ ลองตรวจสอบก่อนสร้างลูกค้าใหม่";
}

function getDefaultFormState(): DebtFormState {
  const now = dayjs().tz("Asia/Bangkok");

  return {
    customerMode: "existing",
    customerSearch: "",
    customerId: "",
    customerName: "",
    customerPhone: "",
    amount: "",
    date: now.format("YYYY-MM-DD"),
    time: now.format("HH:mm"),
    note: "",
  };
}

export function DebtFormModal({ isOpen, onClose, editData }: Readonly<DebtFormModalProps>) {
  const [loading, setLoading] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [formData, setFormData] = useState<DebtFormState>(getDefaultFormState);

  useEffect(() => {
    if (!isOpen) return;

    let ignore = false;

    async function fetchCustomers() {
      setLoadingCustomers(true);

      try {
        const response = await fetch("/api/customers");
        const payload = (await response.json().catch(() => null)) as unknown;

        if (!response.ok) {
          const message =
            payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
              ? payload.error
              : "Failed to fetch customers";

          throw new Error(message);
        }

        if (!ignore) {
          const nextCustomers =
            payload && typeof payload === "object" && "customers" in payload && Array.isArray(payload.customers)
              ? (payload.customers as CustomerListResponse["customers"])
              : [];

          setCustomers(nextCustomers);
        }
      } catch (error) {
        console.error(error);
        if (!ignore) {
          setCustomers([]);
          toast.error("โหลดรายชื่อลูกค้าไม่สำเร็จ");
        }
      } finally {
        if (!ignore) {
          setLoadingCustomers(false);
        }
      }
    }

    fetchCustomers();

    return () => {
      ignore = true;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    if (editData) {
      const debtDate = dayjs(editData.debtDate).tz("Asia/Bangkok");

      setFormData({
        customerMode: "existing",
        customerSearch: "",
        customerId: editData.customerId.toString(),
        customerName: editData.customerName,
        customerPhone: editData.customerPhone,
        amount: editData.amount.toString(),
        date: debtDate.format("YYYY-MM-DD"),
        time: debtDate.format("HH:mm"),
        note: editData.note || "",
      });
      return;
    }

    setFormData((current) => ({
      ...getDefaultFormState(),
      customerMode: current.customerMode,
      customerSearch: "",
      customerId: current.customerId,
    }));
  }, [editData, isOpen]);

  useEffect(() => {
    if (!isOpen || editData || customers.length === 0) {
      return;
    }

    setFormData((current) => {
      if (current.customerMode !== "existing" || current.customerId) {
        return current;
      }

      return {
        ...current,
        customerId: customers[0].id.toString(),
      };
    });
  }, [customers, editData, isOpen]);

  useEffect(() => {
    if (!isOpen || editData || loadingCustomers) {
      return;
    }

    if (customers.length === 0) {
      setFormData((current) => ({
        ...current,
        customerMode: "new",
        customerId: "",
      }));
    }
  }, [customers.length, editData, isOpen, loadingCustomers]);

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id.toString() === formData.customerId) ?? null,
    [customers, formData.customerId]
  );

  const filteredCustomers = useMemo(() => {
    const query = formData.customerSearch.trim().toLowerCase();

    if (!query) {
      return customers;
    }

    return customers.filter((customer) => {
      const name = customer.name.toLowerCase();
      const phone = customer.phone.toLowerCase();

      return name.includes(query) || phone.includes(query);
    });
  }, [customers, formData.customerSearch]);

  const potentialCustomerMatches = useMemo(() => {
    if (formData.customerMode !== "new") {
      return [];
    }

    return findPotentialCustomerMatches(customers, {
      name: formData.customerName,
      phone: formData.customerPhone,
    });
  }, [customers, formData.customerMode, formData.customerName, formData.customerPhone]);

  const customerWarningMessage = useMemo(() => {
    if (potentialCustomerMatches.length === 0) {
      return null;
    }

    return getCustomerWarningMessage(potentialCustomerMatches);
  }, [potentialCustomerMatches]);

  useEffect(() => {
    if (formData.customerMode !== "existing" || filteredCustomers.length === 0) {
      return;
    }

    const hasSelectedCustomer = filteredCustomers.some(
      (customer) => customer.id.toString() === formData.customerId
    );

    if (!hasSelectedCustomer) {
      setFormData((current) => ({
        ...current,
        customerId: filteredCustomers[0].id.toString(),
      }));
    }
  }, [filteredCustomers, formData.customerId, formData.customerMode]);

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (formData.customerMode === "existing" && !formData.customerId) {
      toast.error("กรุณาเลือกลูกค้า");
      return;
    }

    if (formData.customerMode === "new" && !formData.customerName.trim()) {
      toast.error("กรุณากรอกชื่อลูกค้า");
      return;
    }

    if (formData.customerMode === "new" && !formData.customerPhone.trim()) {
      toast.error("กรุณากรอกเบอร์ลูกค้า");
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error("กรุณากรอกยอดหนี้ให้มากกว่า 0");
      return;
    }

    setLoading(true);

    try {
      const payload =
        formData.customerMode === "existing"
          ? {
              customerId: Number(formData.customerId),
              amount: Number(formData.amount),
              note: formData.note.trim(),
              debtDate: `${formData.date}T${formData.time}:00+07:00`,
            }
          : {
              customerName: formData.customerName.trim(),
              customerPhone: formData.customerPhone.trim(),
              amount: Number(formData.amount),
              note: formData.note.trim(),
              debtDate: `${formData.date}T${formData.time}:00+07:00`,
            };

      const response = await fetch(editData ? `/api/debts/${editData.id}` : "/api/debts", {
        method: editData ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(typeof result?.error === "string" ? result.error : "Failed to save debt");
      }

      toast.success(editData ? "แก้ไขข้อมูลลูกหนี้แล้ว" : "เพิ่มรายการหนี้แล้ว");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "บันทึกรายการหนี้ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  const dialogTitle = editData ? "แก้ไขหนี้ลูกค้า" : "เพิ่มหนี้ลูกค้า";

  let submitLabel = "บันทึกรายการหนี้";
  if (loading) {
    submitLabel = "กำลังบันทึก...";
  } else if (editData) {
    submitLabel = "บันทึกการแก้ไข";
  }

  const hasCustomers = customers.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[96vh] overflow-y-auto rounded-3xl border-0 bg-[#FAFAFA] p-4 shadow-lg sm:max-w-xl md:p-6">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-extrabold text-slate-800">{dialogTitle}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-3 rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap gap-2">
              <label
                htmlFor={FIELD_IDS.customerModeExisting}
                className={`flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                  formData.customerMode === "existing"
                    ? "bg-[#6F4A12] text-white"
                    : "bg-slate-100 text-slate-600"
                } ${!hasCustomers ? "cursor-not-allowed opacity-50" : ""}`}
              >
                <input
                  id={FIELD_IDS.customerModeExisting}
                  type="radio"
                  name="customer-mode"
                  className="sr-only"
                  checked={formData.customerMode === "existing"}
                  disabled={!hasCustomers}
                  onChange={() =>
                    setFormData((current) => ({
                      ...current,
                      customerMode: "existing",
                      customerId: current.customerId || customers[0]?.id?.toString() || "",
                    }))
                  }
                />
                เลือกลูกค้าเดิม
              </label>

              <label
                htmlFor={FIELD_IDS.customerModeNew}
                className={`flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                  formData.customerMode === "new" ? "bg-[#B7791F] text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                <input
                  id={FIELD_IDS.customerModeNew}
                  type="radio"
                  name="customer-mode"
                  className="sr-only"
                  checked={formData.customerMode === "new"}
                  onChange={() =>
                    setFormData((current) => ({
                      ...current,
                      customerMode: "new",
                    }))
                  }
                />
                สร้างลูกค้าใหม่
              </label>
            </div>

            {formData.customerMode === "existing" ? (
              <div className="space-y-3">
                  <div className="space-y-2">
                  <label htmlFor="debt-customer-search" className="text-sm font-bold text-slate-600">
                    ค้นหาลูกค้าเดิม
                  </label>
                  <input
                    id="debt-customer-search"
                    type="text"
                    placeholder="ค้นหาชื่อหรือเบอร์โทร"
                    className="w-full rounded-xl border border-slate-100 bg-white p-4 text-base font-semibold text-slate-700 outline-none shadow-sm focus:border-amber-500"
                    value={formData.customerSearch}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        customerSearch: event.target.value,
                      }))
                    }
                  />
                </div>

                <label htmlFor={FIELD_IDS.customerSelect} className="text-sm font-bold text-slate-600">
                  ลูกค้าในระบบ
                </label>
                <select
                  id={FIELD_IDS.customerSelect}
                  className="w-full rounded-xl border border-slate-100 bg-white p-4 text-base font-semibold text-slate-700 outline-none focus:border-amber-500 shadow-sm"
                  disabled={loadingCustomers || !hasCustomers || filteredCustomers.length === 0}
                  value={formData.customerId}
                  onChange={(event) => setFormData((current) => ({ ...current, customerId: event.target.value }))}
                >
                  {!hasCustomers && <option value="">ยังไม่มีลูกค้าเดิม</option>}
                  {hasCustomers && filteredCustomers.length === 0 && <option value="">ไม่พบลูกค้าที่ค้นหา</option>}
                  {filteredCustomers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} ({customer.phone})
                    </option>
                  ))}
                </select>
                <p className="text-xs font-medium text-slate-500">
                  {loadingCustomers
                    ? "กำลังโหลดรายชื่อลูกค้า..."
                    : hasCustomers && filteredCustomers.length === 0
                      ? "ลองเปลี่ยนคำค้นหา หรือสลับไปสร้างลูกค้าใหม่"
                    : selectedCustomer
                      ? `ลูกค้าที่เลือก: ${selectedCustomer.name} • ${selectedCustomer.phone}`
                      : "เลือกลูกค้าจากข้อมูลที่มีอยู่แล้วในระบบ"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                  <label htmlFor={FIELD_IDS.customerName} className="text-sm font-bold text-slate-600">
                    ชื่อลูกค้า
                  </label>
                  <input
                    id={FIELD_IDS.customerName}
                    type="text"
                    required={formData.customerMode === "new"}
                    placeholder="เช่น สมชาย ใจดี"
                    className="w-full rounded-xl border border-slate-100 bg-white p-4 text-base font-semibold text-slate-700 outline-none shadow-sm focus:border-amber-500"
                    value={formData.customerName}
                    onChange={(event) => setFormData((current) => ({ ...current, customerName: event.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor={FIELD_IDS.customerPhone} className="text-sm font-bold text-slate-600">
                    เบอร์โทร
                  </label>
                  <input
                    id={FIELD_IDS.customerPhone}
                    type="tel"
                    required={formData.customerMode === "new"}
                    placeholder="08x-xxx-xxxx"
                    className="w-full rounded-xl border border-slate-100 bg-white p-4 text-base font-semibold text-slate-700 outline-none shadow-sm focus:border-amber-500"
                    value={formData.customerPhone}
                    onChange={(event) => setFormData((current) => ({ ...current, customerPhone: event.target.value }))}
                  />
                </div>
                </div>

                {customerWarningMessage ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-sm text-amber-900">
                    <p className="font-bold">{customerWarningMessage}</p>
                    <p className="mt-1 text-xs font-medium text-amber-800">
                      ถ้าเป็นลูกค้าเดิม แนะนำให้สลับไปใช้ตัวเลือกเลือกลูกค้าเดิมแทน
                    </p>
                    <ul className="mt-3 space-y-2">
                      {potentialCustomerMatches.map((match) => (
                        <li
                          key={`${match.customer.id}-${match.kind}`}
                          className="rounded-xl bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700"
                        >
                          {match.customer.name} ({match.customer.phone})
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor={FIELD_IDS.amount} className="text-sm font-bold text-slate-600">
              ยอดหนี้ (บาท)
            </label>
            <input
              id={FIELD_IDS.amount}
              type="number"
              min="0"
              step="1"
              required
              placeholder="0.00"
              className="w-full rounded-2xl border-none bg-white p-4 text-4xl font-extrabold text-slate-800 shadow-sm outline-none transition-all focus:ring-2 focus:ring-amber-500 md:p-5 md:text-6xl"
              value={formData.amount}
              onChange={(event) => setFormData((current) => ({ ...current, amount: event.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label htmlFor={FIELD_IDS.date} className="text-sm font-bold text-slate-600">
                วันที่ติดหนี้
              </label>
              <input
                id={FIELD_IDS.date}
                type="date"
                required
                className="w-full rounded-xl border border-slate-100 bg-white p-4 text-base font-semibold text-slate-700 outline-none shadow-sm focus:border-amber-500"
                value={formData.date}
                onChange={(event) => setFormData((current) => ({ ...current, date: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor={FIELD_IDS.time} className="text-sm font-bold text-slate-600">
                เวลา
              </label>
              <input
                id={FIELD_IDS.time}
                type="time"
                required
                className="w-full rounded-xl border border-slate-100 bg-white p-4 text-base font-semibold text-slate-700 outline-none shadow-sm focus:border-amber-500"
                value={formData.time}
                onChange={(event) => setFormData((current) => ({ ...current, time: event.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor={FIELD_IDS.note} className="text-sm font-bold text-slate-600">
              หมายเหตุ
            </label>
            <textarea
              id={FIELD_IDS.note}
              rows={4}
              placeholder="รายละเอียดเพิ่มเติม เช่น ของที่นำไปก่อน"
              className="w-full resize-none rounded-xl border border-slate-100 bg-white p-4 text-base text-slate-700 outline-none shadow-sm focus:border-amber-500"
              value={formData.note}
              onChange={(event) => setFormData((current) => ({ ...current, note: event.target.value }))}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-full bg-[#B7791F] py-4 text-lg font-bold text-white shadow-md shadow-amber-500/30 transition-transform hover:scale-[1.02] hover:bg-[#9b6418] active:scale-[0.98] md:mt-8 md:py-5 md:text-xl"
          >
            {submitLabel}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
