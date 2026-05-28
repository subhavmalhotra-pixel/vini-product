import { useState } from "react";
import type { ActionItem } from "@test-data";
import { useNavigate } from "react-router-dom";
import { getCustomerDetails, getPendingForCustomer } from "../data/store";
import { slaState } from "../data/helpers";
import { IntentChip, IntentDot } from "./IntentChip";
import { AssigneeBadge } from "./AssigneeBadge";
import { AgeBadge, SLAPill } from "./AgeBadge";
import { ChannelIcon } from "./ChannelIcon";
import { RepeatCallerChip } from "./RepeatCallerChip";
import { EmailLoopBadge } from "./EmailLoopBadge";
import { ConversationSnippet } from "./ConversationSnippet";
import { Button } from "./Button";
import { ChevronRightIcon, BoltIcon } from "./Icon";

type Props = {
  item: ActionItem;
  /** True when the keyboard shortcut focus is on this row. */
  focused?: boolean;
  onFocus?: () => void;
  onAssign: (item: ActionItem) => void;
  onClose: (item: ActionItem) => void;
  onListen: (item: ActionItem) => void;
  onBulkClose?: (items: ActionItem[]) => void;
};

/**
 * Dense pending-row design.
 *
 * Default state: single line — intent dot · customer · intent chip · age · assignee · escalation
 *                · chevron. ~36-40px row height.
 * Expanded state: in-row accordion reveals recap · channel · repeat-caller · email-loop · actions.
 *
 * Click anywhere on the collapsed row toggles expand.
 * Customer-name link bypasses expand and routes to the full profile.
 */
