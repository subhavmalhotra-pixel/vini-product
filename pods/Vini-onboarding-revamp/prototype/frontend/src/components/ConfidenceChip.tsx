import clsx from 'clsx'
import { Check, Sparkles, ScanText, AlertCircle, FileCheck2, FileText, UserRoundPlus } from 'lucide-react'
import type { Confidence, Source, Tracked } from '../types'

const LABELS: Record<Confidence, string> = {
  high: 'Verified',
  medium: 'LLM',
  low: 'Derived',
  none: 'Missing',
}

const STYLES: Record<Confidence, string> = {
  high:   'bg-spyne-chipGreen  text-spyne-okText',
  medium: 'bg-spyne-chipYellow text-spyne-warnText',
  low:    'bg-spyne-chipBlue   text-spyne-infoText',
  none:   'bg-spyne-chipRed    text-spyne-dangerText',
}

const ICONS: Record<Confidence, React.ComponentType<any>> = {
  high: Check,
  medium: Sparkles,
  low: ScanText,
  none: AlertCircle,
}

export function ConfidenceChip({
  confidence,
  source,
  className,
}: {
  confidence: Confidence
  source?: Source
  className?: string
}) {
  // High-confidence fields show no chip — the input's green border alone
  // signals "auto-filled, no action needed." Only review-needed states surface.
  if (confidence === 'high') return null
  const Icon = ICONS[confidence]
  const title = source ? `${LABELS[confidence]} · source: ${source}` : LABELS[confidence]
  return (
    <span
      title={title}
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide',
        STYLES[confidence],
        className,
      )}
    >
      <Icon size={11} />
      {LABELS[confidence]}
    </span>
  )
}

export function SourceChip({ source }: { source: Source }) {
  if (!source) return null
  const map: Record<NonNullable<Source>, { label: string; icon: React.ComponentType<any> }> = {
    schema_org: { label: 'Schema.org', icon: FileCheck2 },
    llm:        { label: 'LLM',        icon: Sparkles },
    derived:    { label: 'Derived',    icon: ScanText },
    contract:   { label: 'Contract',   icon: FileText },
    invite:     { label: 'Invite',     icon: UserRoundPlus },
    directory:  { label: 'Directory',  icon: UserRoundPlus },
    registry:   { label: 'Registry',   icon: FileCheck2 },
  }
  const m = map[source]
  if (!m) return null
  const Icon = m.icon
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-spyne-chipGray px-1.5 py-0.5 text-[10px] font-medium text-spyne-mute">
      <Icon size={10} />
      {m.label}
    </span>
  )
}

// --------------------------------------------------------------------------
// Inline auto-fill field — used across all screens.
// Confirm/Edit/Reject pattern from PRD §4.1 QA list.
// --------------------------------------------------------------------------

export function AutoFillField({
  label,
  tracked,
  onChange,
  required = false,
  placeholder,
  className,
}: {
  label: string
  tracked: Tracked
  onChange: (next: string) => void
  required?: boolean
  placeholder?: string
  className?: string
}) {
  const hasValue = !!tracked.value && tracked.value.trim() !== ''
  const isMissing = !hasValue
  return (
    <div className={clsx('group', className)}>
      <div className="flex items-center justify-between mb-1">
        <label className="text-[12px] font-medium text-spyne-mute">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <div className="flex items-center gap-1.5">
          {hasValue && <ConfidenceChip confidence={tracked.confidence} source={tracked.source} />}
          {hasValue && tracked.confidence !== 'high' && <SourceChip source={tracked.source} />}
        </div>
      </div>
      <input
        type="text"
        value={tracked.value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? (required ? 'Required' : '')}
        className={clsx(
          'w-full rounded-md border px-3 py-2 text-sm transition',
          isMissing
            ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-1 focus:ring-red-300'
            : tracked.confidence === 'high'
              ? 'border-emerald-200 bg-emerald-50/40 focus:border-emerald-400 focus:bg-white'
              : tracked.confidence === 'medium'
                ? 'border-amber-200 bg-amber-50/40 focus:border-amber-400 focus:bg-white'
                : 'border-spyne-line bg-white',
          'focus:outline-none',
        )}
      />
    </div>
  )
}
