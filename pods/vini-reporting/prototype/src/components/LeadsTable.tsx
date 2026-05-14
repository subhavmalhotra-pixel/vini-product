import { Flame } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { Lead, LeadAction } from '../types'
import Badge from './Badge'

interface LeadsTableProps {
  leads: Lead[]
  onLeadClick: (lead: Lead) => void
}

const ACTION_CONFIG: Record<
  LeadAction,
  { label: string; variant: 'green' | 'yellow' | 'gray' | 'blue' | 'violet' }
> = {
  appointment_set: { label: 'Appt Set', variant: 'green' },
  callback_left: { label: 'Callback', variant: 'yellow' },
  no_answer: { label: 'No Answer', variant: 'gray' },
  demoed: { label: "Demo'd", variant: 'blue' },
  closed: { label: 'Closed', variant: 'violet' },
}

export default function LeadsTable({ leads, onLeadClick }: LeadsTableProps) {
  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <p className="text-center text-slate-400 text-sm py-8">No lead activity this week.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left text-xs font-semibold uppercase tracking-wide text-slate-400 px-6 py-3">
              Customer
            </th>
            <th className="text-left text-xs font-semibold uppercase tracking-wide text-slate-400 px-4 py-3 hidden md:table-cell">
              Vehicle
            </th>
            <th className="text-left text-xs font-semibold uppercase tracking-wide text-slate-400 px-4 py-3">
              Attempts
            </th>
            <th className="text-left text-xs font-semibold uppercase tracking-wide text-slate-400 px-4 py-3">
              Status
            </th>
            <th className="text-left text-xs font-semibold uppercase tracking-wide text-slate-400 px-4 py-3 hidden lg:table-cell">
              Last Contact
            </th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const config = ACTION_CONFIG[lead.lastAction]
            const lastContact = format(parseISO(lead.lastContactAt), 'MMM d, h:mm a')

            return (
              <tr
                key={lead.id}
                className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors last:border-0"
                onClick={() => onLeadClick(lead)}
              >
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-2">
                    {lead.isHot && (
                      <Flame className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-slate-800">{lead.name}</p>
                      <p className="text-xs text-slate-400">{lead.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 hidden md:table-cell">
                  <span className="text-sm text-slate-600 truncate max-w-[180px] block">
                    {lead.vehicleInterest}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-sm font-medium text-slate-700">{lead.attempts}</span>
                </td>
                <td className="px-4 py-3.5">
                  <Badge variant={config.variant}>{config.label}</Badge>
                </td>
                <td className="px-4 py-3.5 hidden lg:table-cell">
                  <span className="text-sm text-slate-400">{lastContact}</span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
