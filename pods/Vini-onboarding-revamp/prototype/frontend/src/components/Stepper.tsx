import {
  Building2,
  PhoneCall,
  UserCircle,
  ListChecks,
  Settings2,
  FlaskConical,
  Sparkles,
  CheckCircle2,
  Mail,
} from 'lucide-react'

export type StepKey =
  | 'rooftop'
  | 'cnam'
  | 'persona'
  | 'agent_customization' // legacy — no longer used in flow but retained for backwards compat
  | 'service_config'
  | 'test_agent'
  | 'go_live'

export interface StepDef {
  key: StepKey
  label: string
  hidden?: boolean
}

const ICONS: Record<StepKey, React.ComponentType<any>> = {
  rooftop: Building2,
  cnam: PhoneCall,
  persona: UserCircle,
  agent_customization: Settings2,
  service_config: ListChecks,
  test_agent: FlaskConical,
  go_live: CheckCircle2,
}

export function Stepper({
  steps,
  activeKey,
  completedKeys,
  onJump,
}: {
  steps: StepDef[]
  activeKey: StepKey
  completedKeys: StepKey[]
  onJump?: (k: StepKey) => void
}) {
  return (
    <ol className="relative flex flex-col items-center gap-6 mt-2">
      {/* vertical guide line */}
      <span className="absolute left-1/2 -translate-x-1/2 top-3 bottom-3 w-0.5 bg-spyne-line -z-0" />
      {steps
        .filter((s) => !s.hidden)
        .map((s) => {
          const Icon = ICONS[s.key] ?? Sparkles
          const completed = completedKeys.includes(s.key)
          const active = activeKey === s.key
          return (
            <li key={s.key} className="relative z-10" title={s.label}>
              <button
                type="button"
                onClick={() => onJump?.(s.key)}
                className={[
                  'w-9 h-9 rounded-full grid place-items-center transition border',
                  active
                    ? 'bg-violet-50 border-violet-300 text-spyne-violet ring-4 ring-violet-100'
                    : completed
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-600'
                      : 'bg-white border-spyne-line text-spyne-mute',
                ].join(' ')}
                aria-current={active ? 'step' : undefined}
              >
                <Icon size={16} />
              </button>
            </li>
          )
        })}
      <li className="relative z-10" title="Post-onboarding checklist">
        <div className="w-9 h-9 rounded-full grid place-items-center border border-dashed border-spyne-line bg-white text-spyne-mute">
          <Mail size={16} />
        </div>
      </li>
    </ol>
  )
}
