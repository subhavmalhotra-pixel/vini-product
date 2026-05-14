import { format, parseISO } from 'date-fns'
import { PhoneIncoming, PhoneOutgoing } from 'lucide-react'
import { AfterHoursCall } from '../types'
import Badge from './Badge'

interface CallsTableProps {
  calls: AfterHoursCall[]
  title?: string
}

function formatDuration(sec: number): string {
  if (sec === 0) return '—'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

const OUTCOME_CONFIG: Record<
  AfterHoursCall['outcome'],
  { label: string; variant: 'green' | 'gray' | 'yellow' }
> = {
  appointment_set: { label: 'Appt Set', variant: 'green' },
  no_answer: { label: 'No Answer', variant: 'gray' },
  callback_requested: { label: 'Callback', variant: 'yellow' },
}

export default function CallsTable({ calls, title }: CallsTableProps) {
  if (calls.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        {title && <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>}
        <p className="text-center text-slate-400 text-sm py-8">No after-hours calls this week.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      {title && (
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        </div>
      )}
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left text-xs font-semibold uppercase tracking-wide text-slate-400 px-6 py-3">
              Time
            </th>
            <th className="text-left text-xs font-semibold uppercase tracking-wide text-slate-400 px-4 py-3">
              Direction
            </th>
            <th className="text-left text-xs font-semibold uppercase tracking-wide text-slate-400 px-4 py-3 hidden sm:table-cell">
              Duration
            </th>
            <th className="text-left text-xs font-semibold uppercase tracking-wide text-slate-400 px-4 py-3 hidden md:table-cell">
              Caller
            </th>
            <th className="text-left text-xs font-semibold uppercase tracking-wide text-slate-400 px-4 py-3">
              Outcome
            </th>
          </tr>
        </thead>
        <tbody>
          {calls.map((call) => {
            const config = OUTCOME_CONFIG[call.outcome]
            const ts = format(parseISO(call.timestamp), 'MMM d · h:mm a')
            return (
              <tr
                key={call.id}
                className="border-b border-slate-50 hover:bg-slate-50 transition-colors last:border-0"
              >
                <td className="px-6 py-3.5">
                  <span className="text-sm text-slate-700">{ts}</span>
                </td>
                <td className="px-4 py-3.5">
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded ${
                      call.direction === 'inbound'
                        ? 'bg-orange-50 text-orange-600'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {call.direction === 'inbound' ? (
                      <PhoneIncoming className="w-3 h-3" />
                    ) : (
                      <PhoneOutgoing className="w-3 h-3" />
                    )}
                    {call.direction === 'inbound' ? 'Inbound' : 'Outbound'}
                  </span>
                </td>
                <td className="px-4 py-3.5 hidden sm:table-cell">
                  <span className="text-sm text-slate-600">{formatDuration(call.durationSec)}</span>
                </td>
                <td className="px-4 py-3.5 hidden md:table-cell">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{call.caller}</p>
                    <p className="text-xs text-slate-400">{call.phone}</p>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <Badge variant={config.variant}>{config.label}</Badge>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
