import { Moon, CalendarCheck, Clock } from 'lucide-react'
import { useWeekData } from '../hooks/useWeekData'
import MetricCard from '../components/MetricCard'
import CallsTable from '../components/CallsTable'

interface AfterHoursProps {
  dealerId: string
  weekStart: string
}

function formatAvgDuration(calls: { durationSec: number }[]): string {
  const answered = calls.filter((c) => c.durationSec > 0)
  if (answered.length === 0) return '—'
  const avg = Math.round(answered.reduce((sum, c) => sum + c.durationSec, 0) / answered.length)
  const m = Math.floor(avg / 60)
  const s = avg % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex flex-col gap-2">
          <div className="h-4 w-28 bg-slate-200 rounded" />
          <div className="h-8 w-16 bg-slate-200 rounded" />
        </div>
        <div className="w-10 h-10 bg-slate-200 rounded-lg" />
      </div>
      <div className="h-3 w-32 bg-slate-200 rounded" />
    </div>
  )
}

export default function AfterHours({ dealerId, weekStart }: AfterHoursProps) {
  const { data, loading, error } = useWeekData(dealerId, weekStart)

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-700 font-medium">Failed to load data</p>
        <p className="text-red-500 text-sm mt-1">{error}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">After-Hours Report</h2>
        <p className="text-sm text-slate-400 mt-1">
          All calls handled by Vini outside of regular business hours (6 PM – 9 AM)
        </p>
      </div>

      {/* Stats row */}
      {loading || !data ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              label="After-Hours Calls"
              value={data.afterHoursCalls.length}
              subtext={`${data.callStats.afterHoursCount} total recorded`}
              icon={<Moon className="w-5 h-5 text-amber-700" />}
              iconBg="bg-amber-100"
            />
            <MetricCard
              label="Appointments Set"
              value={data.afterHoursCalls.filter((c) => c.outcome === 'appointment_set').length}
              subtext={
                data.afterHoursCalls.length > 0
                  ? `${Math.round(
                      (data.afterHoursCalls.filter((c) => c.outcome === 'appointment_set').length /
                        data.afterHoursCalls.length) *
                        100
                    )}% conversion`
                  : 'No calls'
              }
              icon={<CalendarCheck className="w-5 h-5 text-emerald-600" />}
              iconBg="bg-emerald-100"
            />
            <MetricCard
              label="Avg Call Duration"
              value={formatAvgDuration(data.afterHoursCalls)}
              subtext={`${data.afterHoursCalls.filter((c) => c.durationSec > 0).length} connected calls`}
              icon={<Clock className="w-5 h-5 text-orange-600" />}
              iconBg="bg-orange-100"
            />
          </div>

          {/* Full calls table */}
          <CallsTable calls={data.afterHoursCalls} title="All After-Hours Calls" />
        </>
      )}
    </div>
  )
}
