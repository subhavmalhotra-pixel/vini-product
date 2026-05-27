import { Link, useParams } from "react-router-dom";
import {
  Card,
  PageHeading,
  Pill,
  PrimaryCTA,
  SectionLabel,
  EmptyState,
} from "../components/ui";
import { HOT_LEADS } from "../data/platform-mock";
import { ALL_JOURNEYS_TS } from "../data/journey-lookup";

export function LeadDrilldown() {
  const { leadId } = useParams<{ leadId: string }>();
  const lead = HOT_LEADS.find((l) => l.journey_id === leadId);
  const journey = leadId ? ALL_JOURNEYS_TS[leadId] : undefined;

  if (!lead || !journey) {
    return (
      <div className="px-4 sm:px-6 md:px-10 py-10 max-w-3xl mx-auto">
        <EmptyState
          title="Lead not found"
          body="This lead may have been archived or doesn't exist in your view."
          action={
            <PrimaryCTA as="a" href="/dashboard">
              Back to dashboard
            </PrimaryCTA>
          }
        />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 md:px-10 py-6 sm:py-8 md:py-10 max-w-5xl mx-auto">
      <Link
        to="/dashboard"
        className="inline-flex items-center text-sm text-brand-primary font-medium hover:underline mb-4"
      >
        ← Back to dashboard
      </Link>

      <PageHeading
        title={lead.customer_ref}
        subtitle={lead.intent}
        trailing={<Pill tone={statusTone(lead.status)}>{lead.status}</Pill>}
      />

      {/* Profile + Vehicle */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="p-5 sm:p-6 lg:col-span-1">
          <SectionLabel>Vehicle</SectionLabel>
          <div className="mt-3 text-base font-semibold text-text-primary">
            {lead.vehicle ?? "Not yet identified"}
          </div>
          <dl className="mt-4 space-y-2.5 text-sm">
            <Row term="Touches">{lead.touches}</Row>
            <Row term="Channels">
              <span className="inline-flex gap-1.5 flex-wrap">
                {lead.channels.map((c) => (
                  <Pill key={c} tone="neutral">{c}</Pill>
                ))}
              </span>
            </Row>
            <Row term="Last contact">{lead.last_touch}</Row>
            <Row term="Outcome">
              <Pill tone={outcomeTone(journey.outcome)}>{formatOutcome(journey.outcome)}</Pill>
            </Row>
          </dl>
        </Card>

        {/* Call recording card */}
        <Card className="p-5 sm:p-6 lg:col-span-2">
          <SectionLabel>Latest call recording</SectionLabel>
          <div className="mt-3 flex items-center gap-4 p-4 bg-surface-background rounded-md border border-border-subtle">
            <button
              type="button"
              aria-label="Play recording"
              className="h-12 w-12 shrink-0 rounded-full bg-brand-primary text-white grid place-items-center hover:bg-brand-primary-hover transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-text-primary">
                Audio · 4:32
              </div>
              <div className="mt-1 text-xs text-text-secondary">
                {journey.turns.find((t) => t.channel === "call")
                  ? "Most recent call captured during this journey"
                  : "No call audio yet — start with the chat / SMS thread below"}
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-border-subtle overflow-hidden">
                <div className="h-full w-1/3 bg-brand-primary rounded-full" />
              </div>
            </div>
          </div>
          <div className="mt-4">
            <PrimaryCTA variant="outline">Download transcript</PrimaryCTA>
          </div>
        </Card>
      </div>

      {/* Outreach timeline */}
      <Card className="p-5 sm:p-6 mb-6 sm:mb-8">
        <SectionLabel>Outreach timeline</SectionLabel>
        <ol className="mt-4 space-y-4">
          {journey.turns.map((turn, idx) => (
            <li key={idx} className="flex gap-3 sm:gap-4">
              <div className="flex flex-col items-center shrink-0">
                <div
                  className={`h-2.5 w-2.5 rounded-full ${
                    turn.speaker === "agent" ? "bg-brand-primary" : "bg-text-muted"
                  }`}
                />
                {idx !== journey.turns.length - 1 && (
                  <div className="flex-1 w-px bg-border-subtle mt-1" />
                )}
              </div>
              <div className="flex-1 min-w-0 pb-4">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs">
                  <Pill tone="neutral">{turn.channel}</Pill>
                  <span className="text-text-secondary font-medium">
                    {turn.speaker === "agent" ? "Vini agent" : "the customer"}
                  </span>
                  <span className="text-text-muted">{formatTime(turn.timestamp)}</span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-text-primary">
                  {sanitize(turn.text)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}

function Row({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-text-secondary">{term}</dt>
      <dd className="text-text-primary text-right">{children}</dd>
    </div>
  );
}

function statusTone(s: string): "positive" | "brand" | "neutral" | "muted" {
  if (s === "Booked") return "positive";
  if (s === "Hot") return "brand";
  if (s === "Warm") return "neutral";
  return "muted";
}

function outcomeTone(o: string): "positive" | "neutral" | "muted" | "negative" {
  if (o === "appointment_booked" || o === "warm_transfer") return "positive";
  if (o === "follow_up") return "neutral";
  if (o === "opted_out" || o === "dnc") return "negative";
  return "muted";
}

function formatOutcome(o: string): string {
  const map: Record<string, string> = {
    appointment_booked: "Appointment booked",
    warm_transfer: "Warm transfer",
    follow_up: "Follow-up needed",
    no_response: "No response",
    opted_out: "Opted out",
    dnc: "Do-not-call",
    lost: "Lost",
  };
  return map[o] ?? o;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// Strip names that appear in transcripts; keep the rest readable.
const KNOWN_NAMES = [
  "Jamie",
  "Caldwell",
  "Robert",
  "Hayes",
  "Linda",
  "Park",
  "Devon",
  "Albright",
];
function sanitize(text: string): string {
  let t = text;
  for (const name of KNOWN_NAMES) {
    t = t.replace(new RegExp(`\\b${name}\\b`, "gi"), "the customer");
  }
  return t;
}
