import { useState, useCallback } from 'react'
import { format, parseISO, addDays, nextDay, addWeeks, addMonths, setDate } from 'date-fns'
import {
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Loader2,
  CheckCircle,
  Calendar,
  Users,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  RotateCcw,
  Sparkles,
  BarChart2,
  Phone,
  Moon,
  FileText,
  Target,
  Repeat,
  CalendarDays,
  Info,
} from 'lucide-react'
import { useWeekData } from '../hooks/useWeekData'
import EmailDigestPreview from '../components/EmailDigestPreview'
import { sendEmailDigestNow } from '../api/client'
import { AGENTS, AGENT_KEYS, AgentKey } from '../data/agents'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

const TIME_OPTIONS: { label: string; hour: number; minute: number }[] = []
for (let h = 5; h <= 21; h++) {
  for (const m of [0, 30]) {
    const ampm = h < 12 ? 'AM' : h === 12 ? 'PM' : 'PM'
    const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h
    TIME_OPTIONS.push({ label: `${displayH}:${m === 0 ? '00' : '30'} ${ampm}`, hour: h, minute: m })
  }
}

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 weeks' },
  { value: 'monthly', label: 'Monthly' },
] as const

type Frequency = typeof FREQUENCY_OPTIONS[number]['value']

export interface ScheduleConfig {
  active: boolean
  mode: 'once' | 'recurring'
  onceDate: string          // YYYY-MM-DD
  frequency: Frequency
  dayOfWeek: number         // 0–6 (used for weekly/biweekly)
  dayOfMonth: number        // 1–31 (used for monthly)
  hour: number
  minute: number
}

export interface SectionConfig {
  callVolume: boolean
  appointmentFunnel: boolean
  leadActivity: boolean
  afterHoursBreakdown: boolean
  aiNarrative: boolean
  topCalls: boolean
  campaigns: boolean
}

export interface AgentDigest {
  enabled: boolean
  recipients: string[]
}

type AgentDigestMap = Record<AgentKey, AgentDigest>

interface DigestConfig {
  schedule: ScheduleConfig
  sections: SectionConfig
  digests: AgentDigestMap
}

const DEFAULT_DIGESTS: AgentDigestMap = {
  all: { enabled: true, recipients: [] },
  service_inbound: { enabled: false, recipients: [] },
  service_outbound: { enabled: false, recipients: [] },
  sales_inbound: { enabled: false, recipients: [] },
  sales_outbound: { enabled: false, recipients: [] },
}

const SYSTEM_DEFAULT: DigestConfig = {
  schedule: {
    active: true,
    mode: 'recurring',
    onceDate: '2026-05-18',
    frequency: 'weekly',
    dayOfWeek: 1,
    dayOfMonth: 1,
    hour: 7,
    minute: 0,
  },
  sections: {
    callVolume: true,
    appointmentFunnel: true,
    leadActivity: true,
    afterHoursBreakdown: true,
    aiNarrative: true,
    topCalls: false,
    campaigns: true,
  },
  digests: DEFAULT_DIGESTS,
}

const SECTION_META: { key: keyof SectionConfig; label: string; icon: React.ReactNode; defaultOn: boolean }[] = [
  { key: 'aiNarrative', label: 'AI Narrative', icon: <Sparkles className="w-3.5 h-3.5" />, defaultOn: true },
  { key: 'callVolume', label: 'Call Volume', icon: <Phone className="w-3.5 h-3.5" />, defaultOn: true },
  { key: 'appointmentFunnel', label: 'Appointment Funnel', icon: <BarChart2 className="w-3.5 h-3.5" />, defaultOn: true },
  { key: 'leadActivity', label: 'Lead Activity', icon: <Users className="w-3.5 h-3.5" />, defaultOn: true },
  { key: 'afterHoursBreakdown', label: 'After-Hours Breakdown', icon: <Moon className="w-3.5 h-3.5" />, defaultOn: true },
  { key: 'campaigns', label: 'Campaign Management', icon: <Target className="w-3.5 h-3.5" />, defaultOn: true },
  { key: 'topCalls', label: 'Top Call Examples', icon: <FileText className="w-3.5 h-3.5" />, defaultOn: false },
]

