"use client"
import { useState, useEffect, useRef, createContext, useContext, useCallback } from "react"
import { Delete, ChevronLeft } from "lucide-react"

// ---- Context ----
interface AuthContextType {
  isAuthed: boolean
  logout: () => void
  changePin: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

// ---- Helpers ----
const KEY_AUTHED = "expense_app_pin_authed"
const KEY_PIN = "expense_app_pin"
const DEFAULT_PIN = "4743"

function loadPin() {
  return localStorage.getItem(KEY_PIN) || DEFAULT_PIN
}

// ---- Sub-components ----
function PinDots({ count, filled, error }: { count: number; filled: number; error: boolean }) {
  return (
    <div className={`flex gap-4 ${error ? "animate-shake" : ""}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`h-4 w-4 rounded-full transition-all duration-200 ${
            i < filled
              ? error ? "bg-rose-500 scale-110" : "bg-emerald-500 scale-110"
              : "bg-slate-200"
          }`}
        />
      ))}
    </div>
  )
}

function Numpad({ onPress, onDelete }: { onPress: (n: number) => void; onDelete: () => void }) {
  return (
    <div className="grid grid-cols-3 gap-x-12 gap-y-8 max-w-[320px] w-full">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
        <button
          key={n}
          onClick={() => onPress(n)}
          className="h-20 w-20 mx-auto rounded-full bg-white border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] flex items-center justify-center text-3xl font-semibold text-slate-800 active:bg-slate-100 active:scale-95 transition-all"
        >
          {n}
        </button>
      ))}
      <div />
      <button
        onClick={() => onPress(0)}
        className="h-20 w-20 mx-auto rounded-full bg-white border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] flex items-center justify-center text-3xl font-semibold text-slate-800 active:bg-slate-100 active:scale-95 transition-all"
      >
        0
      </button>
      <button
        onClick={onDelete}
        className="h-20 w-20 mx-auto rounded-full flex items-center justify-center text-slate-500 active:bg-slate-100 active:scale-95 transition-all"
      >
        <Delete className="h-8 w-8" />
      </button>
    </div>
  )
}

function Screen({
  title, subtitle, back, children
}: {
  title: string
  subtitle?: string
  back?: () => void
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#FDFCF8] px-6 animate-scale-in">
      {back && (
        <button
          onClick={back}
          className="absolute top-8 left-6 p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500"
        >
          <ChevronLeft className="h-6 w-6 stroke-[2.5]" />
        </button>
      )}
      <div className="mb-10 text-center space-y-2">
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        {subtitle && <p className="text-sm font-medium text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

// ---- Main component ----
type Mode = "lock" | "change_old" | "change_new" | "change_confirm"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [isAuthed, setIsAuthed] = useState(false)
  const [mode, setMode] = useState<Mode>("lock")

  // Single input buffer used for all modes
  const [input, setInput] = useState("")
  const [error, setError] = useState(false)

  // Store new PIN across screens
  const pendingNewPin = useRef("")

  // The active PIN — loaded once on mount
  const [currentPin, setCurrentPin] = useState(DEFAULT_PIN)
  const PIN_LEN = currentPin.length
  const NEW_PIN_LEN = 4

  useEffect(() => {
    const pin = loadPin()
    setCurrentPin(pin)
    const authed = localStorage.getItem(KEY_AUTHED) === "true"
    if (authed) setIsAuthed(true)
    setMounted(true)
  }, [])

  /* ---------- helpers ---------- */
  const shake = (onDone?: () => void) => {
    setError(true)
    setTimeout(() => {
      setError(false)
      setInput("")
      onDone?.()
    }, 600)
  }

  const maxLen = (m: Mode) => m === "change_old" ? PIN_LEN : NEW_PIN_LEN

  /* ---------- press a digit ---------- */
  const press = useCallback((n: number) => {
    setInput(prev => {
      if (prev.length >= maxLen(mode)) return prev
      return prev + n
    })
    setError(false)
  }, [mode, maxLen])

  const del = useCallback(() => {
    setInput(prev => prev.slice(0, -1))
    setError(false)
  }, [])

  /* ---------- check on every input change ---------- */
  useEffect(() => {
    const len = maxLen(mode)
    if (input.length < len) return

    if (mode === "lock") {
      if (input === currentPin) {
        localStorage.setItem(KEY_AUTHED, "true")
        setIsAuthed(true)
        setInput("")
      } else {
        shake()
      }
    }

    if (mode === "change_old") {
      if (input === currentPin) {
        setTimeout(() => { setInput(""); setMode("change_new") }, 200)
      } else {
        shake()
      }
    }

    if (mode === "change_new") {
      pendingNewPin.current = input
      setTimeout(() => { setInput(""); setMode("change_confirm") }, 200)
    }

    if (mode === "change_confirm") {
      if (input === pendingNewPin.current) {
        localStorage.setItem(KEY_PIN, input)
        setCurrentPin(input)
        localStorage.setItem(KEY_AUTHED, "true")
        setInput("")
        setMode("lock")
        pendingNewPin.current = ""
        setIsAuthed(true)
      } else {
        shake(() => {
          setMode("change_new")
          pendingNewPin.current = ""
        })
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input])

  /* ---------- Keyboard support ---------- */
  useEffect(() => {
    if (isAuthed) return
    const handler = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") press(parseInt(e.key))
      else if (e.key === "Backspace") del()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [isAuthed, press, del])

  /* ---------- Context actions ---------- */
  const logout = () => {
    localStorage.removeItem(KEY_AUTHED)
    setIsAuthed(false)
    setInput("")
    setMode("lock")
  }

  const changePin = () => {
    setIsAuthed(false)
    setInput("")
    setMode("change_old")
  }

  /* ---------- Render ---------- */
  if (!mounted) return null

  if (isAuthed) {
    return (
      <AuthContext.Provider value={{ isAuthed, logout, changePin }}>
        {children}
      </AuthContext.Provider>
    )
  }

  /* Lock screen */
  if (mode === "lock") {
    return (
      <Screen title="กรุณาใส่รหัสผ่าน" subtitle="เพื่อเข้าถึงข้อมูลรายรับรายจ่ายของคุณ">
        <div className="flex flex-col items-center gap-12 w-full">
          <PinDots count={PIN_LEN} filled={input.length} error={error} />
          <Numpad onPress={press} onDelete={del} />
        </div>
      </Screen>
    )
  }

  /* Change: verify old PIN */
  if (mode === "change_old") {
    return (
      <Screen
        title="ใส่รหัสปัจจุบัน"
        subtitle="ยืนยันรหัสเดิมก่อนเปลี่ยนใหม่"
        back={() => { setMode("lock"); setInput(""); setError(false) }}
      >
        <div className="flex flex-col items-center gap-12 w-full">
          <PinDots count={PIN_LEN} filled={input.length} error={error} />
          <Numpad onPress={press} onDelete={del} />
        </div>
      </Screen>
    )
  }

  /* Change: enter new PIN */
  if (mode === "change_new") {
    return (
      <Screen
        title="ตั้งรหัสใหม่"
        subtitle={`กรอกรหัส ${NEW_PIN_LEN} หลักที่ต้องการ`}
        back={() => { setMode("lock"); setInput(""); setError(false); setIsAuthed(true) }}
      >
        <div className="flex flex-col items-center gap-12 w-full">
          <PinDots count={NEW_PIN_LEN} filled={input.length} error={error} />
          <Numpad onPress={press} onDelete={del} />
        </div>
      </Screen>
    )
  }

  /* Change: confirm new PIN */
  if (mode === "change_confirm") {
    return (
      <Screen
        title="ยืนยันรหัสใหม่"
        subtitle="กรอกรหัสใหม่อีกครั้งเพื่อยืนยัน"
        back={() => { setMode("change_new"); setInput(""); setError(false) }}
      >
        <div className="flex flex-col items-center gap-12 w-full">
          <PinDots count={NEW_PIN_LEN} filled={input.length} error={error} />
          {error && <p className="text-sm font-medium text-rose-500 -mt-8">รหัสไม่ตรงกัน กรุณากรอกใหม่</p>}
          <Numpad onPress={press} onDelete={del} />
        </div>
      </Screen>
    )
  }

  return null
}
