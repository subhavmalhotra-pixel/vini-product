import { useEffect, useState } from 'react'
import { MessageSquareText, Pencil, Play, RotateCcw, Sparkles } from 'lucide-react'
import { listPersonas } from '../api/mockApi'
import { PageHeader } from '../components/Layout'
import type { Persona, Scenario } from '../types'

export const DEFAULT_FIRST_MESSAGE =
  'Hi there, this is {{agent_name}} from {{dealership_name}}. How can I help you today?'

export function PersonaSelection({
  scenario,
  selectedId,
  onSelect,
  firstMessage,
  onFirstMessageChange,
  dealershipName,
}: {
  scenario: Scenario
  selectedId: string | null
  onSelect: (p: Persona) => void
  firstMessage: string
  onFirstMessageChange: (v: string) => void
  dealershipName: string
}) {
  const [personas, setPersonas] = useState<Persona[]>([])
  const [editingMessage, setEditingMessage] = useState(false)

  useEffect(() => {
    listPersonas(scenario.agentType).then(setPersonas)
  }, [scenario.agentType])

  const selectedPersona = personas.find((p) => p.id === selectedId) ?? null
  const previewed = firstMessage
    .replace('{{agent_name}}', selectedPersona?.name ?? '<agent_name>')
    .replace('{{dealership_name}}', dealershipName)

  return (
    <div className="space-y-5">
      <PageHeader
        title={
          scenario.agentType === 'service'
            ? "Choose your Service Inbound Agent's Persona"
            : 'Persona Selection'
        }
        subtitle="Pick a voice for your agent and tune the greeting they open every call with."
      />

      <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-3 text-[12px] text-spyne-violet flex items-center gap-2">
        <Sparkles size={14} />
        Phase 1: persona library unchanged from production. First Message lives here now (moved from Agent Customization).
      </div>

      {/* Persona library */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {personas.map((p) => {
          const selected = p.id === selectedId
          return (
            <article
              key={p.id}
              className={[
                'rounded-xl border bg-white shadow-card overflow-hidden transition',
                selected ? 'border-spyne-violet ring-2 ring-violet-200' : 'border-spyne-line hover:border-violet-200',
              ].join(' ')}
            >
              <div className="aspect-[4/3] bg-gradient-to-br from-violet-100 to-pink-100 flex items-end justify-center">
                <img src={p.image_url} alt={p.name} className="w-2/3 h-full object-contain" />
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[15px] font-semibold text-spyne-ink">{p.name}</h3>
                  <button className="text-spyne-violet hover:underline inline-flex items-center gap-1 text-[12px]">
                    <Play size={12} /> Listen
                  </button>
                </div>
                <p className="text-[12px] text-spyne-mute mt-0.5">{p.accent} · {p.language}</p>
                <button
                  type="button"
                  onClick={() => onSelect(p)}
                  className={[
                    'mt-3 w-full rounded-md px-3 py-1.5 text-[13px] font-semibold',
                    selected
                      ? 'bg-spyne-ink text-white'
                      : 'border border-spyne-line text-spyne-ink hover:bg-spyne-paper',
                  ].join(' ')}
                >
                  {selected ? 'Selected' : `Select ${p.name.split(' ')[0]}`}
                </button>
              </div>
            </article>
          )
        })}
      </div>

      {/* First Message — moved here from Agent Customization */}
      <section className="rounded-xl border border-spyne-line bg-white p-5 shadow-card">
        <header className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageSquareText className="text-spyne-violet" size={16} />
            <h2 className="text-[14px] font-semibold text-spyne-ink">First Message</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onFirstMessageChange(DEFAULT_FIRST_MESSAGE)}
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-spyne-violet hover:underline"
            >
              <RotateCcw size={12} /> Restore default
            </button>
            <button
              type="button"
              onClick={() => setEditingMessage((v) => !v)}
              className={[
                'inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-semibold',
                editingMessage ? 'bg-spyne-ink text-white' : 'border border-spyne-line text-spyne-ink hover:bg-spyne-paper',
              ].join(' ')}
            >
              <Pencil size={11} />
              {editingMessage ? 'Done' : 'Edit'}
            </button>
          </div>
        </header>

        <p className="text-[12px] text-spyne-mute mb-2">
          Variables <code className="rounded bg-spyne-paper px-1">{`{{agent_name}}`}</code> and{' '}
          <code className="rounded bg-spyne-paper px-1">{`{{dealership_name}}`}</code> are interpolated at call time.
        </p>

        {editingMessage ? (
          <>
            <textarea
              value={firstMessage}
              onChange={(e) => onFirstMessageChange(e.target.value)}
              maxLength={250}
              rows={3}
              className="w-full rounded-md border border-spyne-line bg-white px-3 py-2 text-sm focus:outline-none focus:border-spyne-violet"
            />
            <div className="mt-1 text-[11px] text-spyne-mute text-right">{firstMessage.length}/250</div>
          </>
        ) : (
          <div className="rounded-md border border-spyne-line bg-spyne-paper px-3 py-2 text-[13px] text-spyne-ink">
            {firstMessage}
          </div>
        )}

        <div className="mt-3 rounded-md border border-dashed border-spyne-line bg-white px-3 py-2 text-[12px]">
          <div className="text-[10.5px] uppercase tracking-wide text-spyne-mute mb-0.5">Preview at call time</div>
          <div className="text-spyne-ink">{previewed}</div>
        </div>
      </section>
    </div>
  )
}