// Hardcoded send history — replace with real API data
const SEND_HISTORY = [
  { id: '1', sentAt: '2026-05-04T07:00:00', status: 'delivered' as const, openRate: '68%' },
  { id: '2', sentAt: '2026-04-27T07:00:00', status: 'delivered' as const, openRate: '72%' },
  { id: '3', sentAt: '2026-04-20T07:00:00', status: 'delivered' as const, openRate: '61%' },
  { id: '4', sentAt: '2026-04-13T07:00:00', status: 'failed' as const, openRate: null },
  { id: '5', sentAt: '2026-04-06T07:00:00', status: 'delivered' as const, openRate: '75%' },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeNextSend(schedule: ScheduleConfig): Date | null {
  if (!schedule.active) return null
  const now = new Date()

  if (schedule.mode === 'once') {
    const d = parseISO(schedule.onceDate)
    d.setHours(schedule.hour, schedule.minute, 0, 0)
    return d > now ? d : null
  }

  if (schedule.frequency === 'daily') {
    const d = new Date(now)
    d.setHours(schedule.hour, schedule.minute, 0, 0)
    return d > now ? d : addDays(d, 1)
  }

  if (schedule.frequency === 'weekly' || schedule.frequency === 'biweekly') {
    const dayNum = schedule.dayOfWeek as 0|1|2|3|4|5|6
    // find next occurrence of dayOfWeek at or after today
    let next = new Date(now)
    next.setHours(schedule.hour, schedule.minute, 0, 0)
    const todayDay = next.getDay()
    const diff = (dayNum - todayDay + 7) % 7
    next = addDays(next, diff === 0 && now > next ? 7 : diff)
    if (schedule.frequency === 'biweekly') {
      // keep as-is (first occurrence); real logic would track last sent
    }
    return next
  }

  if (schedule.frequency === 'monthly') {
    let next = setDate(new Date(now), schedule.dayOfMonth)
    next.setHours(schedule.hour, schedule.minute, 0, 0)
    if (next <= now) next = addMonths(next, 1)
    return next
  }

  return null
}

function nextSendLabel(schedule: ScheduleConfig, tz: string): string {
  if (!schedule.active) return 'Paused'
  const t = TIME_OPTIONS.find(o => o.hour === schedule.hour && o.minute === schedule.minute)
  const timeStr = t?.label ?? `${schedule.hour}:${schedule.minute === 0 ? '00' : '30'}`

  if (schedule.mode === 'once') {
    try {
      return `Once on ${format(parseISO(schedule.onceDate), 'EEE, MMM d')} at ${timeStr}`
    } catch { return 'Once — invalid date' }
  }

  const dayName = DAYS[schedule.dayOfWeek]
  const nextDate = computeNextSend(schedule)
  const nextStr = nextDate ? ` · Next: ${format(nextDate, 'EEE, MMM d')}` : ''

  if (schedule.frequency === 'daily') return `Daily at ${timeStr}${nextStr}`
  if (schedule.frequency === 'weekly') return `Every ${dayName} at ${timeStr}${nextStr}`
  if (schedule.frequency === 'biweekly') return `Every 2 weeks on ${dayName} at ${timeStr}${nextStr}`
  if (schedule.frequency === 'monthly') {
    const suffix = schedule.dayOfMonth === 1 ? 'st' : schedule.dayOfMonth === 2 ? 'nd' : schedule.dayOfMonth === 3 ? 'rd' : 'th'
    return `Monthly on the ${schedule.dayOfMonth}${suffix} at ${timeStr}${nextStr}`
  }
  return ''
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionHeader({
  title,
  open,
  onToggle,
}: {
  title: string
  open: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between py-3 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
    >
      {title}
      {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
    </button>
  )
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors duration-200 focus:outline-none ${
        on ? 'bg-orange-500' : 'bg-slate-200'
      }`}
      role="switch"
      aria-checked={on}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 mt-0.5 ${
          on ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

function DefaultBadge() {
  return (
    <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-normal">
      Default
    </span>
  )
}

function ConfirmModal({
  onConfirm,
  onCancel,
  sending,
  agentLabel,
  recipients,
}: {
  onConfirm: () => void
  onCancel: () => void
  sending: boolean
  agentLabel: string
  recipients: string[]
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
            <Send className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Send {agentLabel} digest now?</h3>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
              This will send the {agentLabel} weekly report immediately, outside the regular schedule.
              {recipients.length > 0
                ? ` Goes to: ${recipients.join(', ')}.`
                : ' Goes to the dealer primary contact.'}
            </p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            disabled={sending}
            className="border border-slate-200 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={sending}
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70"
          >
            {sending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
            ) : (
              <><Send className="w-4 h-4" /> Confirm Send</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function SchedulePanel({
  schedule,
  timezone,
  onChange,
}: {
  schedule: ScheduleConfig
  timezone: string
  onChange: (patch: Partial<ScheduleConfig>) => void
}) {
  const summaryText = nextSendLabel(schedule, timezone)

  return (
    <div className="py-4 flex flex-col gap-4">
      {/* Active toggle */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-700">Active</p>
          <p className="text-xs text-slate-400 mt-0.5">Pause to stop automated sends</p>
        </div>
        <Toggle on={schedule.active} onChange={(v) => onChange({ active: v })} />
      </div>

      {/* Mode selector */}
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Send type</p>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => onChange({ mode: 'recurring' })}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              schedule.mode === 'recurring'
                ? 'bg-white shadow-sm text-slate-800'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
            Recurring
          </button>
          <button
            onClick={() => onChange({ mode: 'once' })}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              schedule.mode === 'once'
                ? 'bg-white shadow-sm text-slate-800'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            One-time
          </button>
        </div>
      </div>

      {/* Recurring config */}
      {schedule.mode === 'recurring' && (
        <>
          {/* Frequency */}
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Frequency</p>
            <div className="flex gap-1">
              {FREQUENCY_OPTIONS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => onChange({ frequency: f.value })}
                  className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors border ${
                    schedule.frequency === f.value
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700 bg-white'
                  }`}
                >
                  {f.value === 'daily'
                    ? 'Daily'
                    : f.value === 'weekly'
                    ? 'Weekly'
                    : f.value === 'biweekly'
                    ? '2 wks'
                    : 'Monthly'}
                </button>
              ))}
            </div>
          </div>

          {/* Day picker */}
          {(schedule.frequency === 'weekly' || schedule.frequency === 'biweekly') && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Day</p>
                {schedule.dayOfWeek === SYSTEM_DEFAULT.schedule.dayOfWeek && <DefaultBadge />}
              </div>
              <div className="flex gap-1">
                {DAYS.map((day, i) => (
                  <button
                    key={day}
                    onClick={() => onChange({ dayOfWeek: i })}
                    className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${
                      schedule.dayOfWeek === i
                        ? 'bg-orange-500 text-white'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          {schedule.frequency === 'monthly' && (
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Day of month</p>
              <input
                type="number"
                min={1}
                max={28}
                value={schedule.dayOfMonth}
                onChange={(e) => onChange({ dayOfMonth: Math.min(28, Math.max(1, Number(e.target.value))) })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <p className="text-xs text-slate-400 mt-1">Day 1–28 (avoids month-end edge cases)</p>
            </div>
          )}
        </>
      )}

      {/* One-time config */}
      {schedule.mode === 'once' && (
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Date</p>
          <input
            type="date"
            value={schedule.onceDate}
            min={format(new Date(), 'yyyy-MM-dd')}
            onChange={(e) => onChange({ onceDate: e.target.value })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
      )}

      {/* Time — shown for both modes */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Time</p>
          {schedule.hour === SYSTEM_DEFAULT.schedule.hour &&
            schedule.minute === SYSTEM_DEFAULT.schedule.minute && <DefaultBadge />}
        </div>
        <select
          value={`${schedule.hour}:${schedule.minute}`}
          onChange={(e) => {
            const [h, m] = e.target.value.split(':').map(Number)
            onChange({ hour: h, minute: m })
          }}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          {TIME_OPTIONS.map((t) => (
            <option key={t.label} value={`${t.hour}:${t.minute}`}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Timezone */}
      <div className="flex items-start gap-2.5">
        <Clock className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-xs text-slate-400">Timezone (dealer local)</p>
          <p className="text-sm font-medium text-slate-700 mt-0.5">{timezone || '—'}</p>
        </div>
      </div>

      {/* Summary card */}
      {schedule.active && (
        <div className="bg-orange-50 border border-orange-100 rounded-lg px-3 py-2.5 flex items-start gap-2">
          <Calendar className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-orange-700 leading-relaxed">{summaryText}</p>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function EmailDigest({
  dealerId,
  weekStart,
}: {
  dealerId: string
  weekStart: string
}) {
  const { data, loading, error } = useWeekData(dealerId, weekStart)

  const [config, setConfig] = useState<DigestConfig>(SYSTEM_DEFAULT)
  const [showConfirm, setShowConfirm] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [recipientInputs, setRecipientInputs] = useState<Record<AgentKey, string>>(() =>
    AGENT_KEYS.reduce((acc, k) => ({ ...acc, [k]: '' }), {} as Record<AgentKey, string>),
  )
  const [previewAgent, setPreviewAgent] = useState<AgentKey>('all')
  const [expandedDigest, setExpandedDigest] = useState<AgentKey | null>('all')

  // Panel open state
  const [scheduleOpen, setScheduleOpen] = useState(true)
  const [sectionsOpen, setSectionsOpen] = useState(true)
  const [digestsOpen, setDigestsOpen] = useState(true)
  const [historyOpen, setHistoryOpen] = useState(true)

  const updateSchedule = useCallback(
    (patch: Partial<ScheduleConfig>) =>
      setConfig((c) => ({ ...c, schedule: { ...c.schedule, ...patch } })),
    []
  )

  const toggleSection = useCallback(
    (key: keyof SectionConfig) =>
      setConfig((c) => ({
        ...c,
        sections: { ...c.sections, [key]: !c.sections[key] },
      })),
    []
  )

  const addRecipient = useCallback(
    (agent: AgentKey) => {
      const email = (recipientInputs[agent] ?? '').trim()
      if (!email) return
      setConfig((c) => {
        if (c.digests[agent].recipients.includes(email)) return c
        return {
          ...c,
          digests: {
            ...c.digests,
            [agent]: { ...c.digests[agent], recipients: [...c.digests[agent].recipients, email] },
          },
        }
      })
      setRecipientInputs((r) => ({ ...r, [agent]: '' }))
    },
    [recipientInputs],
  )

  const removeRecipient = useCallback(
    (agent: AgentKey, email: string) =>
      setConfig((c) => ({
        ...c,
        digests: {
          ...c.digests,
          [agent]: {
            ...c.digests[agent],
            recipients: c.digests[agent].recipients.filter((r) => r !== email),
          },
        },
      })),
    [],
  )

  const toggleDigest = useCallback(
    (agent: AgentKey) =>
      setConfig((c) => {
        if (agent === 'all') return c // master cannot be disabled
        return {
          ...c,
          digests: {
            ...c.digests,
            [agent]: { ...c.digests[agent], enabled: !c.digests[agent].enabled },
          },
        }
      }),
    [],
  )

  const resetToDefaults = useCallback(() => setConfig(SYSTEM_DEFAULT), [])

  async function handleConfirmedSend() {
    setSending(true)
    try {
      await sendEmailDigestNow(dealerId, weekStart)
      setSent(true)
      setShowConfirm(false)
    } finally {
      setSending(false)
    }
  }

  const isDirty = JSON.stringify(config) !== JSON.stringify(SYSTEM_DEFAULT)

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-700 font-medium">Failed to load data</p>
        <p className="text-red-500 text-sm mt-1">{error}</p>
      </div>
    )
  }

  return (
    <>
      {showConfirm && (
        <ConfirmModal
          onConfirm={handleConfirmedSend}
          onCancel={() => setShowConfirm(false)}
          sending={sending}
          agentLabel={AGENTS.find((a) => a.key === previewAgent)?.label ?? 'Master'}
          recipients={config.digests[previewAgent].recipients}
        />
      )}

      <div className="flex flex-col gap-5">
        {/* Page header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Email Digest</h2>
            <p className="text-sm text-slate-400 mt-1">
              Configure and preview the weekly ROI report email sent to dealer contacts
            </p>
          </div>
          {isDirty && (
            <button
              onClick={resetToDefaults}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition-colors flex-shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to defaults
            </button>
          )}
        </div>

        <div className="flex gap-5 items-start">
          {/* ── Left: Configuration panel ── */}
          <div className="w-80 flex-shrink-0 flex flex-col gap-3">

            {/* Default setup callout — what dealers receive if nothing is configured */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl px-4 py-3.5 shadow-sm">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5 ring-2 ring-white">
                  <Info className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-orange-900">Default setup</p>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-white/70 border border-orange-200 px-1.5 py-0.5 rounded">
                      Auto-applied
                    </span>
                  </div>
                  <p className="text-xs text-orange-800/90 mt-1.5 leading-relaxed">
                    If a dealer doesn't configure anything, Vini sends the{' '}
                    <span className="font-semibold">Master digest weekly on Monday at 7:00 AM</span>{' '}
                    in their local timezone to the <span className="font-semibold">dealer primary contact</span>.
                  </p>
                  <ul className="text-xs text-orange-800/80 mt-2 flex flex-col gap-0.5">
                    <li className="flex items-start gap-1.5">
                      <span className="text-orange-500 mt-0.5">•</span>
                      <span>Master digest enabled · 4 agent digests off</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-orange-500 mt-0.5">•</span>
                      <span>All standard sections on (Top Calls off)</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-orange-500 mt-0.5">•</span>
                      <span>Fields you change show a removed "Default" tag</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-5 divide-y divide-slate-50">
              <SectionHeader title="Schedule" open={scheduleOpen} onToggle={() => setScheduleOpen((v) => !v)} />
              {scheduleOpen && (
                <SchedulePanel
                  schedule={config.schedule}
                  timezone={data?.dealer.timezone ?? ''}
                  onChange={updateSchedule}
                />
              )}
            </div>

            {/* Report Sections */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-5 divide-y divide-slate-50">
              <SectionHeader title="Report Sections" open={sectionsOpen} onToggle={() => setSectionsOpen((v) => !v)} />
              {sectionsOpen && (
                <div className="py-3 flex flex-col">
                  {SECTION_META.map((s) => (
                    <div
                      key={s.key}
                      className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-slate-400">{s.icon}</span>
                        <span className="text-sm text-slate-700">{s.label}</span>
                        {s.defaultOn === config.sections[s.key] && (
                          <DefaultBadge />
                        )}
                      </div>
                      <Toggle on={config.sections[s.key]} onChange={() => toggleSection(s.key)} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Digests — master + 4 agents, each with own recipients */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-5 divide-y divide-slate-50">
              <SectionHeader title="Digests & Recipients" open={digestsOpen} onToggle={() => setDigestsOpen((v) => !v)} />
              {digestsOpen && (
                <div className="py-3 flex flex-col gap-2">
                  <p className="text-xs text-slate-400 leading-relaxed mb-1">
                    Master goes to the dealer principal. Enable agent digests to route filtered
                    reports to department/team leads.
                  </p>
                  {AGENTS.map((agent) => {
                    const d = config.digests[agent.key]
                    const isMaster = agent.key === 'all'
                    const isExpanded = expandedDigest === agent.key
                    const isPreviewed = previewAgent === agent.key
                    return (
                      <div
                        key={agent.key}
                        className={`border rounded-lg transition-colors ${
                          isPreviewed ? 'border-orange-300 bg-orange-50/40' : 'border-slate-100 bg-white'
                        }`}
                      >
                        <button
                          onClick={() => {
                            setExpandedDigest(isExpanded ? null : agent.key)
                            setPreviewAgent(agent.key)
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                              isMaster || d.enabled ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate">{agent.label}</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {isMaster && d.recipients.length === 0
                                ? 'Dealer primary contact'
                                : d.recipients.length === 0
                                ? 'No recipients'
                                : `${d.recipients.length} recipient${d.recipients.length === 1 ? '' : 's'}`}
                            </p>
                          </div>
                          {!isMaster && (
                            <span
                              role="switch"
                              aria-checked={d.enabled}
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleDigest(agent.key)
                              }}
                              className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors duration-200 cursor-pointer ${
                                d.enabled ? 'bg-orange-500' : 'bg-slate-200'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 mt-0.5 ${
                                  d.enabled ? 'translate-x-4' : 'translate-x-0.5'
                                }`}
                              />
                            </span>
                          )}
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="px-3 pb-3 pt-1 flex flex-col gap-2 border-t border-slate-100">
                            <p className="text-xs text-slate-400 leading-relaxed">{agent.description}</p>
                            {d.recipients.length === 0 && isMaster && (
                              <p className="text-xs text-slate-400 italic">
                                Primary dealer contact always receives this. Add others below.
                              </p>
                            )}
                            {d.recipients.length === 0 && !isMaster && (
                              <p className="text-xs text-amber-600 italic">
                                No recipients — digest won't be sent even if enabled.
                              </p>
                            )}
                            {d.recipients.map((r) => (
                              <div
                                key={r}
                                className="flex items-center justify-between gap-2 bg-slate-50 rounded-md px-2.5 py-1.5"
                              >
                                <span className="text-xs text-slate-700 truncate">{r}</span>
                                <button
                                  onClick={() => removeRecipient(agent.key, r)}
                                  className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                            <div className="flex gap-1.5">
                              <input
                                type="email"
                                placeholder={
                                  agent.key === 'service_inbound' || agent.key === 'service_outbound'
                                    ? 'service-mgr@dealer.com'
                                    : agent.key === 'sales_inbound' || agent.key === 'sales_outbound'
                                    ? 'sales-mgr@dealer.com'
                                    : 'Add email address'
                                }
                                value={recipientInputs[agent.key]}
                                onChange={(e) =>
                                  setRecipientInputs((r) => ({ ...r, [agent.key]: e.target.value }))
                                }
                                onKeyDown={(e) => e.key === 'Enter' && addRecipient(agent.key)}
                                className="flex-1 min-w-0 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                              />
                              <button
                                onClick={() => addRecipient(agent.key)}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md px-2 py-1.5 transition-colors flex-shrink-0"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Manual Send */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <p className="text-sm font-semibold text-slate-700 mb-1">Manual Send</p>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Send immediately for QA or on-demand delivery, outside the regular schedule.
              </p>
              <button
                onClick={() => !sent && setShowConfirm(true)}
                disabled={sent || loading}
                className={`w-full flex items-center justify-center gap-2 font-medium px-4 py-2.5 rounded-lg text-sm transition-all ${
                  sent
                    ? 'bg-emerald-600 text-white cursor-default'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                } disabled:opacity-70`}
              >
                {sent ? (
                  <><CheckCircle className="w-4 h-4" /> Sent</>
                ) : (
                  <><Send className="w-4 h-4" /> Send Now</>
                )}
              </button>
            </div>

            {/* Send History */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-5 divide-y divide-slate-50">
                <SectionHeader title="Send History" open={historyOpen} onToggle={() => setHistoryOpen((v) => !v)} />
              </div>
              {historyOpen && (
                <div className="divide-y divide-slate-50">
                  {SEND_HISTORY.map((item) => (
                    <div key={item.id} className="px-5 py-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-slate-700 font-medium">
                          {format(parseISO(item.sentAt), 'EEE, MMM d')}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {format(parseISO(item.sentAt), 'h:mm a')}
                          {item.openRate ? ` · ${item.openRate} opened` : ''}
                        </p>
                      </div>
                      {item.status === 'delivered' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Email preview ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            {/* Digest selector — segmented control: All | Service In/Out | Sales In/Out */}
            <div className="bg-white border border-slate-200 rounded-xl p-1.5 shadow-sm inline-flex items-center gap-1.5 self-start">
              {(() => {
                const groups: { label: string | null; items: typeof AGENTS }[] = [
                  { label: null, items: AGENTS.filter((a) => a.key === 'all') },
                  {
                    label: 'Service',
                    items: AGENTS.filter((a) => a.department === 'service'),
                  },
                  {
                    label: 'Sales',
                    items: AGENTS.filter((a) => a.department === 'sales'),
                  },
                ]
                return groups.map((group, gi) => (
                  <div key={gi} className="flex items-center gap-1">
                    {gi > 0 && <div className="w-px h-6 bg-slate-100 mx-0.5" />}
                    {group.label && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-1.5">
                        {group.label}
                      </span>
                    )}
                    {group.items.map((agent) => {
                      const d = config.digests[agent.key]
                      const isMaster = agent.key === 'all'
                      const isOn = isMaster || d.enabled
                      const isActive = previewAgent === agent.key
                      const segmentLabel =
                        isMaster
                          ? 'All Agents'
                          : agent.direction === 'inbound'
                          ? 'Inbound'
                          : 'Outbound'
                      return (
                        <button
                          key={agent.key}
                          onClick={() => {
                            setPreviewAgent(agent.key)
                            setExpandedDigest(agent.key)
                          }}
                          title={agent.description}
                          className={`relative text-sm font-medium px-3 py-1.5 rounded-lg transition-all ${
                            isActive
                              ? 'bg-orange-500 text-white shadow-sm shadow-orange-200'
                              : isOn
                              ? 'text-slate-700 hover:bg-slate-50'
                              : 'text-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            {segmentLabel}
                            {!isMaster && !isOn && (
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isActive ? 'bg-white/70' : 'bg-slate-300'
                                }`}
                                title="Digest off"
                              />
                            )}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                ))
              })()}
            </div>

            {loading || !data ? (
              <div className="rounded-xl border border-slate-200 overflow-hidden animate-pulse">
                <div className="bg-orange-100 h-16" />
                <div className="p-6 flex flex-col gap-4 bg-white">
                  <div className="h-5 w-40 bg-slate-200 rounded" />
                  <div className="h-20 bg-slate-100 rounded-lg" />
                  <div className="h-40 bg-slate-100 rounded-lg" />
                  <div className="h-24 bg-slate-100 rounded-lg" />
                </div>
              </div>
            ) : (
              <EmailDigestPreview
                data={data}
                sectionConfig={config.sections}
                agentKey={previewAgent}
                recipients={config.digests[previewAgent].recipients}
              />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
