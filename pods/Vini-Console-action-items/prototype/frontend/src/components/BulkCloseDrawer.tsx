import { useEffect, useMemo, useState } from "react";
import type { ActionItem, ResolutionType, Conversation } from "@test-data";
import {
  closeActionItem,
  getCustomerDetails,
  getConversation,
  type AppointmentInput,
} from "../data/store";
import { Drawer } from "./Drawer";
import { Button } from "./Button";
import { IntentChip } from "./IntentChip";
import { AppointmentPicker } from "./AppointmentPicker";
import { ChannelIcon } from "./ChannelIcon";
import { formatDateTime } from "../data/helpers";
import {
  CheckIcon,
  SparkleIcon,
  PlayIcon,
  AlertIcon,
} from "./Icon";

type ItemState = {
  selected: boolean;
  resolutionType: ResolutionType | "";
  resolutionNote: string;
  collapsed: boolean;
};

type QuickAction = {
  label: string;
  resolutionType: ResolutionType;
  noteByIntent: (intent: string) => string;
};

const RESOLUTION_OPTIONS: { value: ResolutionType; label: string }[] = [
  { value: "appointment_booked", label: "Appointment booked" },
  { value: "info_provided", label: "Info provided" },
  { value: "customer_unreachable", label: "Customer unreachable" },
  { value: "dnc", label: "DNC requested" },
  { value: "other", label: "Other" },
];

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: "Mark all info provided",
    resolutionType: "info_provided",
    noteByIntent: (intent) =>
      `Provided requested information for the ${intent.replace(/_/g, " ")} ask; customer acknowledged.`,
  },
  {
    label: "Mark all unreachable",
    resolutionType: "customer_unreachable",
    noteByIntent: () =>
      "Attempted contact multiple times; customer unreachable. Will retry.",
  },
  {
    label: "Booked single appt for all",
    resolutionType: "appointment_booked",
    noteByIntent: (intent) =>
      `Resolved during the scheduled appointment along with related ${intent.replace(/_/g, " ")}.`,
  },
];

/**
 * Bulk close drawer — handles N pending action items on a single customer
 * (typically a multi-intent conversation like pricing + recall, or
 * vehicle + trade + quote on one email).
 *
 * Per-item: deselect, pick resolution_type, write note.
 * Shared: a single appointment can satisfy multiple items if any pick
 * `appointment_booked` — saves the user from re-entering the same date.
 * Quick-apply: chip row applies a (resolution_type, note) preset to every
 * selected item at once.
 */
