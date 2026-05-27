import { useState } from 'react'
import { Mic, Loader2, CheckCircle2 } from 'lucide-react'
import { runTestAgent } from '../api/mockApi'
import { PageHeader } from '../components/Layout'
import type { Persona } from '../types'

export function TestAgent({
  persona,
  onResult,
}: {
  persona: Persona | null
  onResult: (passed: boolean) => void
}) {
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<{ passed: boolean; duration_s: number } | null>(null)

  const start = async () => {
    setRunning(true)
    const r = await runTestAgent()
    setResult(r)
    setRunning(false)
    onResult(r.passed)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Test Agent"
        subtitle="Validate the configured agent on a sample conversation."
      />

      <section className="rounded-3xl border border-spyne-line bg-gradient-to-br from-violet-50 via-pink-50 to-amber-50 p-10 min-h-[420px] grid place-items-center">
        <div className="text-center max-w-[480px]">
          {persona ? (
            <img src={persona.image_url} alt={persona.name} className="w-32 h-32 rounded-full mx-auto bg-white shadow-pop object-contain" />
          ) : (
            <div className="w-32 h-32 rounded-full mx-auto bg-white shadow-pop grid place-items-center text-spyne-mute">
              No persona
            </div>
          )}
          <h2 className="mt-4 text-[18px] font-bold text-spyne-ink">{persona?.name ?? 'Test Agent'}</h2>
          <p className="text-[13px] text-spyne-mute">{persona?.role ?? 'Awesome. I am ready now'}</p>
          <p className="text-[12px] text-spyne-mute mt-1">
            {persona?.accent} · {persona?.language}
          </p>

          <button
            type="button"
            onClick={start}
            disabled={running}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-spyne-ink px-6 py-3 text-sm font-semibold text-white hover:bg-black disabled:bg-spyne-ink/40"
          >
            {running ? <Loader2 className="animate-spin" size={16} /> : <Mic size={16} />}
            {running ? 'Listening…' : 'Talk to me'}
          </button>

          {result && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[12px] font-semibold text-emerald-700">
              <CheckCircle2 size={14} />
              Test passed · {result.duration_s}s
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
