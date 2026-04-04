"use client"

import { useState, useEffect } from "react"
import { Delete } from "lucide-react"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthed, setIsAuthed] = useState(false)
  const [pin, setPin] = useState("")
  const [error, setError] = useState(false)
  const [mounted, setMounted] = useState(false)

  // รหัสผ่านที่กำหนดไว้
  const CORRECT_PIN = "456789"

  useEffect(() => {
    setMounted(true)
    const authed = localStorage.getItem("expense_app_pin_authed") === "true"
    if (authed) {
      setIsAuthed(true)
    }
  }, [])

  useEffect(() => {
    if (pin.length === 6) {
      if (pin === CORRECT_PIN) {
        // ถ้ารหัสถูกต้อง ให้เซฟและปลดล็อก
        localStorage.setItem("expense_app_pin_authed", "true")
        setIsAuthed(true)
      } else {
        // ถ้ารหัสผิด ให้แสดง error แปบนึงแล้วล้างค่า
        setError(true)
        setTimeout(() => {
          setPin("")
          setError(false)
        }, 600)
      }
    }
  }, [pin])

  const handleKeyPress = (num: number) => {
    setPin(prev => {
      if (prev.length < 6) {
        setError(false);
        return prev + num.toString();
      }
      return prev;
    });
  }

  const handleDelete = () => {
    setPin(prev => {
      setError(false);
      return prev.slice(0, -1);
    });
  }

  // รองรับการใช้งานพิมพ์ผ่าน Keyboard บนคอมพิวเตอร์
  useEffect(() => {
    if (isAuthed) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        handleKeyPress(parseInt(e.key, 10));
      } else if (e.key === "Backspace") {
        handleDelete();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthed]);

  // ป้องกันปัญหา Hydration
  if (!mounted) return null 

  if (isAuthed) {
    return <>{children}</>
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#FDFCF8] px-4 animate-scale-in">
       {/* ข้อความต้อนรับ */}
       <div className="mb-10 text-center space-y-2">
         <h1 className="text-2xl font-bold text-slate-800">กรุณาใส่รหัสผ่าน</h1>
         <p className="text-sm font-medium text-slate-500">เพื่อเข้าถึงข้อมูลรายรับรายจ่ายของคุณ</p>
       </div>
       
       {/* จุดกลมแสดงรหัส (PIN indicators) */}
       <div className={`flex gap-4 mb-20 ${error ? 'animate-shake' : ''}`}>
          {[...Array(6)].map((_, i) => (
             <div 
               key={i} 
               className={`h-4 w-4 rounded-full transition-colors duration-300 ${
                 i < pin.length 
                   ? (error ? 'bg-rose-500 scale-110' : 'bg-emerald-500 scale-110') 
                   : 'bg-slate-200'
               }`} 
             />
          ))}
       </div>

       {/* แป้นพิมพ์ตัวเลข (Numpad) */}
       <div className="grid grid-cols-3 gap-x-12 gap-y-8 max-w-[320px] w-full mt-4">
         {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
           <button
             key={num}
             onClick={() => handleKeyPress(num)}
             className="h-20 w-20 mx-auto rounded-full bg-white border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex items-center justify-center text-3xl font-semibold text-slate-800 active:bg-slate-100 active:scale-95 transition-all"
           >
             {num}
           </button>
         ))}
         <div /> {/* ช่องว่างสำหรับปุ่มมุมซ้ายล่าง */}
         <button
           onClick={() => handleKeyPress(0)}
           className="h-20 w-20 mx-auto rounded-full bg-white border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex items-center justify-center text-3xl font-semibold text-slate-800 active:bg-slate-100 active:scale-95 transition-all"
         >
           0
         </button>
         <button
           onClick={handleDelete}
           className="h-20 w-20 mx-auto rounded-full flex items-center justify-center text-slate-500 active:bg-slate-100 active:scale-95 transition-all"
         >
           <Delete className="h-8 w-8" />
         </button>
       </div>
    </div>
  )
}
