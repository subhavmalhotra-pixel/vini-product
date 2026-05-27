import { useEffect, useState } from 'react'
import { Mail, ExternalLink, Loader2, Sparkles } from 'lucide-react'
import { sendPostOnboardingChecklist, type ChecklistEmail } from '../api/mockApi'
import { PageHeader } from '../components/Layout'
import type { Scenario } from '../types'

export function PostOnboardingEmail({ scenario }: { scenario: Scenario }) {
  const [email, setEmail] = useState<ChecklistEmail | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let abort = false
    setLoading(true)
    sendPostOnboardingChecklist(scenario.id).then((e) => {
      if (!abort) {
        setEmail(e)
        setLoading(false)
      }
    })
    return () => {
      abort = true
    }
  }, [scenario.id])

  return (
    <div className="space-y-5">
      <PageHeader
        title="Post-onboarding checklist email"
        subtitle="Auto-sent 1h after Test Agent. Consolidates integration wizards, comms prefs, and the go-live status board."
      />

      {loading || !email ? (
        <div className="rounded-xl border border-dashed border-spyne-line bg-white p-6 text-center text-[13px] text-spyne-mute">
          <Loader2 className="animate-spin mx-auto mb-2 text-spyne-violet" size={16} />
          Building the email preview…
        </div>
      ) : (
        <article className="rounded-xl border border-spyne-line bg-white p-6 shadow-card max-w-[760px]">
          <header className="flex items-center gap-2 text-[12px] text-spyne-mute pb-3 border-b border-spyne-line">
            <Mail size={14} />
            <span>To: <strong className="text-spyne-ink">{email.to}</strong></span>
            <span>·</span>
            <span>cc: {email.cc.join(', ')}</span>
          </header>

          <h2 className="mt-3 text-[16px] font-semibold text-spyne-ink">{email.subject}</h2>

          <p className="mt-2 text-[13px] text-spyne-ink">
            Hi — your Vini agent for <strong>{scenario.label.split(' — ')[0]}</strong> is set up. Complete the steps
            below in the next 48 hours so the agent can go fully live.
          </p>

          <ol className="mt-4 space-y-3">
            {email.rows.map((r, i) => (
              <li key={r.title} className="rounded-lg border border-spyne-line p-3 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-violet-50 text-spyne-violet grid place-items-center text-[12px] font-bold">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-spyne-ink">{r.title}</div>
                  <div className="text-[12px] text-spyne-mute">{r.description}</div>
                </div>
                <a
                  href={r.link}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 inline-flex items-center gap-1 rounded-md bg-spyne-ink text-white px-3 py-1.5 text-[12px] font-semibold hover:bg-black"
                >
                  {r.cta} <ExternalLink size={11} />
                </a>
              </li>
            ))}
          </ol>

          <p className="mt-5 text-[12px] text-spyne-mute">
            Need help? Reply to this email or schedule a 15-min call with your CSM.
          </p>
        </article>
      )}

      <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 text-[12px] text-spyne-violet flex items-center gap-2 max-w-[760px]">
        <Sparkles size={14} />
        Reminders auto-fire at 24 h and 48 h; Slack alert to CSM at Day 3 if items remain pending.
      </div>
    </div>
  )
}
