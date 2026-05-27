/**
 * Live email preview rendered alongside the subscription editor.
 *
 * Renders a representative snippet of what the email will look like with the
 * given section-toggle and frequency state — re-renders in real time as the
 * user toggles. Production note: this preview component should ultimately
 * share the same render layer as the production email pipeline (single source
 * of truth). For the prototype we render a high-fidelity HTML snippet inline.
 */
import { Card, Pill, SectionLabel } from "./ui";

type SectionMap = Record<string, boolean>;

type Props = {
  emailType: "daily" | "weekly" | "monthly" | "eoc";
  enabled: boolean;
  sections: SectionMap;
  frequency: string;
  /** When true, render without the outer Card chrome — for use inside a parent container that already provides framing (e.g., the right-nav-bar preview rail). */
  bare?: boolean;
};

const EMAIL_LABELS: Record<string, string> = {
  daily: "Daily digest",
  weekly: "Weekly performance",
  monthly: "Monthly value report",
  eoc: "End-of-campaign report",
};

export function EmailPreviewPane({
  emailType,
  enabled,
  sections,
  frequency,
  bare = false,
}: Props) {
  if (!enabled) {
    const body = (
      <div className="text-sm text-text-secondary">
        This recipient will not receive the {EMAIL_LABELS[emailType]}.
      </div>
    );
    if (bare) {
      return (
        <>
          <SectionLabel>Preview</SectionLabel>
          <div className="mt-3">{body}</div>
        </>
      );
    }
    return (
      <Card className="p-4">
        <SectionLabel>Preview</SectionLabel>
        <div className="mt-3">{body}</div>
      </Card>
    );
  }

  const content = (
    <div className="space-y-4 text-[13px]">
      {/* Header snippet always renders */}
      <div className="border border-border-subtle rounded-md px-3 py-2.5 bg-surface-card">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-brand-primary">
          Vini · Dealer Reporting
        </div>
        <div className="text-sm font-semibold mt-0.5 text-text-primary">
          {EMAIL_LABELS[emailType]}
        </div>
        <div className="text-[11px] text-text-secondary mt-0.5">
          Honda of Downtown LA · sample preview
        </div>
      </div>

      {emailType === "daily" && <DailyPreview sections={sections} />}
      {emailType === "weekly" && <WeeklyPreview sections={sections} />}
      {emailType === "monthly" && <MonthlyPreview sections={sections} />}
      {emailType === "eoc" && <EOCPreview sections={sections} />}

      <div className="border-t border-border-subtle pt-3 text-[10px] text-text-muted">
        Footer · Manage subscription
      </div>
    </div>
  );

  if (bare) {
    return content;
  }

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b border-border-subtle bg-surface-background">
        <div className="flex items-baseline justify-between">
          <SectionLabel>Preview · {EMAIL_LABELS[emailType]}</SectionLabel>
          <Pill tone="brand">{frequency}</Pill>
        </div>
        <p className="text-[11px] text-text-muted mt-1">
          What this recipient will see, updated as you change sections.
        </p>
      </div>
      <div className="p-4 sm:p-5">{content}</div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-email-type render functions — each shows the section as included or
// silently absent. Toggling a section in the editor causes that section's
// block here to appear / disappear.
// ─────────────────────────────────────────────────────────────────────────────

function PreviewSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-border-subtle rounded-md p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
        {title}
      </div>
      <div className="mt-1.5 text-[13px] text-text-primary">{children}</div>
    </div>
  );
}

function DailyPreview({ sections }: { sections: SectionMap }) {
  return (
    <>
      {sections.hero !== false && (
        <PreviewSection title="Hero">
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold tabular text-text-primary">14</span>
            <span className="text-xs text-text-secondary">appts yesterday · 142 MTD</span>
          </div>
        </PreviewSection>
      )}
      {sections.action_required !== false && (
        <PreviewSection title="Action required">
          <span className="tabular text-sm">3 SMS takeovers · 8 confirmed today · 1 failed booking</span>
          <div className="mt-2 inline-flex items-center bg-brand-primary text-white text-[11px] font-bold px-3 py-1.5 rounded">
            Review 12 items
          </div>
        </PreviewSection>
      )}
      {sections.inbound_kpis !== false && (
        <PreviewSection title="Inbound KPIs">
          <div className="grid grid-cols-2 gap-3 mt-1 text-[12px]">
            <div><div className="text-text-secondary">Unique leads</div><div className="tabular font-bold">58</div></div>
            <div><div className="text-text-secondary">Appointments</div><div className="tabular font-bold">14</div></div>
          </div>
        </PreviewSection>
      )}
      {sections.top_vehicles !== false && (
        <PreviewSection title="Top vehicles">
          Civic 2025 · CR-V 2025 · Pilot 2024 · Accord 2024
        </PreviewSection>
      )}
      {sections.outbound !== false && (
        <PreviewSection title="Outbound activity">
          84 reached · 38% connect · 4 appts
        </PreviewSection>
      )}
      {sections.after_hours !== false && (
        <PreviewSection title="After-hours coverage">
          11 leads engaged · 4 appts booked
        </PreviewSection>
      )}
    </>
  );
}

