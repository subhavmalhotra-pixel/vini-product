import { format, parseISO, addDays } from 'date-fns'
import { DealerWeekData } from '../types'
import type { SectionConfig } from '../pages/EmailDigest'
import { AgentKey, filterDataByAgent, getAgentMeta } from '../data/agents'

interface Props {
  data: DealerWeekData
  sectionConfig: SectionConfig
  agentKey?: AgentKey
  recipients?: string[]
}

function pct(n: number, d: number): string {
  if (d === 0) return '—'
  return Math.round((n / d) * 100) + '%'
}

function dealerEmail(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '') + '@dealership.com'
}

const FUNNEL_STAGES = [
  { key: 'set' as const, label: 'Set', color: 'bg-orange-500' },
  { key: 'showed' as const, label: 'Showed', color: 'bg-orange-400' },
  { key: 'demoed' as const, label: "Demo'd", color: 'bg-amber-300' },
  { key: 'closed' as const, label: 'Closed', color: 'bg-emerald-500' },
]

export default function EmailDigestPreview({
  data,
  sectionConfig,
  agentKey = 'all',
  recipients,
}: Props) {
  const filtered = filterDataByAgent(data, agentKey)
  const agentMeta = getAgentMeta(agentKey)
  const isAgentDigest = agentKey !== 'all'
  const { callStats, appointmentFunnel, leads, dealer, weekStartDate, insightCard } = filtered

  const totalCalls = callStats.totalInbound + callStats.totalOutbound
  const hotLeads = leads.filter((l) => l.isHot).length
  const totalAttempts = leads.reduce((s, l) => s + l.attempts, 0)

  const weekStart = parseISO(weekStartDate)
  const weekEnd = addDays(weekStart, 6)
  const weekRange = `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d, yyyy')}`

  const showRate = pct(appointmentFunnel.showed, appointmentFunnel.set)
  const closeRate = pct(appointmentFunnel.closed, appointmentFunnel.set)
  const afterHoursPct = pct(callStats.afterHoursCount, totalCalls)

  return (
    <div className="flex flex-col">
      {/* Email envelope */}
      <div className="bg-slate-50 border border-b-0 border-slate-200 rounded-t-xl px-5 py-4 text-sm flex flex-col gap-2">
        {[
          { label: 'From', content: <><span className="text-slate-700">Vini Reports</span> <span className="text-slate-400">&lt;reports@vini.ai&gt;</span></> },
          {
            label: 'To',
            content: recipients && recipients.length > 0 ? (
              <span className="text-slate-700">{recipients.join(', ')}</span>
            ) : (
              <span className="text-slate-700">{dealerEmail(dealer.name)}</span>
            ),
          },
          {
            label: 'Subject',
            content: (
              <span className="text-slate-800 font-medium">
                {isAgentDigest ? `${agentMeta.label} — ` : ''}Weekly ROI Report — {dealer.name} | {weekRange}
              </span>
            ),
          },
        ].map((row) => (
          <div key={row.label} className="flex items-start gap-3">
            <span className="text-slate-400 w-14 flex-shrink-0 pt-px">{row.label}</span>
            <span>{row.content}</span>
          </div>
        ))}
      </div>

      {/* Email body */}
      <div className="border border-slate-200 rounded-b-xl overflow-hidden">
        {/* Brand header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/15 ring-1 ring-white/30 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-none">Vini</p>
              <p className="text-orange-100 text-xs mt-0.5">
                {isAgentDigest ? `${agentMeta.label} · Weekly Report` : 'Weekly ROI Report'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white text-sm font-medium">{weekRange}</p>
            <p className="text-orange-100 text-xs mt-0.5">{dealer.name}</p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white px-8 py-7 flex flex-col gap-6">
          {/* Heading */}
          <div className="border-b border-slate-100 pb-5">
            <h2 className="text-xl font-bold text-slate-900">{dealer.name}</h2>
            {isAgentDigest && (
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-600 mt-1.5">
                {agentMeta.label}
              </p>
            )}
            <p className="text-sm text-slate-400 mt-1">Week of {weekRange}</p>
          </div>

          {/* AI Insight — only when section enabled and narrative is available */}
          {sectionConfig.aiNarrative && insightCard.text && (
            <div className="bg-orange-50 border border-orange-100 rounded-lg px-4 py-4">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                  AI Insight
                </p>
                <span className="text-xs text-orange-300">·</span>
                <span className="text-xs text-orange-400">Generated by Haiku 4.5</span>
              </div>
              <p className="text-sm text-orange-900 leading-relaxed">{insightCard.text}</p>
            </div>
          )}

          {/* Metrics sections */}
          <div className="flex flex-col gap-4">
            {/* Call Volume */}
            {sectionConfig.callVolume && (
              <div className="rounded-lg border border-slate-100 overflow-hidden">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-100">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Call Volume
                  </span>
                </div>
                <div className="grid grid-cols-3 divide-x divide-slate-100">
                  {[
                    { label: 'Total Calls', value: String(totalCalls) },
                    {
                      label: 'After Hours',
                      value:
                        callStats.afterHoursCount > 0
                          ? `${callStats.afterHoursCount} (${afterHoursPct})`
                          : '0',
                    },
                    isAgentDigest && agentMeta.direction === 'outbound'
                      ? { label: 'Outbound', value: String(callStats.totalOutbound) }
                      : { label: 'Inbound', value: String(callStats.totalInbound) },
                  ].map((cell) => (
                    <div key={cell.label} className="px-4 py-3.5 text-center">
                      <p className="text-2xl font-bold text-slate-900">{cell.value}</p>
                      <p className="text-xs text-slate-400 mt-1">{cell.label}</p>
                    </div>
                  ))}
                </div>
                {/* After-hours breakdown row when section is also enabled */}
                {sectionConfig.afterHoursBreakdown && callStats.afterHoursCount > 0 && (
                  <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 flex gap-4 text-xs text-slate-500">
                    <span>After-hours appts: <span className="font-semibold text-slate-700">{callStats.outcomes.appointmentSet}</span></span>
                    <span>No answer: <span className="font-semibold text-slate-700">{callStats.outcomes.noAnswer}</span></span>
                    <span>Callbacks: <span className="font-semibold text-slate-700">{callStats.outcomes.callbackRequested}</span></span>
                  </div>
                )}
              </div>
            )}

            {/* Appointment Funnel */}
            {sectionConfig.appointmentFunnel && (
              <div className="rounded-lg border border-slate-100 overflow-hidden">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-100">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Appointment Funnel
                  </span>
                </div>
                <div className="px-4 py-4 flex items-stretch gap-0">
                  {FUNNEL_STAGES.map((stage, i) => {
                    const val = appointmentFunnel[stage.key]
                    return (
                      <div key={stage.key} className="flex items-center gap-0 flex-1">
                        <div className="flex-1 flex flex-col items-center">
                          <div
                            className={`w-full text-center ${stage.color} text-white rounded-lg font-bold text-lg py-2`}
                          >
                            {val}
                          </div>
                          <p className="text-xs text-slate-400 mt-1.5">{stage.label}</p>
                        </div>
                        {i < FUNNEL_STAGES.length - 1 && (
                          <span className="text-slate-200 text-base mx-2 mb-4 flex-shrink-0">→</span>
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 flex gap-6">
                  <span className="text-xs text-slate-500">
                    Show rate: <span className="font-semibold text-slate-700">{showRate}</span>
                  </span>
                  <span className="text-xs text-slate-500">
                    Close rate: <span className="font-semibold text-slate-700">{closeRate}</span>
                  </span>
                </div>
              </div>
            )}

            {/* Lead Activity */}
            {sectionConfig.leadActivity && (
              <div className="rounded-lg border border-slate-100 overflow-hidden">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-100">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Lead Activity
                  </span>
                </div>
                <div className="grid grid-cols-2 divide-x divide-slate-100">
                  {[
                    { label: 'Hot Leads Contacted', value: String(hotLeads) },
                    { label: 'Outreach Attempts', value: String(totalAttempts) },
                  ].map((cell) => (
                    <div key={cell.label} className="px-4 py-3.5 text-center">
                      <p className="text-2xl font-bold text-slate-900">{cell.value}</p>
                      <p className="text-xs text-slate-400 mt-1">{cell.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Call Examples */}
            {sectionConfig.topCalls && leads.length > 0 && (
              <div className="rounded-lg border border-slate-100 overflow-hidden">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-100">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Top Call Examples
                  </span>
                </div>
                <div className="divide-y divide-slate-50">
                  {data.leads.slice(0, 3).flatMap((l) => l.callLog.slice(0, 1)).slice(0, 3).map((call) => (
                    <div key={call.id} className="px-4 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${call.direction === 'inbound' ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-600'}`}>
                          {call.direction}
                        </span>
                        {call.timeOfDay === 'after_hours' && (
                          <span className="text-xs bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">After hours</span>
                        )}
                        <span className="text-xs text-slate-400 ml-auto">{call.outcome.replace(/_/g, ' ')}</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{call.snippet}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="text-center py-1">
            <span className="inline-block bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium px-6 py-2.5 rounded-lg cursor-default shadow-sm shadow-orange-200">
              View Full Dashboard →
            </span>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 pt-5 flex items-center justify-between">
            <p className="text-xs text-slate-400">Sent by Vini · AI-powered dealership assistant</p>
            <button className="text-xs text-slate-400 hover:text-slate-600 underline transition-colors">
              Unsubscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
