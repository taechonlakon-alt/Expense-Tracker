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

const INCOME_CATEGORIES = [
  "ขายของ ", // ขายของทั่วไป
  "ขายยาและเคมีเกษตร",   // ปุ๋ย, ยาฆ่าแมลง, เมล็ดพันธุ์
  "ขายเครื่องมือเกษตร",   // จอบ, เสียม, เครื่องตัดหญ้า, รถไถเดินตาม
  "ขายอะไหล่รถ",        // ยาง, นำมันเครื่อง, หัวเทียน
  "ค่าแรงซ่อม/บริการ",    // รายได้จากการลงแรงซ่อมโดยเฉพาะ
  "รายได้เบ็ดเตล็ด",      // เช่น ขายเศษเหล็ก, ค่าเทิร์นแบตเก่า
  "เงินส่วนตัวนำมาเติม"  ,  // กรณีเอาเงินเก็บตัวเองมาหมุนในร้าน
  "อื่นๆ"
]
const EXPENSE_CATEGORIES = [
  "สั่งของเข้าร้าน (Stock)", // รายจ่ายก้อนใหญ่ที่สุด (ปุ๋ย, อะไหล่, เครื่องจักร)
  "ค่าขนส่ง/ค่าระวาง",      // ค่าส่งของจาก Supplier หรือค่าไปรับของเอง
  "เครื่องมือ/อุปกรณ์ช่าง",   // ของที่ซื้อมาใช้ในร้าน (แท่นยก, สว่าน, ประแจ)
  "ค่าเช่า/ค่าน้ำ/ค่าไฟร้าน", 
  "ค่าแรงลูกน้อง/ผู้ช่วย",    // ถ้ามีคนช่วยงาน
  "ซ่อมแซม/บำรุงรักษาร้าน",
  "ภาษี/ค่าธรรมเนียม",     // ภาษีร้านค้า หรือค่าจดทะเบียนต่างๆ
  "ถอนเงินไปใช้ส่วนตัว",     // สำคัญมาก! แยกออกมาเป็นเงินเดือนตัวเอง
  "อื่นๆ"
]

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
          transactionDate: `${formData.date}T${formData.time}:00+07:00`
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
      <DialogContent className="sm:max-w-md bg-[#FAFAFA] rounded-3xl p-4 md:p-6 border-0 shadow-lg max-h-[96vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold text-center text-slate-800">
             {editData ? "แก้ไข" : "เพิ่ม"}{type === "income" ? "รายรับ" : "รายจ่าย"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600">จำนวนเงิน (บาท)</label>
            <input 
              type="number" 
              step="1.00"
              required
              placeholder="0.00"
              className="w-full text-4xl xs:text-5xl md:text-6xl font-extrabold text-slate-800 border-none bg-white rounded-2xl p-4 md:p-5 shadow-sm focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
            />
            <div className="grid grid-cols-3 gap-2 pt-2">
              {[1000, 500, 100, 50, 20, 10, 5, 2, 1].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    const current = parseFloat(formData.amount) || 0;
                    setFormData({...formData, amount: (current + val).toString()});
                  }}
                  className={`py-2.5 text-sm font-semibold rounded-xl transition-all active:scale-95 shadow-sm ${type === 'income' ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700' : 'bg-rose-50 hover:bg-rose-100 text-rose-700'}`}
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600">หมวดหมู่</label>
            <select 
              className="w-full bg-white border border-slate-100 rounded-xl p-4 text-base font-semibold text-slate-700 outline-none focus:border-emerald-500 shadow-sm appearance-none cursor-pointer"
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
              <label className="text-sm font-bold text-slate-600">วันที่</label>
              <input 
                type="date" 
                required
                className="w-full bg-white border border-slate-100 rounded-xl p-4 text-base font-semibold text-slate-700 outline-none focus:border-emerald-500 shadow-sm"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">เวลา</label>
              <input 
                type="time" 
                required
                className="w-full bg-white border border-slate-100 rounded-xl p-4 text-base font-semibold text-slate-700 outline-none focus:border-emerald-500 shadow-sm"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600">หมายเหตุ (ถ้ามี)</label>
            <input 
              type="text" 
              placeholder="รายละเอียดเพิ่มเติม... ถ้าเป็นประเภทอื่นๆ"
              className="w-full bg-white border border-slate-100 rounded-xl p-4 text-base text-slate-700 outline-none focus:border-emerald-500 shadow-sm"
              value={formData.note}
              onChange={(e) => setFormData({...formData, note: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full mt-6 md:mt-8 py-4 md:py-5 rounded-full font-bold text-white text-lg md:text-xl shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98] ${type === 'income' ? 'bg-emerald-500 shadow-emerald-500/30 hover:bg-emerald-600' : 'bg-rose-500 shadow-rose-500/30 hover:bg-rose-600'}`}
          >
            {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