export function PendingRow({
  item,
  focused,
  onFocus,
  onAssign,
  onClose,
  onListen,
  onBulkClose,
}: Props) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const customer = getCustomerDetails(item.customer_id);
  const customerPending = getPendingForCustomer(item.customer_id);
  const otherCount = customerPending.length - 1;
  const hasMultiIntent = otherCount > 0;

  const toggle = () => setOpen((o) => !o);
  const isPastSla = slaState(item) === "past";

  return (
    <div
      data-pending-row
      className={`group relative border-b border-border-subtle bg-surface-card transition-colors duration-150 ${
        open
          ? "bg-surface-subtle"
          : focused
          ? "bg-brand-purple-soft/40"
          : isPastSla
          ? "hover:bg-status-past-soft/40"
          : "hover:bg-surface-subtle/70"
      }`}
      onMouseEnter={onFocus}
    >
      {/* Left accent bar — red on past-SLA rows, purple on focus/expand, grey on hover.
          Past-SLA always wins visually so Anya spots the breach without scanning the row. */}
      <span
        aria-hidden
        className={`absolute inset-y-0 left-0 w-[3px] transition-all duration-150 ${
          isPastSla
            ? "bg-status-past"
            : open
            ? "bg-brand-purple"
            : focused
            ? "bg-brand-purple/70"
            : "bg-transparent group-hover:bg-border-strong/60"
        }`}
      />

      {/* Collapsed row — click toggles expand */}
      <div
        role="button"
        tabIndex={0}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        }}
        aria-expanded={open}
        className="grid cursor-pointer grid-cols-[14px_minmax(0,180px)_minmax(0,1fr)_minmax(100px,auto)_120px_28px_18px] items-center gap-3 px-5 py-2.5"
      >
        {/* Intent dept dot */}
        <IntentDot intentId={item.intent_id} />

        {/* Customer name */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/customers/${item.customer_id}`);
          }}
          className="truncate-1 text-left text-[13px] font-semibold text-text-primary hover:text-brand-purple"
        >
          {customer?.display_name ?? "Unknown"}
        </button>

        {/* Intent + escalation + repeat-caller + multi-intent — Phase 1 design contract #6 */}
        <div className="flex min-w-0 items-center gap-1.5">
          <IntentChip intentId={item.intent_id} />
          {item.escalation_reason ? (
            <span
              className="inline-flex items-center gap-0.5 rounded-full bg-status-past-soft px-1.5 py-0.5 text-[10px] font-semibold text-status-past"
              title={`Escalated: ${item.escalation_reason}`}
            >
              <BoltIcon size={10} /> Escalated
            </span>
          ) : null}
          {/* Repeat-caller chip surfaced on the COLLAPSED row (was expanded-only). */}
          <RepeatCallerChip item={item} />
          {hasMultiIntent ? (
            <span
              className="inline-flex items-center rounded-full bg-brand-purple-soft px-1.5 py-0.5 text-[10px] font-semibold text-brand-purple"
              title={`This customer has ${customerPending.length} pending intents`}
            >
              +{otherCount} more
            </span>
          ) : null}
        </div>

        {/* Age + SLA pill cluster — SLA pill moved adjacent so urgency reads in one glance */}
        <div className="flex items-center gap-1.5">
          {isPastSla ? (
            <span
              className="pulse-dot"
              aria-label="Past service level agreement"
            />
          ) : null}
          <AgeBadge item={item} />
          <SLAPill item={item} />
        </div>

        {/* Assignee */}
        <AssigneeBadge userId={item.assignee_user_id} variant="full" />

        {/* Channel icon (compact, decorative) */}
        <div className="flex items-center justify-end">
          <ChannelIcon channel={item.source_channel} />
        </div>

        {/* Chevron */}
        <span
          className={`flex h-4 w-4 items-center justify-center text-text-tertiary transition-transform duration-200 ease-smooth ${
            open ? "rotate-90 text-brand-purple" : ""
          }`}
          aria-hidden
        >
          <ChevronRightIcon size={14} />
        </span>
      </div>

      {/* Expanded detail */}
      {open ? (
        <div className="animate-fade-in-up border-t border-border-subtle bg-surface-subtle/60 px-5 pb-4 pt-3">
          <div className="grid grid-cols-[1fr_auto] gap-4">
            {/* Left: recap + repeat context + snippet + meta */}
            <div className="min-w-0 space-y-2.5">
              {/* Recap */}
              <p className="text-[13px] leading-relaxed text-text-primary">
                {item.intent_recap}
              </p>

              {/* Recent-contacts explainer — plain-language sentence when the
                  customer is a repeat caller. Replaces what would otherwise
                  require interpreting the cryptic "5× · 3d" chip. */}
              <RepeatContactSentence item={item} />

              {/* Conversation snippet with click-to-view-full */}
              <ConversationSnippet item={item} onViewFull={onListen} />

              {/* Meta + badges — repeat-caller chip now lives on the collapsed row */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-text-tertiary">
                <span className="font-mono text-[10px]">
                  {item.action_item_id}
                </span>
                {customer?.phone ? (
                  <>
                    <span>·</span>
                    <span className="tabular">{customer.phone}</span>
                  </>
                ) : null}
                <EmailLoopBadge item={item} />
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAssign(item);
                  }}
                >
                  {item.assignee_user_id ? "Reassign" : "Assign"}
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose(item);
                  }}
                >
                  Mark closed
                </Button>
              </div>
              {hasMultiIntent && onBulkClose ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onBulkClose(customerPending);
                  }}
                  className="text-[11px] font-medium text-brand-purple hover:underline"
                >
                  Resolve {customerPending.length} together →
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Plain-language sentence summarising repeat-caller history. Only rendered
 * inside the expanded row so Madison gets the explainer without cluttering
 * the dense collapsed view. Replaces the need to mentally decode "5× · 3d".
 */
function RepeatContactSentence({ item }: { item: ActionItem }) {
  if (item.repeat_caller_count < 3) return null;
  const last = new Date(item.last_observed_at);
  const lastLabel = last.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const first = new Date(item.created_at);
  const days = Math.max(
    1,
    Math.ceil((last.getTime() - first.getTime()) / 86_400_000)
  );
  return (
    <div className="flex items-start gap-2 rounded-md border border-status-past/20 bg-status-past-soft/60 px-3 py-2">
      <span className="pulse-dot mt-1.5" aria-hidden />
      <p className="text-[12px] leading-snug text-text-primary">
        <span className="font-semibold text-status-past">
          Repeat caller.
        </span>{" "}
        Customer contacted the BDC{" "}
        <span className="tabular font-semibold">
          {item.repeat_caller_count} times
        </span>{" "}
        across the past{" "}
        <span className="tabular font-semibold">{days} days</span>. Most
        recent contact was on{" "}
        <span className="tabular font-semibold">{lastLabel}</span>.
      </p>
    </div>
  );
}
