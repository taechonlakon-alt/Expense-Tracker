"use client";

import { useEffect, useMemo, useState } from "react";
import { Phone, Search } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { findPotentialCustomerMatches, type CustomerMatch, type CustomerMatchKind } from "@/lib/customer-match";
import dayjs from "@/lib/dayjs";
import { Customer, CustomerListResponse, Debt } from "@/types/debt";

interface DebtFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: Debt | null;
  initialCustomer?: Pick<Customer, "id" | "name" | "phone"> | null;
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
  customerName: "debt-customer-name",
  customerPhone: "debt-customer-phone",
  amount: "debt-amount",
  date: "debt-date",
  time: "debt-time",
  note: "debt-note",
} as const;

function formatCurrency(amount: number) {
  return `฿${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

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

function getMatchBadgeLabel(kind: CustomerMatchKind) {
  if (kind === "exact-name-phone") return "ชื่อและเบอร์ตรงกัน";
  if (kind === "exact-name") return "ชื่อซ้ำ";
  if (kind === "phone-match") return "เบอร์ซ้ำ";
  return "ชื่อใกล้เคียง";
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

export function DebtFormModal({
  isOpen,
  onClose,
  editData,
  initialCustomer = null,
}: Readonly<DebtFormModalProps>) {
  const [loading, setLoading] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
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

    if (initialCustomer) {
      setFormData({
        ...getDefaultFormState(),
        customerMode: "existing",
        customerSearch: "",
        customerId: initialCustomer.id.toString(),
        customerName: initialCustomer.name,
        customerPhone: initialCustomer.phone,
      });
      return;
    }

    setFormData(getDefaultFormState());
  }, [editData, initialCustomer, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setIsConfirmOpen(false);
    }
  }, [isOpen]);

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
      return;
    }

    setFormData((current) => {
      if (current.customerMode !== "existing") {
        return current;
      }

      const requestedCustomerId = current.customerId || initialCustomer?.id?.toString() || customers[0].id.toString();
      const hasCustomer = customers.some((customer) => customer.id.toString() === requestedCustomerId);

      if (hasCustomer) {
        return {
          ...current,
          customerId: requestedCustomerId,
        };
      }

      return {
        ...current,
        customerId: customers[0].id.toString(),
      };
    });
  }, [customers, editData, initialCustomer, isOpen, loadingCustomers]);

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id.toString() === formData.customerId) ?? null,
    [customers, formData.customerId]
  );

  const activeCustomer = selectedCustomer ?? (formData.customerId === initialCustomer?.id?.toString() ? initialCustomer : null);

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

    return findPotentialCustomerMatches(
      customers,
      {
        name: formData.customerName,
        phone: formData.customerPhone,
      },
      { limit: 4 }
    );
  }, [customers, formData.customerMode, formData.customerName, formData.customerPhone]);

  const customerWarningMessage = useMemo(() => {
    if (potentialCustomerMatches.length === 0) {
      return null;
    }

    return getCustomerWarningMessage(potentialCustomerMatches);
  }, [potentialCustomerMatches]);

  const summaryCustomerName =
    formData.customerMode === "existing"
      ? activeCustomer?.name || "ยังไม่ได้เลือกลูกค้า"
      : formData.customerName.trim() || "ยังไม่ได้กรอกชื่อลูกค้า";

  const summaryCustomerPhone =
    formData.customerMode === "existing"
      ? activeCustomer?.phone || "ยังไม่ได้เลือกเบอร์"
      : formData.customerPhone.trim() || "ยังไม่ได้กรอกเบอร์";

  const summaryAmount =
    formData.amount && Number(formData.amount) > 0 ? formatCurrency(Number(formData.amount)) : "ยังไม่ได้กรอกยอด";

  const summaryDateTime = useMemo(() => {
    if (!formData.date || !formData.time) {
      return "ยังไม่ได้เลือกวันเวลา";
    }

    const value = dayjs(`${formData.date}T${formData.time}:00+07:00`);
    if (!value.isValid()) {
      return "วันเวลาไม่ถูกต้อง";
    }

    return value.tz("Asia/Bangkok").format("D MMM YYYY HH:mm น.");
  }, [formData.date, formData.time]);

  function selectExistingCustomer(customer: Pick<Customer, "id" | "name" | "phone">) {
    setFormData((current) => ({
      ...current,
      customerMode: "existing",
      customerId: customer.id.toString(),
      customerSearch: customer.name,
      customerName: customer.name,
      customerPhone: customer.phone,
    }));
  }

  function validateForm() {
    if (formData.customerMode === "existing" && !formData.customerId) {
      toast.error("กรุณาเลือกลูกค้า");
      return false;
    }

    if (formData.customerMode === "new" && !formData.customerName.trim()) {
      toast.error("กรุณากรอกชื่อลูกค้า");
      return false;
    }

    if (formData.customerMode === "new" && !formData.customerPhone.trim()) {
      toast.error("กรุณากรอกเบอร์ลูกค้า");
      return false;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error("กรุณากรอกยอดหนี้ให้มากกว่า 0");
      return false;
    }

    return true;
  }

  async function handleConfirmSave() {
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
      setIsConfirmOpen(false);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "บันทึกรายการหนี้ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsConfirmOpen(true);
  }

  const dialogTitle = editData ? "แก้ไขหนี้ลูกค้า" : "เพิ่มหนี้ลูกค้า";
  const hasCustomers = customers.length > 0;
  const visibleCustomers = filteredCustomers.slice(0, 8);
  const submitLabel = editData ? "ตรวจสอบการแก้ไข" : "ตรวจสอบก่อนบันทึก";
  const confirmLabel = loading ? "กำลังบันทึก..." : editData ? "ยืนยันการแก้ไข" : "ยืนยันบันทึก";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[96vh] overflow-y-auto rounded-3xl border-0 bg-white p-0 shadow-lg sm:max-w-2xl">
        <DialogHeader className="border-b border-slate-100 bg-[#FFF9F3] px-5 pb-5 pt-6 md:px-6">
          <DialogTitle className="text-2xl font-extrabold text-slate-800">{dialogTitle}</DialogTitle>
          <p className="mt-2 text-sm font-medium text-slate-500">กรอกข้อมูลที่จำเป็นแล้วบันทึกได้เลย</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-4 py-5 md:px-6 md:py-6">
          <section className="space-y-4 rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-sm">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-800">ลูกค้า</h3>
              <p className="text-sm font-medium text-slate-500">เลือกจากรายชื่อเดิม หรือสร้างใหม่ถ้ายังไม่มี</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label
                htmlFor={FIELD_IDS.customerModeExisting}
                className={`rounded-[1.35rem] border px-4 py-4 transition-colors ${
                  formData.customerMode === "existing"
                    ? "border-[#B7791F] bg-[#FFF8ED]"
                    : "border-slate-200 bg-slate-50"
                } ${!hasCustomers ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
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
                      customerId: current.customerId || initialCustomer?.id?.toString() || customers[0]?.id?.toString() || "",
                    }))
                  }
                />
                <p className="text-base font-extrabold text-slate-800">ใช้ลูกค้าเดิม</p>
                <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                  ค้นหาจากชื่อหรือเบอร์ แล้วแตะเลือกจากรายชื่อในระบบ
                </p>
              </label>

              <label
                htmlFor={FIELD_IDS.customerModeNew}
                className={`cursor-pointer rounded-[1.35rem] border px-4 py-4 transition-colors ${
                  formData.customerMode === "new"
                    ? "border-[#B7791F] bg-[#FFF8ED]"
                    : "border-slate-200 bg-slate-50"
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
                <p className="text-base font-extrabold text-slate-800">สร้างลูกค้าใหม่</p>
                <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                  ใช้เมื่อยังไม่เคยบันทึกลูกค้าคนนี้ในระบบมาก่อน
                </p>
              </label>
            </div>

            {formData.customerMode === "existing" ? (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="debt-customer-search"
                    type="text"
                    placeholder="ค้นหาชื่อลูกค้าหรือเบอร์โทร"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-amber-400 focus:bg-white"
                    value={formData.customerSearch}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        customerSearch: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-slate-700">
                    {loadingCustomers ? "กำลังโหลดรายชื่อลูกค้า..." : `พบ ${filteredCustomers.length.toLocaleString()} รายชื่อ`}
                  </p>
                  {activeCustomer ? (
                    <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                      เลือกอยู่: {activeCustomer.name}
                    </div>
                  ) : null}
                </div>

                {hasCustomers && filteredCustomers.length > 0 ? (
                  <div className="space-y-2 rounded-[1.5rem] bg-slate-50/80 p-2">
                    {visibleCustomers.map((customer) => {
                      const isActive = customer.id.toString() === formData.customerId;

                      return (
                        <button
                          key={customer.id}
                          type="button"
                          onClick={() => selectExistingCustomer(customer)}
                          className={`flex w-full items-center justify-between gap-3 rounded-[1.2rem] border px-4 py-3 text-left transition-colors ${
                            isActive
                              ? "border-[#B7791F] bg-white shadow-sm"
                              : "border-transparent bg-white/70 hover:border-slate-200 hover:bg-white"
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-extrabold text-slate-800">{customer.name}</p>
                            <div className="mt-1 flex items-center gap-2 text-xs font-medium text-slate-500">
                              <Phone className="h-3.5 w-3.5" />
                              <span>{customer.phone}</span>
                            </div>
                          </div>
                          {isActive ? (
                            <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                              กำลังใช้
                            </div>
                          ) : (
                            <span className="text-xs font-bold text-slate-400">เลือก</span>
                          )}
                        </button>
                      );
                    })}

                    {filteredCustomers.length > visibleCustomers.length ? (
                      <p className="px-2 pt-1 text-xs font-medium text-slate-500">
                        แสดง {visibleCustomers.length} รายชื่อแรก ลองพิมพ์ค้นหาเพิ่มเพื่อเจอคนที่ต้องการเร็วขึ้น
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm font-medium text-slate-500">
                    {loadingCustomers
                      ? "กำลังดึงรายชื่อลูกค้า..."
                      : hasCustomers
                        ? "ไม่พบลูกค้าที่ตรงกับคำค้น ลองเปลี่ยนคำค้นหรือสลับไปสร้างลูกค้าใหม่"
                        : "ยังไม่มีรายชื่อลูกค้าในระบบ ระบบจะพาไปโหมดสร้างลูกค้าใหม่ให้อัตโนมัติ"}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
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
                      className="w-full rounded-xl border border-slate-100 bg-slate-50 p-4 text-base font-semibold text-slate-700 outline-none shadow-sm focus:border-amber-500 focus:bg-white"
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
                      className="w-full rounded-xl border border-slate-100 bg-slate-50 p-4 text-base font-semibold text-slate-700 outline-none shadow-sm focus:border-amber-500 focus:bg-white"
                      value={formData.customerPhone}
                      onChange={(event) => setFormData((current) => ({ ...current, customerPhone: event.target.value }))}
                    />
                  </div>
                </div>

                {customerWarningMessage ? (
                  <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50/90 p-4 text-sm text-amber-900">
                    <p className="font-bold">{customerWarningMessage}</p>
                    <p className="mt-1 text-xs font-medium text-amber-800">
                      ถ้าเป็นลูกค้าเดิม แนะนำให้เปลี่ยนมาเลือกจากรายชื่อด้านล่างแทน
                    </p>
                    <div className="mt-3 space-y-2">
                      {potentialCustomerMatches.map((match) => (
                        <div
                          key={`${match.customer.id}-${match.kind}`}
                          className="flex flex-col gap-3 rounded-[1.2rem] bg-white/90 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="text-sm font-extrabold text-slate-800">{match.customer.name}</p>
                            <p className="mt-1 text-xs font-medium text-slate-500">{match.customer.phone}</p>
                            <p className="mt-2 inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800">
                              {getMatchBadgeLabel(match.kind)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => selectExistingCustomer(match.customer)}
                            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-slate-700"
                          >
                            ใช้ลูกค้านี้แทน
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </section>

          <section className="space-y-4 rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-sm">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-800">รายละเอียดหนี้</h3>
              <p className="text-sm font-medium text-slate-500">ใส่ยอด วันที่ และเวลาที่บันทึกรายการ</p>
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
                className="w-full rounded-[1.7rem] border-none bg-[#FFF8ED] p-4 text-4xl font-extrabold text-slate-800 shadow-sm outline-none transition-all focus:ring-2 focus:ring-amber-500 md:p-5 md:text-5xl"
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
                  className="w-full rounded-xl border border-slate-100 bg-slate-50 p-4 text-base font-semibold text-slate-700 outline-none shadow-sm focus:border-amber-500 focus:bg-white"
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
                  className="w-full rounded-xl border border-slate-100 bg-slate-50 p-4 text-base font-semibold text-slate-700 outline-none shadow-sm focus:border-amber-500 focus:bg-white"
                  value={formData.time}
                  onChange={(event) => setFormData((current) => ({ ...current, time: event.target.value }))}
                />
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-sm">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-800">หมายเหตุ</h3>
              <p className="text-sm font-medium text-slate-500">ใส่เพิ่มเติมเฉพาะถ้าจำเป็น</p>
            </div>

            <div className="space-y-2">
              <label htmlFor={FIELD_IDS.note} className="text-sm font-bold text-slate-600">
                หมายเหตุ
              </label>
              <textarea
                id={FIELD_IDS.note}
                rows={4}
                placeholder="รายละเอียดเพิ่มเติม เช่น ของที่นำไปก่อน หรือเงื่อนไขที่ตกลงกัน"
                className="w-full resize-none rounded-xl border border-slate-100 bg-slate-50 p-4 text-base text-slate-700 outline-none shadow-sm focus:border-amber-500 focus:bg-white"
                value={formData.note}
                onChange={(event) => setFormData((current) => ({ ...current, note: event.target.value }))}
              />
            </div>
          </section>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-full bg-[#B7791F] py-4 text-lg font-bold text-white shadow-md shadow-amber-500/30 transition-transform hover:scale-[1.01] hover:bg-[#9B6418] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 md:py-5 md:text-xl"
          >
            {submitLabel}
          </button>
        </form>
      </DialogContent>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent className="gap-6 rounded-[2rem] border-0 bg-white p-6 shadow-lg sm:max-w-lg">
          <AlertDialogHeader className="space-y-3">
            <AlertDialogTitle className="text-center text-xl font-bold text-slate-800">
              {editData ? "ยืนยันการแก้ไขรายการหนี้" : "ยืนยันบันทึกรายการหนี้"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center font-medium text-slate-500">
              ตรวจสอบข้อมูลอีกครั้งก่อนบันทึกจริง
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1rem] bg-slate-50 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">ลูกค้า</p>
              <p className="mt-2 text-base font-extrabold text-slate-800">{summaryCustomerName}</p>
              <p className="mt-1 text-sm font-medium text-slate-500">{summaryCustomerPhone}</p>
            </div>
            <div className="rounded-[1rem] bg-slate-50 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">ยอดหนี้</p>
              <p className="mt-2 text-2xl font-extrabold text-[#6F4A12]">{summaryAmount}</p>
            </div>
            <div className="rounded-[1rem] bg-slate-50 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">วันเวลาที่บันทึก</p>
              <p className="mt-2 text-sm font-bold text-slate-700">{summaryDateTime}</p>
            </div>
            <div className="rounded-[1rem] bg-slate-50 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">หมายเหตุ</p>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                {formData.note.trim() || "ไม่มีหมายเหตุเพิ่มเติม"}
              </p>
            </div>
          </div>

          <AlertDialogFooter className="gap-3 sm:justify-center">
            <AlertDialogCancel
              disabled={loading}
              className="w-full rounded-full border-slate-200 py-6 font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700 sm:w-auto"
            >
              กลับไปแก้ไข
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleConfirmSave();
              }}
              disabled={loading}
              className="w-full rounded-full bg-[#B7791F] py-6 font-bold text-white shadow-md shadow-amber-500/20 hover:bg-[#9B6418] sm:w-auto"
            >
              {confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
