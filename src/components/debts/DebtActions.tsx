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
      <DropdownMenu>
        <DropdownMenuTrigger className="p-2 -mr-2 outline-none rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
          <MoreVertical className="h-5 w-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 rounded-2xl p-2 shadow-xl border-slate-100">
          {debt.status === "UNPAID" && (
            <DropdownMenuItem
              onClick={() => setIsPayDialogOpen(true)}
              className="flex items-center gap-2 rounded-xl focus:bg-emerald-50 cursor-pointer text-emerald-600 font-medium py-2.5"
            >
              <Check className="h-4 w-4" />
              <span>จ่ายแล้ว</span>
            </DropdownMenuItem>
          )}
          {debt.status === "UNPAID" && (
            <DropdownMenuItem
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 rounded-xl focus:bg-slate-50 cursor-pointer text-slate-700 font-medium py-2.5"
            >
              <Edit2 className="h-4 w-4" />
              <span>แก้ไข</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => setIsDeleteDialogOpen(true)}
            className="flex items-center gap-2 rounded-xl focus:bg-rose-50 cursor-pointer text-rose-600 font-medium py-2.5"
          >
            <Trash2 className="h-4 w-4" />
            <span>ลบรายการ</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DebtFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          onRefresh?.();
        }}
        editData={debt}
      />

      <AlertDialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen}>
        <AlertDialogContent className="rounded-[2rem] p-6 sm:max-w-md bg-white border-0 shadow-lg gap-6">
          <AlertDialogHeader className="space-y-3">
            <AlertDialogTitle className="text-xl font-bold text-center text-slate-800">
              ยืนยันว่าลูกค้าจ่ายแล้ว?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center font-medium text-slate-500">
              รายการของ <span className="font-bold text-slate-700">{debt.customerName}</span> จำนวน <span className="font-bold text-emerald-600">{debt.amount.toLocaleString()} บาท</span> จะถูกเปลี่ยนเป็นสถานะจ่ายแล้วทันที
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3">
            <AlertDialogCancel
              disabled={loadingAction === "pay"}
              className="w-full sm:w-auto rounded-full py-6 font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700 border-slate-200"
            >
              ยกเลิก
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleMarkAsPaid();
              }}
              disabled={loadingAction === "pay"}
              className="w-full sm:w-auto rounded-full py-6 font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
            >
              {loadingAction === "pay" ? "กำลังบันทึก..." : "จ่ายแล้ว"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-[2rem] p-6 sm:max-w-md bg-white border-0 shadow-lg gap-6">
          <AlertDialogHeader className="space-y-3">
            <AlertDialogTitle className="text-xl font-bold text-center text-slate-800">
              ยืนยันการลบรายการหนี้?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center font-medium text-slate-500">
              รายการของ <span className="font-bold text-slate-700">{debt.customerName}</span> จำนวน <span className="font-bold text-rose-500">{debt.amount.toLocaleString()} บาท</span> จะถูกลบออกถาวร
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3">
            <AlertDialogCancel
              disabled={loadingAction === "delete"}
              className="w-full sm:w-auto rounded-full py-6 font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700 border-slate-200"
            >
              ยกเลิก
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleDelete();
              }}
              disabled={loadingAction === "delete"}
              className="w-full sm:w-auto rounded-full py-6 font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20"
            >
              {loadingAction === "delete" ? "กำลังลบ..." : "ลบรายการ"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}