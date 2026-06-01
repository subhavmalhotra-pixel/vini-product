import { useEffect, useState } from "react";
import type { ActionItem, IncorrectReason } from "@test-data";
import { markActionItemIncorrect } from "../data/store";
import { Drawer } from "./Drawer";
import { Button } from "./Button";
import { IntentChip } from "./IntentChip";
import { MaterialSymbol } from "./MaterialSymbol";

/**
 * Mark-as-incorrect drawer · PRD v3.1 §9.6 NEW path.
 *
 * AI false-positive flow. Distinct from Close:
 *   - Emits `action_item.marked_incorrect` (not `action_item.closed`)
 *   - Moves item to `incorrect` status (excluded from closure-rate)
 *   - 5-radio reason picker + optional 240-char note feeds the AI eval loop
 *
 * Intentionally tertiary visual weight — operators reach for it only when
 * the AI got it wrong, not as a shortcut around writing a real resolution.
 */

const REASONS: { value: IncorrectReason; label: string; helper: string }[] = [
  {
    value: "wrong_intent",
    label: "Wrong intent",
    helper: "AI classified this as the wrong type of request.",
  },
  {
    value: "not_a_task",
    label: "Not a task",
    helper: "The customer's message didn't actually require follow-up.",
  },
  {
    value: "customer_did_not_say_this",
    label: "Customer didn't say this",
    helper: "The recap describes something the customer never asked for.",
  },
  {
    value: "duplicate_of_existing",
    label: "Duplicate of existing",
    helper: "Same intent already exists on this customer.",
  },
  {
    value: "other",
    label: "Other",
    helper: "Something else went wrong. Tell us in the note below.",
  },
];

export function MarkIncorrectDrawer({
  item,
  onClose,
}: {
  item: ActionItem | null;
  onClose: () => void;
}) {
  const open = !!item;
  const [reason, setReason] = useState<IncorrectReason | "">("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (item) {
      setReason("");
      setNote("");
      setError("");
    }
  }, [item?.action_item_id]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = () => {
    if (!item || !reason) return;
    if (reason === "other" && note.trim().length < 5) {
      setError("Please tell us what went wrong (at least 5 characters).");
      return;
    }
    try {
      markActionItemIncorrect(item.action_item_id, reason, note || undefined);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to mark incorrect");
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Mark as incorrect"
      width="500px"
    >
      {item ? (
        <div className="flex h-full flex-col">
          {/* Context strip */}
          <section className="flex-shrink-0 border-b border-border-subtle bg-status-warning-soft/40 px-5 py-3">
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
            <div className="flex items-start gap-2 rounded-md border border-status-warning/30 bg-status-warning-soft px-3 py-2.5">
              <MaterialSymbol
                name="warning"
                size={16}
                className="mt-0.5 text-status-warning"
              />
              <p className="text-[12px] leading-snug text-text-primary">
                This removes the item from the queue without counting as a
                closure. Your reason feeds the AI eval loop so this kind of
                false-positive gets caught next time.
              </p>
            </div>

            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                What's wrong with this item?{" "}
                <span className="text-status-past">*</span>
              </label>
              <div className="mt-2 space-y-1.5">
                {REASONS.map((r) => {
                  const active = reason === r.value;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => {
                        setReason(r.value);
                        setError("");
                      }}
                      className={`flex w-full items-start gap-3 rounded-md border px-3 py-2.5 text-left transition-colors duration-150 ${
                        active
                          ? "border-brand-purple bg-brand-purple-soft"
                          : "border-border-subtle bg-surface-card hover:bg-surface-subtle"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border ${
                          active
                            ? "border-brand-purple bg-brand-purple"
                            : "border-border-strong"
                        }`}
                      >
                        {active ? (
                          <span className="block h-1.5 w-1.5 rounded-full bg-white" />
                        ) : null}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div
                          className={`text-[13px] font-medium ${
                            active ? "text-brand-purple" : "text-text-primary"
                          }`}
                        >
                          {r.label}
                        </div>
                        <div className="mt-0.5 text-[11px] leading-snug text-text-secondary">
                          {r.helper}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                <span>
                  Note{" "}
                  {reason === "other" ? (
                    <span className="text-status-past">*</span>
                  ) : (
                    <span className="font-normal lowercase text-text-tertiary">
                      (optional)
                    </span>
                  )}
                </span>
                <span className="tabular font-normal lowercase text-text-tertiary">
                  {note.length} / 240
                </span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 240))}
                rows={3}
                placeholder="Optional context for the AI team."
                className="mt-1.5 w-full rounded-md border border-border-subtle px-3 py-2 text-[13px] focus:border-brand-purple focus:outline-none"
              />
            </div>

            {error ? (
              <div className="rounded-md border border-status-past/30 bg-status-past-soft px-3 py-2 text-[12px] text-status-past">
                {error}
              </div>
            ) : null}
          </section>

          <footer className="flex flex-shrink-0 items-center justify-between gap-2 border-t border-border-subtle bg-white px-5 py-3">
            <span className="text-[11px] text-text-tertiary">
              Excluded from closure-rate. Reasons feed AI eval.
            </span>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" disabled={!reason} onClick={submit}>
                Mark as incorrect
              </Button>
            </div>
          </footer>
        </div>
      ) : null}
    </Drawer>
  );
}
