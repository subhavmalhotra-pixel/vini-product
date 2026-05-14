import { ChevronRight } from 'lucide-react'
import { AppointmentFunnel as AppointmentFunnelType } from '../types'

interface AppointmentFunnelProps {
  funnel: AppointmentFunnelType
}

function pct(numerator: number, denominator: number): string {
  if (denominator === 0) return '—'
  return Math.round((numerator / denominator) * 100) + '%'
}

function pctNum(numerator: number, denominator: number): number {
  if (denominator === 0) return 0
  return Math.round((numerator / denominator) * 100)
}

const STAGE_COLORS = {
  set: 'bg-orange-500',
  showed: 'bg-orange-400',
  demoed: 'bg-orange-300',
  closed: 'bg-emerald-500',
}

const STAGE_TEXT_COLORS = {
  set: 'text-orange-700',
  showed: 'text-orange-600',
  demoed: 'text-orange-500',
  closed: 'text-emerald-700',
}

export default function AppointmentFunnel({ funnel }: AppointmentFunnelProps) {
  const stages = [
    { key: 'set' as const, label: 'Set', value: funnel.set },
    { key: 'showed' as const, label: 'Showed', value: funnel.showed },
    { key: 'demoed' as const, label: "Demo'd", value: funnel.demoed },
    { key: 'closed' as const, label: 'Closed', value: funnel.closed },
  ]

  const showRate = pct(funnel.showed, funnel.set)
  const demoRate = pct(funnel.demoed, funnel.set)
  const closeRate = pct(funnel.closed, funnel.set)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-5">Appointment Funnel</h3>

      <div className="flex items-stretch gap-1 mb-6">
        {stages.map((stage, i) => {
          const widthPct = pctNum(stage.value, funnel.set)
          const displayPct = funnel.set === 0 ? '—' : i === 0 ? '100%' : pct(stage.value, funnel.set)

          return (
            <div key={stage.key} className="flex items-center gap-1 flex-1">
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {stage.label}
                  </span>
                  <span className={`text-xs font-medium ${STAGE_TEXT_COLORS[stage.key]}`}>
                    {displayPct}
                  </span>
                </div>
                <span className="text-2xl font-bold text-slate-900">{stage.value}</span>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${STAGE_COLORS[stage.key]} transition-all duration-500`}
                    style={{ width: funnel.set === 0 ? '0%' : `${widthPct}%` }}
                  />
                </div>
              </div>
              {i < stages.length - 1 && (
                <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0 mt-1" />
              )}
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-6 pt-4 border-t border-slate-100">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-slate-400 font-medium">Show Rate</span>
          <span className="text-sm font-semibold text-slate-700">{showRate}</span>
        </div>
        <div className="w-px h-8 bg-slate-100" />
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-slate-400 font-medium">Demo Rate</span>
          <span className="text-sm font-semibold text-slate-700">{demoRate}</span>
        </div>
        <div className="w-px h-8 bg-slate-100" />
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-slate-400 font-medium">Close Rate</span>
          <span className="text-sm font-semibold text-slate-700">{closeRate}</span>
        </div>
      </div>
    </div>
  )
}
