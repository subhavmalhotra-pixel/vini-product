import { useEffect, useState } from "react";
import type { ActionItem, ResolutionType } from "@test-data";
import { closeActionItem, type AppointmentInput } from "../data/store";
import { Drawer } from "./Drawer";
import { Button } from "./Button";
import { IntentChip } from "./IntentChip";
import { ConversationSnippet } from "./ConversationSnippet";
import { AppointmentPicker } from "./AppointmentPicker";
import { SparkleIcon, CheckIcon } from "./Icon";

const RESOLUTION_OPTIONS: { value: ResolutionType; label: string }[] = [
  { value: "appointment_booked", label: "Appointment booked" },
  { value: "info_provided", label: "Info provided" },
  { value: "customer_unreachable", label: "Customer unreachable" },
  { value: "dnc", label: "DNC requested" },
  { value: "other", label: "Other" },
];

type QuickAction = { label: string; note: string; type: ResolutionType };

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: "Booked appointment",
    note: "Booked appointment for the scheduled date/time; confirmation sent.",
    type: "appointment_booked",
  },
  {
    label: "Left voicemail",
    note: "Called the customer; left voicemail. Will retry tomorrow.",
    type: "customer_unreachable",
  },
  {
    label: "Sent quote via email",
    note: "Sent itemized quote via email; awaiting customer confirmation.",
    type: "info_provided",
  },
  // Phase 1 design contract #7 — fifth canned chip · covers Madison's 5th
  // most-common closure path so 1-tap close stays viable.
  {
    label: "Info provided",
    note: "Provided the requested information; no further action needed.",
    type: "info_provided",
  },
  {
    label: "Customer requested DNC",
    note: "Customer requested DNC; flagged in CRM and removed from marketing audiences.",
    type: "dnc",
  },
];

