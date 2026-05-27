import { useState } from 'react'
import { Shield, ChevronRight, X } from 'lucide-react'
import type { ToggleConfig } from '../types'

// PRD §4.9 — STL + Smart Widget are hidden in the default flow. Reach this UI
// only via "Advanced → Disable…" with a stated reason.
export function StlWidgetAdvanced({
  stl,
  smartWidget,
  onStlChange,
  onSmartWidgetChange,
  onClose,
}: {
  stl: ToggleConfig
  smartWidget: ToggleConfig
  onStlChange: (n: ToggleConfig) => void
  onSmartWidgetChange: (n: ToggleConfig) => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/30 grid place-items-center z-50">
      <div className="bg-white rounded-2xl shadow-pop w-[560px] max-w-[90vw] overflow-hidden">
        <header className="flex items-center justify-between px-5 py-3 border-b border-spyne-line">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-spyne-violet" />
            <h2 className="text-[14px] font-semibold text-spyne-ink">Advanced — Disable defaults</h2>
          </div>
          <button onClick={onClose} className="text-spyne-mute hover:text-spyne-ink"><X size={16} /></button>
        </header>
        <div className="p-5 space-y-4">
          <p className="text-[12px] text-spyne-mute">
            Speed-to-Lead and Smart View are auto-enabled with recommended config. Disabling either is uncommon
            and requires a reason.
          </p>

          <ToggleBlock
            title="Speed-to-Lead"
            description="Instant automated replies to new leads."
            cfg={stl}
            onChange={onStlChange}
          />
          <ToggleBlock
            title="Smart View widget"
            description="Embed the Vini chat/voice widget on the dealer's site."
            cfg={smartWidget}
            onChange={onSmartWidgetChange}
          />
        </div>
        <footer className="px-5 py-3 border-t border-spyne-line flex justify-end">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1 rounded-md bg-spyne-ink text-white px-4 py-2 text-[13px] font-semibold hover:bg-black"
          >
            Save <ChevronRight size={14} />
          </button>
        </footer>
      </div>
    </div>
  )
}

const REASONS = ['Dealer opt-out', 'Channel conflict', 'Will configure later', 'Other'] as const

function ToggleBlock({
  title,
  description,
  cfg,
  onChange,
}: {
  title: string
  description: string
  cfg: ToggleConfig
  onChange: (n: ToggleConfig) => void
}) {
  const [text, setText] = useState(cfg.disable_reason_text ?? '')
  return (
    <div className="rounded-lg border border-spyne-line p-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[13px] font-semibold text-spyne-ink">{title}</div>
          <div className="text-[11.5px] text-spyne-mute">{description}</div>
        </div>
        <button
          type="button"
          onClick={() => onChange({ ...cfg, enabled: !cfg.enabled })}
          className={[
            'relative inline-flex h-5 w-9 items-center rounded-full transition',
            cfg.enabled ? 'bg-spyne-violet' : 'bg-spyne-line',
          ].join(' ')}
        >
          <span
            className={[
              'inline-block h-4 w-4 transform rounded-full bg-white transition',
              cfg.enabled ? 'translate-x-4' : 'translate-x-0.5',
            ].join(' ')}
          />
        </button>
      </div>
      {!cfg.enabled && (
        <div className="mt-3 space-y-2">
          <label className="text-[11.5px] font-medium text-spyne-mute">
            Reason <span className="text-red-500">*</span>
          </label>
          <select
            value={cfg.disable_reason_code ?? ''}
            onChange={(e) => onChange({ ...cfg, disable_reason_code: e.target.value })}
            className="w-full rounded-md border border-spyne-line bg-white px-2 py-1.5 text-[12.5px]"
          >
            <option value="">Select…</option>
            {REASONS.map((r) => (<option key={r} value={r}>{r}</option>))}
          </select>
          <textarea
            placeholder="Detail (required)"
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              onChange({ ...cfg, disable_reason_text: e.target.value })
            }}
            className="w-full rounded-md border border-spyne-line bg-white px-2 py-1.5 text-[12.5px] focus:outline-none focus:border-spyne-violet"
            rows={2}
          />
          {(!cfg.disable_reason_code || !text) && (
            <div className="text-[11px] text-red-600">Reason code and detail are both required to disable.</div>
          )}
        </div>
      )}
    </div>
  )
}
