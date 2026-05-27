import { Calendar } from 'lucide-react'
import type { Scenario } from '../types'

// The card that sits to the left of the form area in the recordings —
// "asfd" tile, subscription line, agents, status, contract date.
export function ContextPanel({ scenario }: { scenario: Scenario }) {
  const agentTypeLabel =
    scenario.agentType === 'service' ? 'Service Inbound +0' : 'Inbound Sales +1'

  return (
    <div className="rounded-xl border border-spyne-line bg-white p-4 shadow-card">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-spyne-paper text-spyne-ink grid place-items-center font-bold">
          A
        </div>
        <div className="text-[14px] font-semibold text-spyne-ink">asfd</div>
      </div>

      <dl className="mt-4 space-y-2 text-[12px]">
        <div className="flex items-center justify-between">
          <dt className="text-spyne-mute">Subscription (Monthly):</dt>
          <dd className="rounded bg-spyne-paper px-1.5 py-0.5 font-medium">$ 260210…</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-spyne-mute">Agents:</dt>
          <dd className="rounded bg-emerald-50 px-1.5 py-0.5 font-medium text-emerald-700">{agentTypeLabel}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-spyne-mute">Status:</dt>
          <dd className="rounded bg-emerald-50 px-1.5 py-0.5 font-medium text-emerald-700">Contracted</dd>
        </div>
      </dl>

      <div className="mt-4 rounded-lg border border-spyne-line p-3">
        <div className="flex items-center gap-2 text-[12px] font-semibold text-spyne-ink">
          <Calendar size={13} className="text-spyne-mute" />
          Contract Date:
          <span className="ml-auto rounded bg-spyne-paper px-1.5 py-0.5 font-mono">9 Apr, 2026</span>
        </div>
        <button className="mt-2 text-[12px] font-semibold text-spyne-violet hover:underline">
          View Contract &rarr;
        </button>
      </div>

      <div className="mt-3 text-[11px] text-spyne-mute">
        Demo scenario: <span className="text-spyne-ink font-medium">{scenario.label}</span>
      </div>
    </div>
  )
}
