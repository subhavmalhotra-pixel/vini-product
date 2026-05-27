import type { ActionItem, ActionType } from "@test-data";
import { CTAButton } from "./CTAButton";

const ACTION_LABELS: Record<ActionType, string> = {
  sms_takeover: "SMS takeover requested",
  appt_confirmed: "Appointments confirmed today",
  failed_booking: "Failed bookings to review",
  specific_salesperson: "Customers asked for a salesperson",
  compliance_alert: "Compliance alerts",
  callback_request: "Callback requests",
  recall_response: "Recall responses",
  pending_status_update: "Pending repair-order status",
  no_show: "No-shows yesterday",
};

type ActionRequiredSectionProps = {
  items: ActionItem[];
};

export function ActionRequiredSection({ items }: ActionRequiredSectionProps) {
  if (!items.length) return null;

  return (
    <section className="border-t border-border-subtle px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <h2 className="text-xs font-medium uppercase tracking-wide text-text-secondary">
        Action required
      </h2>
      <ul className="mt-3 divide-y divide-border-subtle">
        {items.map((item, idx) => (
          <li
            key={idx}
            className="flex min-h-[40px] items-baseline gap-3 py-2.5"
          >
            <span className="inline-flex h-6 min-w-[1.75rem] flex-shrink-0 items-center justify-center rounded-md bg-text-primary px-1.5 text-xs font-bold tabular text-white">
              {item.count}
            </span>
            <span className="text-sm leading-relaxed text-text-primary">
              {ACTION_LABELS[item.type]}
              {item.agent_type ? (
                <span className="ml-1.5 text-xs text-text-secondary">
                  · {item.agent_type.replace("_", " ")}
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
      {/* v3: single common Review CTA at the bottom — no per-line buttons */}
      <div className="mt-5">
        <CTAButton
          label="Review action items"
          href="/console/inbox?view=action_required"
        />
      </div>
    </section>
  );
}
