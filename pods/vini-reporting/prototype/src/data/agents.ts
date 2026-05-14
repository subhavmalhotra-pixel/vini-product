import { DealerWeekData, Lead, CallLogEntry, AfterHoursCall } from '../types'

export type AgentKey =
  | 'all'
  | 'service_inbound'
  | 'service_outbound'
  | 'sales_inbound'
  | 'sales_outbound'

export type Department = 'service' | 'sales'
export type Direction = 'inbound' | 'outbound'

export interface AgentMeta {
  key: AgentKey
  label: string
  shortLabel: string
  department: Department | null
  direction: Direction | null
  description: string
}

export const AGENTS: AgentMeta[] = [
  {
    key: 'all',
    label: 'Master (All Agents)',
    shortLabel: 'All',
    department: null,
    direction: null,
    description: 'Full dealership rollup — all 4 agents combined.',
  },
  {
    key: 'service_inbound',
    label: 'Service Inbound',
    shortLabel: 'Service In',
    department: 'service',
    direction: 'inbound',
    description: 'Inbound service calls — appointments, status checks, callbacks.',
  },
  {
    key: 'service_outbound',
    label: 'Service Outbound',
    shortLabel: 'Service Out',
    department: 'service',
    direction: 'outbound',
    description: 'Outbound service follow-ups — declined work, recalls, RO follow-up.',
  },
  {
    key: 'sales_inbound',
    label: 'Sales Inbound',
    shortLabel: 'Sales In',
    department: 'sales',
    direction: 'inbound',
    description: 'Inbound sales calls — new leads, inventory questions, test drives.',
  },
  {
    key: 'sales_outbound',
    label: 'Sales Outbound',
    shortLabel: 'Sales Out',
    department: 'sales',
    direction: 'outbound',
    description: 'Outbound sales prospecting — conquest, equity, re-engagement.',
  },
]

export const AGENT_KEYS: AgentKey[] = AGENTS.map((a) => a.key)
export const NON_MASTER_AGENTS = AGENTS.filter((a) => a.key !== 'all')

export function getAgentMeta(key: AgentKey): AgentMeta {
  const found = AGENTS.find((a) => a.key === key)
  if (!found) throw new Error(`Unknown agent key: ${key}`)
  return found
}

// Deterministic department assignment from an id string — stable across renders
// so the same lead/call always maps to the same department in the mock data.
function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  return Math.abs(h)
}

function deptForLead(lead: Lead): Department {
  return hashId(lead.id) % 2 === 0 ? 'service' : 'sales'
}

function deptForCallId(callId: string): Department {
  return hashId(callId) % 2 === 0 ? 'service' : 'sales'
}

function synthesizeAgentNarrative(
  meta: AgentMeta,
  dealerName: string,
  totalCalls: number,
  afterHoursCount: number,
  funnel: { set: number; showed: number; demoed: number; closed: number },
  hotLeadsCount: number,
  totalAttempts: number,
): string {
  if (totalCalls === 0) {
    return `No ${meta.label.toLowerCase()} activity was recorded for ${dealerName} this week. If this is unexpected, please verify that Vini's routing for ${meta.department} ${meta.direction} is active.`
  }

  const directionPhrase = meta.direction === 'inbound' ? 'inbound' : 'outbound'
  const deptPhrase = meta.department === 'service' ? 'service' : 'sales'
  const afterHoursClause =
    afterHoursCount > 0
      ? `, ${afterHoursCount} of those after hours`
      : ''
  const funnelClause =
    funnel.set > 0
      ? `${funnel.set} appointment${funnel.set === 1 ? '' : 's'} set, ${funnel.showed} showed, ${funnel.demoed} demo'd, and ${funnel.closed} closed.`
      : 'No appointments were set from this stream.'
  const leadsClause =
    hotLeadsCount > 0
      ? ` ${hotLeadsCount} hot lead${hotLeadsCount === 1 ? '' : 's'} received ${totalAttempts} outreach attempt${totalAttempts === 1 ? '' : 's'}.`
      : ''

  return `The ${meta.label} agent handled ${totalCalls} ${directionPhrase} ${deptPhrase} call${totalCalls === 1 ? '' : 's'} this week${afterHoursClause}. ${funnelClause}${leadsClause}`
}

// Build a filtered DealerWeekData scoped to a single agent. Returns the input
// unchanged for the master digest. For agent digests, recomputes call stats,
// leads, after-hours calls, and proportionally scales the appointment funnel.
export function filterDataByAgent(data: DealerWeekData, key: AgentKey): DealerWeekData {
  if (key === 'all') return data
  const meta = getAgentMeta(key)
  if (!meta.department || !meta.direction) return data

  const filteredLeads: Lead[] = data.leads
    .filter((l) => deptForLead(l) === meta.department)
    .map((l) => ({
      ...l,
      callLog: l.callLog.filter((c) => c.direction === meta.direction),
      attempts: l.callLog.filter((c) => c.direction === meta.direction).length,
    }))
    .filter((l) => l.callLog.length > 0)

  const allFilteredCalls: CallLogEntry[] = filteredLeads.flatMap((l) => l.callLog)
  const afterHoursCalls: AfterHoursCall[] = data.afterHoursCalls.filter(
    (c) => c.direction === meta.direction && deptForCallId(c.id) === meta.department,
  )

  const outcomes = {
    appointmentSet: allFilteredCalls.filter((c) => c.outcome === 'appointment_set').length,
    noAnswer: allFilteredCalls.filter((c) => c.outcome === 'no_answer').length,
    callbackRequested: allFilteredCalls.filter((c) => c.outcome === 'callback_left').length,
    other: 0,
  }

  const totalInbound = meta.direction === 'inbound' ? allFilteredCalls.length : 0
  const totalOutbound = meta.direction === 'outbound' ? allFilteredCalls.length : 0
  const afterHoursCount = allFilteredCalls.filter((c) => c.timeOfDay === 'after_hours').length

  const totalCallsAll = data.callStats.totalInbound + data.callStats.totalOutbound
  const totalCallsAgent = allFilteredCalls.length
  const scale = totalCallsAll > 0 ? totalCallsAgent / totalCallsAll : 0
  const scaleStage = (n: number) => Math.round(n * scale)

  const scaledFunnel = {
    set: scaleStage(data.appointmentFunnel.set),
    showed: scaleStage(data.appointmentFunnel.showed),
    demoed: scaleStage(data.appointmentFunnel.demoed),
    closed: scaleStage(data.appointmentFunnel.closed),
  }
  const hotLeadsCount = filteredLeads.filter((l) => l.isHot).length
  const totalAttempts = filteredLeads.reduce((s, l) => s + l.attempts, 0)

  return {
    ...data,
    callStats: {
      totalInbound,
      totalOutbound,
      afterHoursCount,
      outcomes,
    },
    appointmentFunnel: scaledFunnel,
    leads: filteredLeads,
    afterHoursCalls,
    insightCard: {
      ...data.insightCard,
      text: synthesizeAgentNarrative(
        meta,
        data.dealer.name,
        totalCallsAgent,
        afterHoursCount,
        scaledFunnel,
        hotLeadsCount,
        totalAttempts,
      ),
      isFallback: false,
    },
  }
}
