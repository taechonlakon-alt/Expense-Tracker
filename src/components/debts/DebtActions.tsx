"use client";

import { useState } from "react";
import { Check, Edit2, MoreVertical, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { DebtFormModal } from "@/components/debts/DebtFormModal";
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Debt } from "@/types/debt";

interface DebtActionsProps {
  debt: Debt;
  onRefresh?: () => void;
}

export function DebtActions({ debt, onRefresh }: DebtActionsProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState<"delete" | "pay" | null>(null);

  async function handleDelete() {
    setLoadingAction("delete");

    try {
      const response = await fetch(`/api/debts/${debt.id}`, { method: "DELETE" });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(typeof payload?.error === "string" ? payload.error : "Failed to delete debt");
      }

      toast.success("ลบรายการหนี้แล้ว");
      onRefresh?.();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "ลบรายการหนี้ไม่สำเร็จ");
    } finally {
      setLoadingAction(null);
      setIsDeleteDialogOpen(false);
    }
  }

  async function handleMarkAsPaid() {
    setLoadingAction("pay");

    try {
      const response = await fetch(`/api/debts/${debt.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PAID" }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(typeof payload?.error === "string" ? payload.error : "Failed to mark debt as paid");
      }

      toast.success("เปลี่ยนสถานะเป็นจ่ายแล้ว");
      onRefresh?.();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "อัปเดตสถานะไม่สำเร็จ");
    } finally {
      setLoadingAction(null);
      setIsPayDialogOpen(false);
    }
  }

  return (
    <>
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 self-start">
        {debt.status === "UNPAID" ? (
          <button
            type="button"
            onClick={() => setIsPayDialogOpen(true)}
            disabled={loadingAction === "pay"}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Check className="h-4 w-4" />
            <span>{loadingAction === "pay" ? "กำลังบันทึก..." : "รับชำระ"}</span>
          </button>
        ) : null}

        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full p-2 text-slate-400 outline-none transition-colors hover:bg-slate-100 hover:text-slate-600">
            <MoreVertical className="h-5 w-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 rounded-2xl border-slate-100 p-2 shadow-xl">
            {debt.status === "UNPAID" && (
              <DropdownMenuItem
                onClick={() => setIsEditModalOpen(true)}
                className="flex cursor-pointer items-center gap-2 rounded-xl py-2.5 font-medium text-slate-700 focus:bg-slate-50"
              >
                <Edit2 className="h-4 w-4" />
                <span>แก้ไข</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => setIsDeleteDialogOpen(true)}
              className="flex cursor-pointer items-center gap-2 rounded-xl py-2.5 font-medium text-rose-600 focus:bg-rose-50"
            >
              <Trash2 className="h-4 w-4" />
              <span>ลบรายการ</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <DebtFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          onRefresh?.();
        }}
        editData={debt}
      />

      <AlertDialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen}>
        <AlertDialogContent className="gap-6 rounded-[2rem] border-0 bg-white p-6 shadow-lg sm:max-w-md">
          <AlertDialogHeader className="space-y-3">
            <AlertDialogTitle className="text-center text-xl font-bold text-slate-800">
              ยืนยันว่าลูกค้าจ่ายแล้ว?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center font-medium text-slate-500">
              รายการของ <span className="font-bold text-slate-700">{debt.customerName}</span> จำนวน{" "}
              <span className="font-bold text-emerald-600">{debt.amount.toLocaleString()} บาท</span>{" "}
              จะถูกเปลี่ยนเป็นสถานะจ่ายแล้วทันที
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:justify-center">
            <AlertDialogCancel
              disabled={loadingAction === "pay"}
              className="w-full rounded-full border-slate-200 py-6 font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700 sm:w-auto"
            >
              ยกเลิก
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleMarkAsPaid();
              }}
              disabled={loadingAction === "pay"}
              className="w-full rounded-full bg-emerald-500 py-6 font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-600 sm:w-auto"
            >
              {loadingAction === "pay" ? "กำลังบันทึก..." : "จ่ายแล้ว"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="gap-6 rounded-[2rem] border-0 bg-white p-6 shadow-lg sm:max-w-md">
          <AlertDialogHeader className="space-y-3">
            <AlertDialogTitle className="text-center text-xl font-bold text-slate-800">
              ยืนยันการลบรายการหนี้?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center font-medium text-slate-500">
              รายการของ <span className="font-bold text-slate-700">{debt.customerName}</span> จำนวน{" "}
              <span className="font-bold text-rose-500">{debt.amount.toLocaleString()} บาท</span> จะถูกลบออกถาวร
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:justify-center">
            <AlertDialogCancel
              disabled={loadingAction === "delete"}
              className="w-full rounded-full border-slate-200 py-6 font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700 sm:w-auto"
            >
              ยกเลิก
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleDelete();
              }}
              disabled={loadingAction === "delete"}
              className="w-full rounded-full bg-rose-500 py-6 font-bold text-white shadow-md shadow-rose-500/20 hover:bg-rose-600 sm:w-auto"
            >
              {loadingAction === "delete" ? "กำลังลบ..." : "ลบรายการ"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
