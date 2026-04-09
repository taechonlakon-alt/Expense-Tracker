"use client"

import { useRef, useState, type ChangeEvent } from "react"
import { Download, Upload } from "lucide-react"
import { toast } from "sonner"

interface BackupPanelProps {
  onRestoreSuccess?: () => void | Promise<void>
}

function getDownloadFilename(contentDisposition: string | null) {
  if (!contentDisposition) {
    return `expense-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`
  }

  const match = contentDisposition.match(/filename="([^"]+)"/)
  return match?.[1] || `expense-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`
}

export function BackupPanel({ onRestoreSuccess }: BackupPanelProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)

  const isBusy = isDownloading || isRestoring

  const handleDownloadBackup = async () => {
    setIsDownloading(true)

    try {
      const response = await fetch("/api/backup")
      const result = (await response.json().catch(() => null)) as { error?: string } | null

      if (!response.ok) {
        throw new Error(typeof result?.error === "string" ? result.error : "Failed to download backup")
      }

      const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")

      anchor.href = url
      anchor.download = getDownloadFilename(response.headers.get("content-disposition"))
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)

      toast.success("ดาวน์โหลดไฟล์ backup แล้ว")
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "ดาวน์โหลด backup ไม่สำเร็จ")
    } finally {
      setIsDownloading(false)
    }
  }

  const handleChooseFile = () => {
    if (isBusy) return
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    try {
      const fileText = await file.text()
      const payload = JSON.parse(fileText) as unknown
      const confirmed = window.confirm("การกู้คืนจะลบข้อมูลปัจจุบันทั้งหมดแล้วแทนที่ด้วยข้อมูลจากไฟล์นี้ ต้องการดำเนินการต่อหรือไม่?")

      if (!confirmed) {
        return
      }

      setIsRestoring(true)

      const response = await fetch("/api/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = (await response.json().catch(() => null)) as { error?: string } | null

      if (!response.ok) {
        throw new Error(typeof result?.error === "string" ? result.error : "Failed to restore backup")
      }

      await onRestoreSuccess?.()
      toast.success("กู้คืนข้อมูลจาก backup เรียบร้อยแล้ว")
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "กู้คืนข้อมูลไม่สำเร็จ")
    } finally {
      event.target.value = ""
      setIsRestoring(false)
    }
  }

  return (
    <div className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm">
      <div className="space-y-1">
        <h2 className="text-lg font-extrabold text-slate-800">Backup ทั้งระบบ</h2>
        <p className="text-sm font-medium text-slate-500">
          สำรองและกู้คืนข้อมูลธุรกรรม ลูกค้า และหนี้ทั้งหมดด้วยไฟล์ JSON ไฟล์เดียว
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          onClick={handleDownloadBackup}
          disabled={isBusy}
          className="flex items-center justify-center gap-2 rounded-2xl bg-[#42646D] px-4 py-3 text-sm font-bold text-white transition-all hover:bg-[#334e55] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Download className="h-4 w-4 stroke-[2.5]" />
          {isDownloading ? "กำลังสร้างไฟล์ backup..." : "ดาวน์โหลด Backup"}
        </button>

        <button
          onClick={handleChooseFile}
          disabled={isBusy}
          className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Upload className="h-4 w-4 stroke-[2.5]" />
          {isRestoring ? "กำลังกู้คืนข้อมูล..." : "กู้คืนจากไฟล์"}
        </button>
      </div>

      <p className="mt-3 text-xs font-medium text-amber-700">
        การกู้คืนจะลบข้อมูลปัจจุบันในฐานข้อมูลแล้วแทนที่ด้วยข้อมูลจากไฟล์ backup
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
