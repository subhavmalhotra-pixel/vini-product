import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, parseISO, addDays } from 'date-fns'

interface WeekPickerProps {
  weekStart: string
  onChange: (weekStart: string) => void
  availableWeeks: string[]
}

function formatWeekRange(weekStart: string): string {
  const start = parseISO(weekStart)
  const end = addDays(start, 6)
  return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`
}

function shiftWeek(weekStart: string, direction: -1 | 1): string {
  const date = parseISO(weekStart)
  return format(addDays(date, direction * 7), 'yyyy-MM-dd')
}

export default function WeekPicker({ weekStart, onChange, availableWeeks }: WeekPickerProps) {
  const prevWeek = shiftWeek(weekStart, -1)
  const nextWeek = shiftWeek(weekStart, 1)

  const canGoPrev = availableWeeks.includes(prevWeek)
  const canGoNext = availableWeeks.includes(nextWeek)

  return (
    <div className="flex items-center gap-1 border border-slate-200 rounded-lg bg-white px-1 py-1">
      <button
        onClick={() => canGoPrev && onChange(prevWeek)}
        disabled={!canGoPrev}
        className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous week"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="text-sm font-medium text-slate-700 px-2 min-w-[180px] text-center">
        {formatWeekRange(weekStart)}
      </span>
      <button
        onClick={() => canGoNext && onChange(nextWeek)}
        disabled={!canGoNext}
        className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Next week"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
