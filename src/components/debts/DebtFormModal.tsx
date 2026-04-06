"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import dayjs from "@/lib/dayjs";
import { Debt } from "@/types/debt";

interface DebtFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: Debt | null;
}

interface DebtFormState {
  customerName: string;
  customerPhone: string;
  amount: string;
  date: string;
  time: string;
  note: string;
}

const FIELD_IDS = {
  customerName: "debt-customer-name",
  customerPhone: "debt-customer-phone",
  amount: "debt-amount",
  date: "debt-date",
  time: "debt-time",
  note: "debt-note",
} as const;

function getDefaultFormState(): DebtFormState {
  const now = dayjs().tz("Asia/Bangkok");

  return {
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
  const [formData, setFormData] = useState<DebtFormState>(getDefaultFormState);

  useEffect(() => {
    if (!isOpen) return;

    if (editData) {
      const debtDate = dayjs(editData.debtDate).tz("Asia/Bangkok");

      setFormData({
        customerName: editData.customerName,
        customerPhone: editData.customerPhone,
        amount: editData.amount.toString(),
        date: debtDate.format("YYYY-MM-DD"),
        time: debtDate.format("HH:mm"),
        note: editData.note || "",
      });
      return;
    }

    setFormData(getDefaultFormState());
  }, [editData, isOpen]);

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formData.customerName.trim()) {
      toast.error("กรุณากรอกชื่อลูกค้า");
      return;
    }

    if (!formData.customerPhone.trim()) {
      toast.error("กรุณากรอกเบอร์ลูกค้า");
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error("กรุณากรอกยอดหนี้ให้มากกว่า 0");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(editData ? `/api/debts/${editData.id}` : "/api/debts", {
        method: editData ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.customerName.trim(),
          customerPhone: formData.customerPhone.trim(),
          amount: Number(formData.amount),
          note: formData.note.trim(),
          debtDate: `${formData.date}T${formData.time}:00+07:00`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save debt");
      }

      toast.success(editData ? "แก้ไขข้อมูลลูกหนี้แล้ว" : "เพิ่มรายการหนี้แล้ว");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("บันทึกรายการหนี้ไม่สำเร็จ");
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl bg-[#FAFAFA] rounded-3xl p-4 md:p-6 border-0 shadow-lg max-h-[96vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold text-center text-slate-800">
            {dialogTitle}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor={FIELD_IDS.customerName} className="text-sm font-bold text-slate-600">ชื่อลูกค้า</label>
              <input
                id={FIELD_IDS.customerName}
                type="text"
                required
                placeholder="เช่น สมชาย ใจดี"
                className="w-full bg-white border border-slate-100 rounded-xl p-4 text-base font-semibold text-slate-700 outline-none focus:border-amber-500 shadow-sm"
                value={formData.customerName}
                onChange={(event) => setFormData({ ...formData, customerName: event.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor={FIELD_IDS.customerPhone} className="text-sm font-bold text-slate-600">เบอร์โทร</label>
              <input
                id={FIELD_IDS.customerPhone}
                type="tel"
                required
                placeholder="08x-xxx-xxxx"
                className="w-full bg-white border border-slate-100 rounded-xl p-4 text-base font-semibold text-slate-700 outline-none focus:border-amber-500 shadow-sm"
                value={formData.customerPhone}
                onChange={(event) => setFormData({ ...formData, customerPhone: event.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor={FIELD_IDS.amount} className="text-sm font-bold text-slate-600">ยอดหนี้ (บาท)</label>
            <input
              id={FIELD_IDS.amount}
              type="number"
              min="0"
              step="0.01"
              required
              placeholder="0.00"
              className="w-full text-4xl xs:text-5xl md:text-6xl font-extrabold text-slate-800 border-none bg-white rounded-2xl p-4 md:p-5 shadow-sm focus:ring-2 focus:ring-amber-500 transition-all outline-none"
              value={formData.amount}
              onChange={(event) => setFormData({ ...formData, amount: event.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label htmlFor={FIELD_IDS.date} className="text-sm font-bold text-slate-600">วันที่ติดหนี้</label>
              <input
                id={FIELD_IDS.date}
                type="date"
                required
                className="w-full bg-white border border-slate-100 rounded-xl p-4 text-base font-semibold text-slate-700 outline-none focus:border-amber-500 shadow-sm"
                value={formData.date}
                onChange={(event) => setFormData({ ...formData, date: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor={FIELD_IDS.time} className="text-sm font-bold text-slate-600">เวลา</label>
              <input
                id={FIELD_IDS.time}
                type="time"
                required
                className="w-full bg-white border border-slate-100 rounded-xl p-4 text-base font-semibold text-slate-700 outline-none focus:border-amber-500 shadow-sm"
                value={formData.time}
                onChange={(event) => setFormData({ ...formData, time: event.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor={FIELD_IDS.note} className="text-sm font-bold text-slate-600">หมายเหตุ</label>
            <textarea
              id={FIELD_IDS.note}
              rows={4}
              placeholder="รายละเอียดเพิ่มเติม เช่น ของที่นำไปก่อน"
              className="w-full bg-white border border-slate-100 rounded-xl p-4 text-base text-slate-700 outline-none focus:border-amber-500 shadow-sm resize-none"
              value={formData.note}
              onChange={(event) => setFormData({ ...formData, note: event.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 md:mt-8 py-4 md:py-5 rounded-full font-bold text-white text-lg md:text-xl shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98] bg-[#B7791F] shadow-amber-500/30 hover:bg-[#9b6418]"
          >
            {submitLabel}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}