import { useEffect, useState } from 'react'
import {
  CheckCircle2,
  Clock,
  AlertOctagon,
  RefreshCw,
  Mail,
  Phone,
  MessageSquare,
  Globe,
  BanIcon,
} from 'lucide-react'
import clsx from 'clsx'
import { fetchGoLiveProbes } from '../api/mockApi'
import { PageHeader } from '../components/Layout'
import {
  PHONE_DEPLOYMENT_OPTIONS,
  type GoLiveProbe,
  type IntegrationEntry,
  type PhoneDeploymentType,
  type Scenario,
  type ToggleConfig,
} from '../types'

const ICON_BY_KEY = {
  phone: Phone,
  stl: MessageSquare,
  widget: Globe,
} as const

const STATUS = {
  live:     { icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50', label: 'Live' },
  pending:  { icon: Clock,        color: 'text-amber-700  bg-amber-50',    label: 'Pending' },
  blocked:  { icon: AlertOctagon, color: 'text-red-700    bg-red-50',      label: 'Blocked' },
  disabled: { icon: BanIcon,      color: 'text-spyne-mute bg-spyne-paper', label: 'Disabled' },
} as const

export function GoLive({
  scenario,
  probes,
  setProbes,
  integrations,
  stl,
  smartWidget,
  phoneDeployment,
  onPhoneDeploymentChange,
  onSendChecklist,
}: {
  scenario: Scenario
  probes: GoLiveProbe[]
  setProbes: (next: GoLiveProbe[]) => void
  integrations: IntegrationEntry[]
  stl: ToggleConfig
  smartWidget: ToggleConfig
  phoneDeployment: PhoneDeploymentType[]
  onPhoneDeploymentChange: (next: PhoneDeploymentType[]) => void
  onSendChecklist: () => void
}) {
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (probes.length === 0) {
      fetchGoLiveProbes(scenario.id).then(setProbes)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario.id])

  // ----------------------------------------------------------------------
  // Compose the rows shown on this screen by PREFETCHING the configuration
  // captured during the onboarding journey:
  //   - Phone status comes from the live health probe (Twilio).
  //   - STL / Smart Widget rows are HYDRATED from `stl` and `smartWidget`
  //     ToggleConfigs (which the OB team set on the "Advanced → Disable"
  //     modal in the persona step). The probe only flips them to "live".
  // ----------------------------------------------------------------------

  const phone = probes.find((p) => p.key === 'phone')
  const stlProbe = probes.find((p) => p.key === 'stl')
  const widgetProbe = probes.find((p) => p.key === 'widget')

  const rows: GoLiveProbe[] = []

  if (phone) rows.push(phone)

  // STL — Sales only. Always show row, hydrated from journey state.
  if (scenario.agentType !== 'service') {
    rows.push(
      stl.enabled
        ? {
            key: 'stl',
            label: 'Speed-to-Lead forwarding',
            status: stlProbe?.status ?? 'pending',
            detail:
              stlProbe?.detail ??
              'Enabled in onboarding · awaiting first test lead',
            updated_at: stlProbe?.updated_at ?? 'just now',
          }
        : {
            key: 'stl',
            label: 'Speed-to-Lead forwarding',
            status: 'disabled',
            detail:
              stl.disable_reason_text || stl.disable_reason_code
                ? `Disabled in onboarding · ${stl.disable_reason_code ?? ''}${
                    stl.disable_reason_text ? ` · "${stl.disable_reason_text}"` : ''
                  }`
                : 'Disabled in onboarding',
            updated_at: 'pre-fetched',
          },
    )
  }

  // Smart Widget — Sales only.
  if (scenario.agentType !== 'service') {
    rows.push(
      smartWidget.enabled
        ? {
            key: 'widget',
            label: 'Smart View widget',
            status: widgetProbe?.status ?? 'pending',
            detail:
              widgetProbe?.detail ??
              'Enabled in onboarding · JS heartbeat awaiting embed',
            updated_at: widgetProbe?.updated_at ?? 'just now',
          }
        : {
            key: 'widget',
            label: 'Smart View widget',
            status: 'disabled',
            detail:
              smartWidget.disable_reason_text || smartWidget.disable_reason_code
                ? `Disabled in onboarding · ${smartWidget.disable_reason_code ?? ''}${
                    smartWidget.disable_reason_text ? ` · "${smartWidget.disable_reason_text}"` : ''
                  }`
                : 'Disabled in onboarding',
            updated_at: 'pre-fetched',
          },
    )
  }

  // A probe is "live-able" only if it's not Disabled. Disabled rows don't
  // count toward go-live progress.
  const liveable = rows.filter((r) => r.status !== 'disabled')
  const liveCount = liveable.filter((r) => r.status === 'live').length
  const allLive = liveable.length > 0 && liveCount === liveable.length

  const refresh = async () => {
    setRefreshing(true)
    const next = await fetchGoLiveProbes(scenario.id)
    setProbes(next)
    setRefreshing(false)
  }

  // --------------------- Phone deployment multi-select -------------------
  const togglePhoneType = (t: PhoneDeploymentType) => {
    const has = phoneDeployment.includes(t)
    onPhoneDeploymentChange(
      has ? phoneDeployment.filter((x) => x !== t) : [...phoneDeployment, t],
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Go-live deployment checklist"
        subtitle="Phone · STL · Smart Widget per agent. STL + Widget hydrated from onboarding journey; phone probe auto-refreshes every 60s."
      />

      <section className="rounded-xl border border-spyne-line bg-white shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-spyne-line">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-spyne-ink">
              {scenario.agentType === 'service'
                ? 'Heritage Toyota — Service Inbound'
                : 'Park Avenue Honda — Sales Inbound'}
            </span>
            <span className="text-[11px] text-spyne-mute">·</span>
            <span className="text-[11px] text-spyne-mute">
              {liveCount} / {liveable.length} live
            </span>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="inline-flex items-center gap-1 rounded-md border border-spyne-line bg-white px-2.5 py-1 text-[12px] font-medium text-spyne-ink hover:bg-spyne-paper"
          >
            <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        <ul>
          {rows.map((p) => {
            const meta = STATUS[p.status]
            const SIcon = meta.icon
            const TIcon = ICON_BY_KEY[p.key]
            return (
              <li
                key={p.key}
                className="px-4 py-3 border-t border-spyne-line first:border-0"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-spyne-paper grid place-items-center text-spyne-mute">
                    <TIcon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-spyne-ink">{p.label}</div>
                    <div className="text-[12px] text-spyne-mute truncate">{p.detail}</div>
                  </div>
                  <span
                    className={clsx(
                      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold',
                      meta.color,
                    )}
                  >
                    <SIcon size={12} />
                    {meta.label}
                  </span>
                  <span className="text-[10px] text-spyne-mute w-16 text-right">{p.updated_at}</span>
                </div>

                {/* Phone-only — Deployment type multi-select */}
                {p.key === 'phone' && (
                  <div className="mt-3 ml-14">
                    <div className="text-[10.5px] font-semibold uppercase tracking-wide text-spyne-mute mb-1.5">
                      Deployment type · choose one or more
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {PHONE_DEPLOYMENT_OPTIONS.map((opt) => {
                        const selected = phoneDeployment.includes(opt.id)
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => togglePhoneType(opt.id)}
                            title={opt.description}
                            className={clsx(
                              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-semibold transition',
                              selected
                                ? 'border-violet-300 bg-violet-50 text-spyne-violet'
                                : 'border-spyne-line bg-white text-spyne-ink hover:bg-spyne-paper',
                            )}
                            aria-pressed={selected}
                          >
                            <span
                              className={clsx(
                                'w-3 h-3 rounded-sm border grid place-items-center transition',
                                selected
                                  ? 'border-spyne-violet bg-spyne-violet text-white'
                                  : 'border-spyne-line bg-white text-transparent',
                              )}
                            >
                              <CheckCircle2 size={9} />
                            </span>
                            {opt.label}
                          </button>
                        )
                      })}
                    </div>
                    {phoneDeployment.length === 0 && (
                      <p className="mt-1.5 text-[11px] text-red-600">
                        Pick at least one deployment type before marking the agent live.
                      </p>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </section>

      {/* Integrations summary — read-only, sourced from contract addendum */}
      {integrations.length > 0 && (
        <section className="rounded-xl border border-spyne-line bg-white shadow-card p-4">
          <h3 className="text-[13px] font-semibold text-spyne-ink mb-2">Integrations (post-onboarding)</h3>
          <ul className="text-[12px] text-spyne-mute space-y-1">
            {integrations.map((i) => (
              <li key={i.key} className="flex items-center gap-2">
                <span className="rounded bg-spyne-paper px-1.5 py-0.5 font-mono text-[10px]">{i.key}</span>
                <span className="text-spyne-ink font-medium">{i.provider_name ?? '—'}</span>
                <span className="ml-auto text-[11px]">
                  {i.status === 'connected'
                    ? '🟢 connected'
                    : i.status === 'blocked'
                      ? '🔴 blocked'
                      : '🟡 pending'}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex items-center justify-between rounded-xl border border-spyne-line bg-white p-4 shadow-card">
        <div>
          <h3 className="text-[13px] font-semibold text-spyne-ink">Send post-onboarding checklist email</h3>
          <p className="text-[12px] text-spyne-mute mt-0.5">
            One email to IT contact + CSM with integration wizards, prefs review, and this status board.
          </p>
        </div>
        <button
          type="button"
          onClick={onSendChecklist}
          className="inline-flex items-center gap-1.5 rounded-md bg-spyne-violet hover:bg-spyne-violetDark px-4 py-2 text-sm font-semibold text-white"
        >
          <Mail size={14} />
          Send checklist
        </button>
      </div>

      {allLive ? (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-[13px] font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 size={16} /> All applicable touch points live. Ready to mark this rooftop live.
        </div>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-[12px] text-amber-700">
          Some touch points are pending. You can still mark live with reason, or wait for auto-refresh.
        </div>
      )}
    </div>
  )
}
