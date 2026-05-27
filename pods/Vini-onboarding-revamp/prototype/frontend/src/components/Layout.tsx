import {
  Home as HomeIcon,
  Video,
  Sparkles,
  Megaphone,
  BarChart3,
  Settings,
  MoreHorizontal,
  CircleHelp,
  ChevronRight,
  FileText,
} from 'lucide-react'
import type { ReactNode } from 'react'
import type { Scenario } from '../types'

export interface LayoutProps {
  children: ReactNode
  duration: string
  rooftopName: string
  scenarios: Scenario[]
  activeScenarioId: string
  onScenarioChange: (id: string) => void
  onOpenDocs?: () => void
}

// Matches the recordings: tight chrome with a Spyne Retail Suite header,
// a thin left nav rail (Home / Studio AI / Vini AI / Marketing AI / Analytics
// / Settings / More) and a "Help" button at the bottom.
export function Layout({
  children,
  duration,
  rooftopName,
  scenarios,
  activeScenarioId,
  onScenarioChange,
  onOpenDocs,
}: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-spyne-paper">
      {/* Left nav rail */}
      <aside className="hidden md:flex w-14 shrink-0 flex-col items-center justify-between border-r border-spyne-line bg-white py-4">
        <div className="space-y-2">
          <RailIcon icon={<HomeIcon size={18} />} label="Home" />
          <RailIcon icon={<Video size={18} />} label="Studio AI" />
          <RailIcon icon={<Sparkles size={18} />} label="Vini AI" active />
          <RailIcon icon={<Megaphone size={18} />} label="Marketing AI" />
          <RailIcon icon={<BarChart3 size={18} />} label="Analytics" />
          <RailIcon icon={<Settings size={18} />} label="Settings" />
          <RailIcon icon={<MoreHorizontal size={18} />} label="More" />
        </div>
        <RailIcon icon={<CircleHelp size={18} />} label="Help" />
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-14 flex items-center justify-between border-b border-spyne-line bg-white px-4">
          <div className="flex items-center gap-3">
            <Logo />
            <div className="leading-tight">
              <div className="text-[15px] font-semibold text-spyne-violet">Retail Suite</div>
              <div className="text-[11px] text-spyne-mute -mt-0.5">by spyne</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Scenario picker — demo affordance only */}
            <label className="hidden md:inline-flex items-center gap-2 rounded-full border border-spyne-line bg-spyne-paper px-2 py-1">
              <span className="text-[11px] uppercase tracking-wide text-spyne-mute">Scenario</span>
              <select
                value={activeScenarioId}
                onChange={(e) => onScenarioChange(e.target.value)}
                className="bg-transparent text-[13px] font-medium text-spyne-ink focus:outline-none"
              >
                {scenarios.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </label>

            {onOpenDocs && (
              <button
                type="button"
                onClick={onOpenDocs}
                className="inline-flex items-center gap-1.5 rounded-md border border-spyne-line bg-white px-2.5 py-1 text-[12px] font-semibold text-spyne-ink hover:bg-spyne-paper"
                title="Customer signal + PRD"
              >
                <FileText size={13} />
                Docs
              </button>
            )}

            <span className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-violet-100 to-pink-100 px-2 py-1 text-[12px] font-medium text-spyne-violetDark">
              Studio AI <span className="rounded bg-pink-200 px-1 text-[10px] font-semibold uppercase text-pink-700">PRO</span>
            </span>

            <div className="flex items-center gap-2">
              <div className="text-right leading-tight">
                <div className="text-[12px] font-semibold text-spyne-ink">asfd</div>
                <div className="text-[10px] text-spyne-mute -mt-0.5">{rooftopName}</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-spyne-violet text-white flex items-center justify-center text-[12px] font-semibold">A</div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1280px] mx-auto px-6 py-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <ScreenIcon />
                <div>
                  <div className="text-[22px] font-bold text-spyne-ink leading-tight">
                    {/* Children pages override their own header; this is a fallback. */}
                    <span className="sr-only">Section</span>
                  </div>
                </div>
              </div>
              <div className="text-right text-[12px] text-spyne-mute">
                <div className="uppercase tracking-wide">Duration</div>
                <div className="flex items-center justify-end gap-2 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 toast-pulse" />
                  <span className="font-mono text-spyne-ink">{duration}</span>
                </div>
              </div>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

function Logo() {
  // A simplified version of the colorful loop in the recording
  return (
    <div className="w-8 h-8 rounded-md bg-gradient-to-br from-violet-500 via-fuchsia-500 to-amber-400 grid place-items-center text-white text-[12px] font-extrabold shadow-sm">
      <span style={{ textShadow: '0 1px 1px rgba(0,0,0,0.15)' }}>R</span>
    </div>
  )
}

function ScreenIcon() {
  return (
    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-100 to-pink-100 grid place-items-center">
      <Sparkles className="text-spyne-violet" size={20} />
    </div>
  )
}

function RailIcon({ icon, label, active = false }: { icon: ReactNode; label: string; active?: boolean }) {
  return (
    <div className="group flex flex-col items-center gap-1 cursor-default">
      <div
        className={[
          'w-9 h-9 rounded-lg grid place-items-center transition',
          active
            ? 'bg-violet-50 text-spyne-violet ring-1 ring-violet-200'
            : 'text-spyne-mute hover:bg-spyne-paper hover:text-spyne-ink',
        ].join(' ')}
        aria-label={label}
        title={label}
      >
        {icon}
      </div>
      <span className={['text-[9px]', active ? 'text-spyne-violet font-semibold' : 'text-spyne-mute'].join(' ')}>
        {label}
      </span>
    </div>
  )
}

// --------------------------------------------------------------------------
// Two-column body: stepper sidebar + content
// --------------------------------------------------------------------------

export interface StepperBodyProps {
  stepper: ReactNode
  contextPanel?: ReactNode
  children: ReactNode
  footer?: ReactNode
}

export function StepperBody({ stepper, contextPanel, children, footer }: StepperBodyProps) {
  return (
    <div className="flex gap-6">
      <div className="hidden md:flex flex-col w-12 shrink-0 items-center">{stepper}</div>
      <div className="flex-1 min-w-0">
        <div className="grid grid-cols-1 lg:grid-cols-[260px,1fr] gap-6">
          {contextPanel ? (
            <div className="space-y-4">{contextPanel}</div>
          ) : (
            <div className="hidden lg:block" />
          )}
          <div className="space-y-4">{children}</div>
        </div>
        {footer && <div className="mt-6 pb-6">{footer}</div>}
      </div>
    </div>
  )
}

export function PageHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <div className="mb-2">
      <h1 className="text-[22px] font-extrabold text-spyne-ink leading-tight tracking-tight">{title}</h1>
      <p className="text-[13px] text-spyne-mute mt-1">{subtitle}</p>
    </div>
  )
}

export function FooterNav({
  onBack,
  onNext,
  nextLabel = 'Next',
  nextDisabled = false,
  rightExtras,
  leftExtras,
}: {
  onBack?: () => void
  onNext?: () => void
  nextLabel?: string
  nextDisabled?: boolean
  rightExtras?: ReactNode
  leftExtras?: ReactNode
}) {
  return (
    <div className="flex items-center justify-between border-t border-spyne-line pt-4">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 rounded-lg border border-spyne-line bg-white text-sm font-medium text-spyne-ink hover:bg-spyne-paper"
          >
            Back
          </button>
        )}
        {leftExtras}
      </div>
      <div className="flex items-center gap-3">
        {rightExtras}
        {onNext && (
          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled}
            className={[
              'cta-next inline-flex items-center gap-1.5 px-6 py-2.5 rounded-lg text-sm font-semibold text-white',
              nextDisabled
                ? 'bg-spyne-ink/30 cursor-not-allowed'
                : 'bg-spyne-ink hover:bg-black',
            ].join(' ')}
          >
            {nextLabel} <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
