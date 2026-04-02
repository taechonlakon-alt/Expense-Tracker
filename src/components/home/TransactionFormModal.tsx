"use client"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

interface TransactionFormModalProps {
  isOpen: boolean
  onClose: () => void
  type: "income" | "expense"
  editData?: {
    id: number
    amount: number
    category: string
    date: string
    time: string
    note: string
  }
}

const INCOME_CATEGORIES = ["เงินเดือน", "เงินพิเศษ", "โบนัส", "ขายของ", "อื่นๆ"]
const EXPENSE_CATEGORIES = ["อาหาร", "เดินทาง", "ค่าน้ำมัน", "ค่าหอ", "ค่าเรียน", "บันเทิง", "ช้อปปิ้ง", "อื่นๆ"]

export function TransactionFormModal({ isOpen, onClose, type, editData }: TransactionFormModalProps) {
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().slice(0, 5),
    note: ""
  })

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setFormData({
          amount: editData.amount.toString(),
          category: editData.category,
          date: editData.date,
          time: editData.time || new Date().toTimeString().slice(0, 5),
          note: editData.note || ""
        })
      } else {
        setFormData({
          amount: "",
          category: type === "income" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0],
          date: new Date().toISOString().split("T")[0],
          time: new Date().toTimeString().slice(0, 5),
          note: ""
        })
      }
    }
  }, [isOpen, type, editData])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.amount || Number(formData.amount) <= 0) {
       toast.error("กรุณากรอกจำนวนเงินให้มากกว่า 0")
       return
    }

    setLoading(true)
    try {
      const url = editData ? `/api/transactions/${editData.id}` : "/api/transactions"
      const method = editData ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          amount: parseFloat(formData.amount),
          category: formData.category,
          note: formData.note,
          transactionDate: `${formData.date}T${formData.time}`
        })
      })

      if (!res.ok) throw new Error("Failed to save transaction")
      
      toast.success(editData ? "แก้ไขข้อมูลเรียบร้อยแล้ว" : "บันทึกข้อมูลเรียบร้อยแล้ว", {
        description: `${type === 'income' ? 'รายรับ' : 'รายจ่าย'} ${formData.amount} บาท`
      })
      
      onClose()
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-[#FAFAFA] rounded-3xl p-6 border-0 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold text-center text-slate-800">
             {editData ? "แก้ไข" : "เพิ่ม"}{type === "income" ? "รายรับ" : "รายจ่าย"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600">จำนวนเงิน (บาท)</label>
            <input 
              type="number" 
              step="0.01"
              required
              placeholder="0.00"
              className="w-full text-3xl font-extrabold text-slate-800 border-none bg-white rounded-2xl p-4 shadow-sm focus:ring-2 focus:ring-[#719AA8] transition-all outline-none"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600">หมวดหมู่</label>
            <select 
              className="w-full bg-white border border-slate-100 rounded-xl p-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#719AA8] shadow-sm appearance-none cursor-pointer"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              {(type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600">วันที่</label>
              <input 
                type="date" 
                required
                className="w-full bg-white border border-slate-100 rounded-xl p-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#719AA8] shadow-sm"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600">เวลา</label>
              <input 
                type="time" 
                required
                className="w-full bg-white border border-slate-100 rounded-xl p-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#719AA8] shadow-sm"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600">หมายเหตุ (ถ้ามี)</label>
            <input 
              type="text" 
              placeholder="รายละเอียดเพิ่มเติม..."
              className="w-full bg-white border border-slate-100 rounded-xl p-3 text-sm text-slate-700 outline-none focus:border-[#719AA8] shadow-sm"
              value={formData.note}
              onChange={(e) => setFormData({...formData, note: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full mt-8 py-4 rounded-full font-bold text-white shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98] ${type === 'income' ? 'bg-[#719AA8] shadow-[#719AA8]/30 hover:bg-[#608b99]' : 'bg-[#A34E42] shadow-[#A34E42]/30 hover:bg-[#8f4136]'}`}
          >
            {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