function WeeklyPreview({ sections }: { sections: SectionMap }) {
  return (
    <>
      {sections.kpi_strip !== false && (
        <PreviewSection title="Per-agent KPI strip">
          <div className="grid grid-cols-2 gap-2 mt-1 text-[12px]">
            <div><div className="text-text-secondary">Leads</div><div className="tabular font-bold">287</div></div>
            <div><div className="text-text-secondary">Appts</div><div className="tabular font-bold">94</div></div>
            <div><div className="text-text-secondary">Avg first-contact</div><div className="tabular font-bold">48s</div></div>
            <div><div className="text-text-secondary">Warm transfers</div><div className="tabular font-bold">41</div></div>
          </div>
        </PreviewSection>
      )}
      {sections.trend_table !== false && (
        <PreviewSection title="Day-by-day">
          Mon → Sun · leads, interactions, appointments
        </PreviewSection>
      )}
      {sections.funnel !== false && (
        <PreviewSection title="Customer journey funnel">
          287 reached → 219 engaged → 94 converted
        </PreviewSection>
      )}
      {sections.channel_performance !== false && (
        <PreviewSection title="Channel performance">
          Call · SMS · Chat
        </PreviewSection>
      )}
      {sections.top_breakout !== false && (
        <PreviewSection title="Top vehicles / services">
          Top 4 by volume
        </PreviewSection>
      )}
      {sections.story !== false && (
        <PreviewSection title="Story of the week">
          One anonymized customer journey · 2-3 paragraphs
        </PreviewSection>
      )}
    </>
  );
}

function MonthlyPreview({ sections }: { sections: SectionMap }) {
  return (
    <>
      {sections.hero !== false && (
        <PreviewSection title="Hero (3 stat tiles)">
          1,420 customers reached · 147 appts · 47 lapsed re-engaged
        </PreviewSection>
      )}
      {sections.kpi_grid !== false && (
        <PreviewSection title="6-card KPI grid">
          MoM deltas across customers, appts, after-hours, lapsed, first-contact, BDC-hours
        </PreviewSection>
      )}
      {sections.value_estimate !== false && (
        <PreviewSection title="Your value estimate (optional)">
          Renders only if avg appointment value is configured
        </PreviewSection>
      )}
      {sections.trend_chart !== false && (
        <PreviewSection title="6-month trend">
          Appointments over the trailing 6 months
        </PreviewSection>
      )}
      {sections.customer_centric !== false && (
        <PreviewSection title="Customer-centric view">
          New vs returning · avg touches · lapsed re-engagements
        </PreviewSection>
      )}
      {sections.stories !== false && (
        <PreviewSection title="3 customer stories">
          Highest-value · most multi-touch · best after-hours
        </PreviewSection>
      )}
    </>
  );
}

function EOCPreview({ sections }: { sections: SectionMap }) {
  return (
    <>
      {sections.headline !== false && (
        <PreviewSection title="Headline">
          634 appointments from 5,200 contactable · 12.2% conversion
        </PreviewSection>
      )}
      {sections.funnel !== false && (
        <PreviewSection title="Reach funnel">
          Reached → Engaged → Booked
        </PreviewSection>
      )}
      {sections.touchpoint !== false && (
        <PreviewSection title="Per-touchpoint performance">
          First-touch + last-touch attribution
        </PreviewSection>
      )}
      {sections.multichannel !== false && (
        <PreviewSection title="Multichannel performance">
          Call · SMS · Email — engagement % and appts
        </PreviewSection>
      )}
      {sections.objections !== false && (
        <PreviewSection title="Top exit intents">
          Vehicle purchased · Not in market · Opt-out · Awaiting next model
        </PreviewSection>
      )}
      {sections.recommendations !== false && (
        <PreviewSection title="Recommendations">
          3-5 actionable next-campaign suggestions
        </PreviewSection>
      )}
    </>
  );
}