export function CloseDrawer({
  item,
  onClose,
  onOpenSource,
}: {
  item: ActionItem | null;
  onClose: () => void;
  onOpenSource?: (item: ActionItem) => void;
}) {
  const open = !!item;
  const [resolutionType, setResolutionType] = useState<ResolutionType | "">("");
  const [note, setNote] = useState<string>("");
  const [appointment, setAppointment] = useState<AppointmentInput | null>(null);
  const [error, setError] = useState<string>("");

  // Reset state whenever a new item is opened
  useEffect(() => {
    if (item) {
      setResolutionType("");
      setNote("");
      setAppointment(null);
      setError("");
    }
  }, [item?.action_item_id]); // eslint-disable-line react-hooks/exhaustive-deps

  const applyQuickAction = (qa: QuickAction) => {
    setNote(qa.note);
    setResolutionType(qa.type);
    setError("");
    if (qa.type !== "appointment_booked") {
      setAppointment(null);
    }
  };

  const noteLen = note.trim().length;
  const requiresAppointment = resolutionType === "appointment_booked";
  const appointmentValid =
    !requiresAppointment ||
    (appointment !== null &&
      (appointment.kind === "existing" ||
        (appointment.kind === "new" && !!appointment.scheduled_at)));
  const canSubmit = !!resolutionType && noteLen >= 10 && appointmentValid;

  const submit = () => {
    if (!item || !canSubmit) return;
    try {
      closeActionItem(
        item.action_item_id,
        resolutionType as ResolutionType,
        note.trim(),
        undefined,
        requiresAppointment ? appointment ?? undefined : undefined
      );
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to close");
    }
  };

  return (
    <Drawer open={open} onClose={onClose} title="Mark action item closed" width="500px">
      {item ? (
        <div className="flex h-full flex-col">
          {/* Context strip */}
          <section className="flex-shrink-0 border-b border-border-subtle bg-surface-subtle/60 px-5 py-3">
            <div className="flex items-center gap-2">
              <IntentChip
                intentId={item.intent_id}
                primary={item.is_primary_intent_of_source}
                size="md"
              />
              <span className="font-mono text-[10px] text-text-tertiary">
                {item.action_item_id}
              </span>
            </div>
            <p className="mt-1.5 text-[13px] leading-snug text-text-primary">
              {item.intent_recap}
            </p>
          </section>

          <section className="flex-1 space-y-4 overflow-y-auto px-5 py-4 scroll-thin">
            {/* Source conversation snippet */}
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                Source conversation
              </label>
              <div className="mt-1.5">
                <ConversationSnippet item={item} onViewFull={onOpenSource} />
              </div>
            </div>

            {/* AI suggested steps */}
            <div className="rounded-lg border border-brand-purple-border bg-brand-purple-soft/40 px-3.5 py-2.5">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-brand-purple">
                <SparkleIcon size={12} />
                <span>AI suggested next steps</span>
              </div>
              <ul className="mt-2 space-y-1 text-[13px] text-text-primary">
                {suggestedSteps(item).map((step, i) => (
                  <li key={i} className="flex gap-2 leading-snug">
                    <span className="text-brand-purple">•</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick actions */}
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                Quick actions
              </label>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {QUICK_ACTIONS.map((qa) => (
                  <button
                    key={qa.label}
                    onClick={() => applyQuickAction(qa)}
                    className="rounded-md border border-border-subtle bg-white px-2.5 py-1 text-[11px] font-medium text-text-secondary hover:border-brand-purple hover:bg-brand-purple-soft hover:text-brand-purple"
                  >
                    {qa.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Resolution type */}
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                Resolution type <span className="text-status-past">*</span>
              </label>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {RESOLUTION_OPTIONS.map((opt) => {
                  const active = resolutionType === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setResolutionType(opt.value);
                        if (opt.value !== "appointment_booked") {
                          setAppointment(null);
                        }
                      }}
                      className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-medium ${
                        active
                          ? "border-brand-purple bg-brand-purple-soft text-brand-purple"
                          : "border-border-subtle bg-white text-text-secondary hover:bg-surface-subtle"
                      }`}
                    >
                      {active ? <CheckIcon size={10} /> : null}
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Appointment picker (only when appointment_booked) */}
            {requiresAppointment ? (
              <AppointmentPicker
                customerId={item.customer_id}
                value={appointment}
                onChange={setAppointment}
              />
            ) : null}

            {/* Resolution note */}
            <div>
              <label className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                <span>
                  Resolution note <span className="text-status-past">*</span>
                </span>
                <span className="tabular font-normal lowercase text-text-tertiary">
                  {noteLen} / 10 min
                </span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="What did you do? (audit log — kept in console, never surfaced in emails)"
                className="mt-1.5 w-full rounded-md border border-border-subtle px-3 py-2 text-[13px] focus:border-brand-purple focus:outline-none"
              />
              <p className="mt-1 text-[10px] text-text-tertiary">
                Resolution notes are BDC-internal. Never appear in customer-facing emails.
              </p>
            </div>

            {error ? (
              <div className="rounded-md border border-status-past/30 bg-status-past-soft px-3 py-2 text-[12px] text-status-past">
                {error}
              </div>
            ) : null}
          </section>

          <footer className="flex flex-shrink-0 items-center justify-between gap-2 border-t border-border-subtle bg-white px-5 py-3">
            <span className="text-[11px] text-text-tertiary">
              Closing this item only. Other items on this customer stay open.
            </span>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" disabled={!canSubmit} onClick={submit}>
                <CheckIcon size={12} /> Mark closed
              </Button>
            </div>
          </footer>
        </div>
      ) : null}
    </Drawer>
  );
}

function suggestedSteps(item: ActionItem): string[] {
  switch (item.intent_id) {
    case "status_update":
      return [
        "Look up the customer's open RO in the service system",
        "Reply via the customer's preferred channel with the current status",
        "If the work is delayed, escalate to the advisor before responding",
      ];
    case "pricing_quote":
      return [
        "Generate the itemized quote in the pricing tool",
        "Send the quote via the customer's preferred channel",
        "Schedule a 48-hour follow-up if no response",
      ];
    case "recall_response":
      return [
        "Verify the customer's VIN against the recall database",
        "If eligible, book a service appointment and explain the scope",
        "If not eligible, send a courtesy note explaining the verification",
      ];
    case "callback_request":
      return [
        "Call the customer at their preferred contact time",
        "If unreachable, leave a voicemail and retry once before closing",
        "Log the conversation outcome in the note below",
      ];
    case "compliance_alert":
      return [
        "Mark the customer as DNC in the CRM",
        "Remove the customer from all active marketing audiences",
        "Log the request timestamp for compliance audit",
      ];
    case "no_show":
      return [
        "Reach out to the customer to reschedule",
        "If unreachable in 24h, flag for outbound campaign",
        "Document the outcome on the appointment",
      ];
    default:
      return [
        "Review the source conversation and intent recap",
        "Take the appropriate action for this intent type",
        "Log a clear resolution note for the audit trail",
      ];
  }
}
