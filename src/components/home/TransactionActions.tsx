"use client"

import { useState } from "react"
import { MoreVertical, Edit2, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { TransactionFormModal } from "./TransactionFormModal"
import { toast } from "sonner"
import dayjs from "dayjs"

export function TransactionActions({ transaction, onRefresh }: { transaction: any; onRefresh?: () => void }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/transactions/${transaction.id}`, {
        method: "DELETE"
      })
      if (!res.ok) throw new Error("Failed to delete")
      toast.success("ลบรายการสำเร็จ")
      if (onRefresh) onRefresh()
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการลบรายการ")
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  const editData = {
    ...transaction,
    date: dayjs(transaction.transactionDate).format('YYYY-MM-DD'),
    time: dayjs(transaction.transactionDate).format('HH:mm'),
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="p-2 -mr-2 outline-none rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
          <MoreVertical className="h-5 w-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 rounded-2xl p-2 shadow-xl border-slate-100">
          <DropdownMenuItem 
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 rounded-xl focus:bg-slate-50 cursor-pointer text-slate-700 font-medium py-2.5"
          >
            <Edit2 className="h-4 w-4" />
            <span>แก้ไข</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setIsDeleteDialogOpen(true)}
            className="flex items-center gap-2 rounded-xl focus:bg-rose-50 cursor-pointer text-rose-600 font-medium py-2.5"
          >
            <Trash2 className="h-4 w-4" />
            <span>ลบรายการ</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <TransactionFormModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        type={transaction.type}
        editData={editData}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-[2rem] p-6 sm:max-w-md bg-white border-0 shadow-lg gap-6">
          <AlertDialogHeader className="space-y-3">
            <AlertDialogTitle className="text-xl font-bold text-center text-slate-800">ยืนยันการลบรายการ?</AlertDialogTitle>
            <AlertDialogDescription className="text-center font-medium text-slate-500">
              คุณต้องการลบรายการ <span className="font-bold text-slate-700">{transaction.category}</span> {transaction.note ? `(${transaction.note})` : ''} จำนวน <span className="font-bold text-rose-500">{transaction.amount.toLocaleString()} บาท</span> ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3">
            <AlertDialogCancel disabled={isDeleting} className="w-full sm:w-auto rounded-full py-6 font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700 border-slate-200">
              ยกเลิก
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="w-full sm:w-auto rounded-full py-6 font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20"
            >
              {isDeleting ? "กำลังลบ..." : "ลบรายการ"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
