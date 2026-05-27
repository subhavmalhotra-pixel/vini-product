import clsx from 'clsx'
import { AlertCircle, ChevronRight } from 'lucide-react'
import type { Tracked } from '../types'

export interface NeedsInputItem {
  key: string
  label: string
  required: boolean
  value: string | null
  onChange: (next: string) => void
  placeholder?: string
}

// Helper to build a list of NeedsInputItem from a flat record of trackeds.
// Only includes fields whose value is empty (or whitespace).
export function deriveNeedsInput(
  fields: Array<{
    key: string
    label: string
    required: boolean
    tracked: Tracked
    onChange: (next: string) => void
    placeholder?: string
  }>,
): NeedsInputItem[] {
  return fields
    .filter((f) => !f.tracked.value || !f.tracked.value.trim())
    .map((f) => ({
      key: f.key,
      label: f.label,
      required: f.required,
      value: f.tracked.value,
      onChange: f.onChange,
      placeholder: f.placeholder,
    }))
}

export function NeedsInputPanel({
  items,
  onConfirmAll,
}: {
  items: NeedsInputItem[]
  onConfirmAll?: () => void
}) {
  const requiredCount = items.filter((i) => i.required).length

  return (
    <aside
      className={clsx(
        'rounded-xl border bg-white shadow-card',
        items.length === 0 ? 'border-emerald-200' : 'border-red-200',
      )}
    >
      <div
        className={clsx(
          'px-4 py-3 rounded-t-xl flex items-center justify-between',
          items.length === 0 ? 'bg-emerald-50' : 'bg-red-50',
        )}
      >
        <div className="flex items-center gap-2">
          <AlertCircle size={16} className={items.length === 0 ? 'text-emerald-600' : 'text-red-600'} />
          <h3
            className={clsx(
              'text-[13px] font-semibold tracking-wide uppercase',
              items.length === 0 ? 'text-emerald-700' : 'text-red-700',
            )}
          >
            Needs Input
          </h3>
        </div>
        <span
          className={clsx(
            'rounded-full px-2 py-0.5 text-[11px] font-semibold',
            items.length === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700',
          )}
        >
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="p-4 text-[12px] text-spyne-mute">
          All Must-have fields populated. You can confirm and continue.
        </div>
      ) : (
        <div className="p-4 space-y-3">
          <p className="text-[12px] text-spyne-mute">
            Fill the {requiredCount} Must-have {requiredCount === 1 ? 'field' : 'fields'} below to unblock “Continue.”
          </p>

          {items.map((it) => (
            <div key={it.key}>
              <label className="text-[12px] font-medium text-spyne-ink flex items-center gap-1">
                {it.label}
                {it.required && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                value={it.value ?? ''}
                onChange={(e) => it.onChange(e.target.value)}
                placeholder={it.placeholder ?? ''}
                className="mt-1 w-full rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-sm focus:outline-none focus:border-red-400 focus:bg-white"
              />
            </div>
          ))}

          {onConfirmAll && (
            <button
              type="button"
              onClick={onConfirmAll}
              className="w-full mt-1 inline-flex items-center justify-center gap-1 rounded-md bg-spyne-ink text-white px-3 py-2 text-[13px] font-semibold hover:bg-black"
            >
              Confirm batch <ChevronRight size={14} />
            </button>
          )}
        </div>
      )}
    </aside>
  )
}
