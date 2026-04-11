"use client"

import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import dayjs from "@/lib/dayjs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { th } from "date-fns/locale"

interface DateNavigatorProps {
  selectedDate: dayjs.Dayjs
  onChange: (date: dayjs.Dayjs) => void
}

export function DateNavigator({ selectedDate, onChange }: DateNavigatorProps) {
  const isToday = selectedDate.isSame(dayjs(), "day")

  const navigate = (direction: "prev" | "next") => {
    onChange(direction === "prev" ? selectedDate.subtract(1, "day") : selectedDate.add(1, "day"))
  }

  const goToToday = () => {
    onChange(dayjs())
  }

  return (
    <div className="flex items-center justify-between bg-[#F2F0E9] rounded-2xl sm:rounded-3xl p-1 px-2 sm:px-4 mb-3 sm:mb-4 shadow-inner border border-slate-100/50">
      <button 
        onClick={() => navigate("prev")} 
        className="p-2.5 sm:p-2 hover:bg-white rounded-full text-slate-600 transition-all active:scale-90 min-w-[44px] min-h-[44px] flex items-center justify-center"
      >
        <ChevronLeft className="h-5 w-5 stroke-[2.5]" />
      </button>
      
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Popover>
          <PopoverTrigger className="flex flex-col items-center px-3 sm:px-4 py-1.5 rounded-2xl hover:bg-white hover:shadow-sm transition-all focus:outline-none group">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 group-hover:text-[#42646D]">
              {isToday ? "วันนี้" : selectedDate.format("dddd")}
            </span>
            <span className="font-extrabold text-[#365058] text-base sm:text-lg leading-none">
              {selectedDate.format("D MMM YYYY")}
            </span>
          </PopoverTrigger>
          <PopoverContent align="center" className="w-auto p-4 rounded-[2rem] border-0 shadow-[0_10px_40px_rgba(0,0,0,0.08)] bg-white overflow-hidden">
            <Calendar
              mode="single"
              locale={th}
              selected={selectedDate.toDate()}
              onSelect={(date) => {
                if (date) onChange(dayjs(date))
              }}
              initialFocus
              className="p-2"
            />
          </PopoverContent>
        </Popover>

        {!isToday && (
          <button 
            onClick={goToToday}
            className="text-[10px] font-black bg-[#42646D] text-white px-2 py-1 rounded-full hover:bg-[#365058] transition-colors shadow-sm uppercase tracking-tighter"
          >
            วันนี้
          </button>
        )}
      </div>

      <button 
        onClick={() => navigate("next")} 
        className="p-2.5 sm:p-2 hover:bg-white rounded-full text-slate-600 transition-all active:scale-90 disabled:opacity-30 disabled:pointer-events-none min-w-[44px] min-h-[44px] flex items-center justify-center"
      >
        <ChevronRight className="h-5 w-5 stroke-[2.5]" />
      </button>
    </div>
  )
}