export function BulkCloseDrawer({
  items,
  onClose,
  onOpenSource,
}: {
  items: ActionItem[] | null;
  onClose: () => void;
  onOpenSource?: (item: ActionItem) => void;
}) {
  const open = !!items && items.length > 0;
  const customerId = items?.[0]?.customer_id ?? null;
  const customer = customerId ? getCustomerDetails(customerId) : null;

  const [states, setStates] = useState<Record<string, ItemState>>({});
  const [appointment, setAppointment] = useState<AppointmentInput | null>(null);
  const [error, setError] = useState<string>("");
  const [busy, setBusy] = useState<boolean>(false);

  // Reset per-item state whenever the items prop changes
  useEffect(() => {
    if (!items) return;
    const next: Record<string, ItemState> = {};
    for (const it of items) {
      next[it.action_item_id] = {
        selected: true,
        resolutionType: "",
        resolutionNote: "",
        collapsed: false,
      };
    }
    setStates(next);
    setAppointment(null);
    setError("");
  }, [items]);

  const selectedItems = useMemo(
    () =>
      (items ?? []).filter(
        (it) => states[it.action_item_id]?.selected ?? false
      ),
    [items, states]
  );

  const itemsNeedingAppointment = selectedItems.filter(
    (it) => states[it.action_item_id]?.resolutionType === "appointment_booked"
  );

  // Group unique source conversations for the context strip
  const uniqueConvs: Conversation[] = useMemo(() => {
    if (!items) return [];
    const seen = new Set<string>();
    const out: Conversation[] = [];
    for (const it of items) {
      if (seen.has(it.source_conversation_id)) continue;
      seen.add(it.source_conversation_id);
      const c = getConversation(it.source_conversation_id);
      if (c) out.push(c);
    }
    return out;
  }, [items]);

  // Validation
  const incompleteItem = selectedItems.find((it) => {
    const s = states[it.action_item_id];
    if (!s) return true;
    if (!s.resolutionType) return true;
    if (s.resolutionNote.trim().length < 10) return true;
    return false;
  });
  const needsAppointment = itemsNeedingAppointment.length > 0;
  const appointmentValid =
    !needsAppointment ||
    (appointment !== null &&
      (appointment.kind === "existing" ||
        (appointment.kind === "new" && !!appointment.scheduled_at)));
  const canSubmit =
    selectedItems.length > 0 && !incompleteItem && appointmentValid && !busy;

  const updateItem = (id: string, patch: Partial<ItemState>) => {
    setStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...patch },
    }));
  };

  const applyQuickAction = (qa: QuickAction) => {
    if (!items) return;
    setStates((prev) => {
      const next = { ...prev };
      for (const it of items) {
        if (!next[it.action_item_id]?.selected) continue;
        next[it.action_item_id] = {
          ...next[it.action_item_id],
          resolutionType: qa.resolutionType,
          resolutionNote: qa.noteByIntent(it.intent_id),
        };
      }
      return next;
    });
  };

  const submit = () => {
    if (!canSubmit || !items) return;
    setBusy(true);
    try {
      for (const it of selectedItems) {
        const s = states[it.action_item_id];
        const isAppt = s.resolutionType === "appointment_booked";
        closeActionItem(
          it.action_item_id,
          s.resolutionType as ResolutionType,
          s.resolutionNote.trim(),
          undefined,
          isAppt ? appointment ?? undefined : undefined
        );
      }
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to close items");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="640px"
      title={
        customer
          ? `Resolve ${items?.length ?? 0} items · ${customer.display_name}`
          : "Resolve action items"
      }
    >
      {items && customer ? (
        <div className="flex h-full flex-col">
          {/* Context strip — customer + source conversations */}
          <section className="flex-shrink-0 border-b border-border-subtle bg-surface-subtle/60 px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-text-primary">
                {customer.display_name}
              </span>
              <span className="text-text-tertiary">·</span>
              <span className="tabular text-[11px] text-text-tertiary">
                {customer.phone}
              </span>
              <span className="text-text-tertiary">·</span>
              <span className="text-[11px] text-text-tertiary">
                {items.length} pending
              </span>
            </div>
            {uniqueConvs.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {uniqueConvs.map((c) => {
                  const ownerItem = items.find(
                    (it) => it.source_conversation_id === c.conversation_id
                  );
                  return (
                    <button
                      key={c.conversation_id}
                      onClick={() => ownerItem && onOpenSource?.(ownerItem)}
                      className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-white px-2 py-0.5 text-[10px] text-text-secondary hover:border-brand-purple hover:text-brand-purple"
                    >
                      <ChannelIcon channel={c.channel} />
                      <span className="font-mono">{c.conversation_id.slice(-6)}</span>
                      <span>·</span>
                      <span className="tabular">{formatDateTime(c.started_at)}</span>
                      <PlayIcon size={9} />
                    </button>
                  );
                })}
              </div>
            ) : null}
          </section>

          {/* Quick actions */}
          <section className="flex-shrink-0 border-b border-border-subtle bg-white px-5 py-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
                Apply to all selected
              </span>
              {QUICK_ACTIONS.map((qa) => (
                <button
                  key={qa.label}
                  onClick={() => applyQuickAction(qa)}
                  className="rounded-md border border-border-subtle bg-white px-2 py-0.5 text-[11px] font-medium text-text-secondary hover:border-brand-purple hover:bg-brand-purple-soft hover:text-brand-purple"
                >
                  <SparkleIcon size={10} />{" "}
                  <span className="ml-0.5">{qa.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Per-item list */}
          <section className="flex-1 space-y-2.5 overflow-y-auto bg-surface-background px-5 py-4 scroll-thin">
            {items.map((item, idx) => (
              <ItemCard
                key={item.action_item_id}
                index={idx + 1}
                item={item}
                state={states[item.action_item_id]}
                onUpdate={(patch) => updateItem(item.action_item_id, patch)}
                onViewSource={onOpenSource}
              />
            ))}

            {/* Shared appointment — only when at least one item needs it */}
            {needsAppointment && customerId ? (
              <div className="space-y-1.5">
                <div className="text-[11px] text-text-secondary">
                  <strong className="font-semibold">
                    Shared appointment
                  </strong>{" "}
                  · used by {itemsNeedingAppointment.length} of{" "}
                  {selectedItems.length} item
                  {selectedItems.length === 1 ? "" : "s"}
                </div>
                <AppointmentPicker
                  customerId={customerId}
                  value={appointment}
                  onChange={setAppointment}
                />
              </div>
            ) : null}

            {error ? (
              <div className="flex items-start gap-2 rounded-md border border-status-past/30 bg-status-past-soft px-3 py-2 text-[12px] text-status-past">
                <AlertIcon size={12} />
                {error}
              </div>
            ) : null}
          </section>

          {/* Footer */}
          <footer className="flex flex-shrink-0 items-center justify-between gap-2 border-t border-border-subtle bg-white px-5 py-3">
            <span className="text-[11px] text-text-tertiary">
              {selectedItems.length} of {items.length} selected ·{" "}
              {selectedItems.length === items.length
                ? "closing all"
                : "deselected items stay open"}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" disabled={!canSubmit} onClick={submit}>
                <CheckIcon size={12} />
                Mark {selectedItems.length}{" "}
                {selectedItems.length === 1 ? "item" : "items"} closed
              </Button>
            </div>
          </footer>
        </div>
      ) : null}
    </Drawer>
  );
}

/* ============================================================
   Per-item card inside the bulk drawer
   ============================================================ */

function ItemCard({
  index,
  item,
  state,
  onUpdate,
  onViewSource,
}: {
  index: number;
  item: ActionItem;
  state: ItemState | undefined;
  onUpdate: (patch: Partial<ItemState>) => void;
  onViewSource?: (item: ActionItem) => void;
}) {
  if (!state) return null;
  const noteLen = state.resolutionNote.trim().length;
  const noteOk = noteLen >= 10;
  const typeOk = !!state.resolutionType;
  const complete = state.selected && typeOk && noteOk;

  return (
    <article
      className={`rounded-lg border bg-white ${
        !state.selected
          ? "border-border-subtle opacity-60"
          : complete
            ? "border-status-ok/40"
            : "border-border-subtle"
      }`}
    >
      <header className="flex items-center justify-between gap-2 px-3 py-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={state.selected}
            onChange={(e) => onUpdate({ selected: e.target.checked })}
            className="h-3.5 w-3.5 cursor-pointer rounded border-border-strong text-brand-purple focus:ring-brand-purple"
            aria-label={`Include item ${index}`}
          />
          <span className="text-[10px] font-mono text-text-tertiary">
            #{index}
          </span>
          <IntentChip
            intentId={item.intent_id}
            size="sm"
            primary={item.is_primary_intent_of_source}
          />
          {complete ? (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-status-ok-soft px-1.5 py-0.5 text-[10px] font-semibold text-status-ok">
              <CheckIcon size={9} /> Ready
            </span>
          ) : null}
        </div>
        <button
          onClick={() => onViewSource?.(item)}
          className="text-[11px] font-medium text-brand-purple hover:underline"
        >
          <PlayIcon size={10} /> Source
        </button>
      </header>

      <div className="px-3 pb-3">
        <p className="text-[12px] leading-snug text-text-primary">
          {item.intent_recap}
        </p>

        {state.selected ? (
          <>
            {/* Resolution type */}
            <div className="mt-2.5">
              <label className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
                Resolution type <span className="text-status-past">*</span>
              </label>
              <div className="mt-1 flex flex-wrap gap-1">
                {RESOLUTION_OPTIONS.map((opt) => {
                  const active = state.resolutionType === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() =>
                        onUpdate({
                          resolutionType: active ? "" : opt.value,
                        })
                      }
                      className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${
                        active
                          ? "border-brand-purple bg-brand-purple-soft text-brand-purple"
                          : "border-border-subtle bg-white text-text-secondary hover:bg-surface-subtle"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Note */}
            <div className="mt-2.5">
              <label className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
                <span>
                  Resolution note <span className="text-status-past">*</span>
                </span>
                <span className="tabular font-normal lowercase text-text-tertiary">
                  {noteLen} / 10 min
                </span>
              </label>
              <textarea
                value={state.resolutionNote}
                onChange={(e) =>
                  onUpdate({ resolutionNote: e.target.value })
                }
                rows={2}
                placeholder="Resolution note for audit log…"
                className={`mt-1 w-full rounded-md border px-2.5 py-1.5 text-[12px] focus:outline-none ${
                  noteOk
                    ? "border-border-subtle focus:border-brand-purple"
                    : "border-border-subtle focus:border-brand-purple"
                }`}
              />
            </div>
          </>
        ) : (
          <div className="mt-2 text-[11px] italic text-text-tertiary">
            Deselected — this item stays open for later resolution.
          </div>
        )}
      </div>
    </article>
  );
}
