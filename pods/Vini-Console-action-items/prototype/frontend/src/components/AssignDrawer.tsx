import { useEffect, useMemo, useState } from "react";
import type { ActionItem } from "@test-data";
import { assignActionItem, getActionItems, getUser, listUsers } from "../data/store";
import { Drawer } from "./Drawer";
import { Button } from "./Button";
import { IntentChip } from "./IntentChip";
import { ConversationSnippet } from "./ConversationSnippet";
import { SparkleIcon, CheckIcon, RobotIcon } from "./Icon";

const VINI_USER_ID = "vini_agent";

const VINI_INSTRUCTION_TEMPLATES: Record<string, string> = {
  status_update:
    "Pull the latest status from the service system and SMS the customer with the update. If the work is delayed, do not respond — escalate back to me.",
  callback_request:
    "Send the customer an SMS confirming you'll call back at their preferred time, then leave a voicemail if unreachable.",
  general_info:
    "Reply with the requested information using approved scripts. Do not commit to pricing or appointments without human confirmation.",
};

export function AssignDrawer({
  item,
  onClose,
  onOpenSource,
}: {
  item: ActionItem | null;
  onClose: () => void;
  onOpenSource?: (item: ActionItem) => void;
}) {
  const open = !!item;
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [viniInstructions, setViniInstructions] = useState<string>("");
  const [error, setError] = useState<string>("");

  const users = listUsers();
  const humans = users.filter((u) => u.user_id !== VINI_USER_ID);

  const suggestedUserId = useMemo(() => {
    if (!item) return null;
    const allItems = getActionItems();
    const same = allItems.filter(
      (i) =>
        i.intent_id === item.intent_id &&
        i.assignee_user_id &&
        i.assignee_user_id !== VINI_USER_ID
    );
    if (same.length === 0) return null;
    same.sort((a, b) =>
      (b.assigned_at ?? "").localeCompare(a.assigned_at ?? "")
    );
    return same[0].assignee_user_id ?? null;
  }, [item]);

  // Reset all transient state when a new item opens
  useEffect(() => {
    if (item) {
      setSelectedUserId("");
      setReason("");
      setQuery("");
      setViniInstructions(VINI_INSTRUCTION_TEMPLATES[item.intent_id] ?? "");
      setError("");
    }
  }, [item?.action_item_id]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredHumans = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rest = humans.filter((u) => u.user_id !== suggestedUserId);
    if (!q) return rest;
    return rest.filter(
      (u) =>
        u.display_name.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [humans, query, suggestedUserId]);

  const isViniSelected = selectedUserId === VINI_USER_ID;
  const viniNoteLen = viniInstructions.trim().length;
  const canSubmit =
    !!selectedUserId && (!isViniSelected || viniNoteLen >= 10);

  const submit = () => {
    if (!item || !canSubmit) return;
    try {
      assignActionItem(
        item.action_item_id,
        selectedUserId,
        undefined,
        reason || undefined,
        isViniSelected ? viniInstructions.trim() : undefined
      );
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to assign");
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="500px"
      title={
        item?.assignee_user_id ? "Reassign action item" : "Assign action item"
      }
    >
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
            {/* Source snippet for context */}
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                Source conversation
              </label>
              <div className="mt-1.5">
                <ConversationSnippet item={item} onViewFull={onOpenSource} />
              </div>
            </div>

            {/* Vini — prominent option first */}
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                Assign to
              </label>
              <div className="mt-1.5 space-y-1.5">
                <ViniOption
                  selected={isViniSelected}
                  onSelect={() => setSelectedUserId(VINI_USER_ID)}
                />

                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search team by name or role…"
                  className="w-full rounded-md border border-border-subtle px-3 py-1.5 text-[12px] focus:border-brand-purple focus:outline-none"
                />

                <ul className="space-y-1">
                  {suggestedUserId ? (
                    <UserOption
                      userId={suggestedUserId}
                      selected={selectedUserId === suggestedUserId}
                      onSelect={() => setSelectedUserId(suggestedUserId)}
                      suggested
                    />
                  ) : null}
                  {filteredHumans.map((u) => (
                    <UserOption
                      key={u.user_id}
                      userId={u.user_id}
                      selected={selectedUserId === u.user_id}
                      onSelect={() => setSelectedUserId(u.user_id)}
                    />
                  ))}
                </ul>
              </div>
            </div>

            {/* Vini instructions — required when Vini is selected */}
            {isViniSelected ? (
              <div className="rounded-lg border border-brand-purple-border bg-brand-purple-soft/30 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-brand-purple">
                    <SparkleIcon size={12} />
                    Instructions for Vini <span className="text-status-past">*</span>
                  </div>
                  <span className="tabular text-[10px] text-text-tertiary">
                    {viniNoteLen} / 10 min
                  </span>
                </div>
                <p className="mt-1 text-[11px] leading-snug text-text-secondary">
                  Tell Vini what to do for this specific action item — what
                  resolution to attempt, what to say, when to escalate.
                </p>
                <textarea
                  value={viniInstructions}
                  onChange={(e) => setViniInstructions(e.target.value)}
                  rows={4}
                  placeholder="e.g. Pull the latest status from the service system and SMS the customer. If the work is delayed, escalate back to me — do not respond directly."
                  className="mt-2 w-full rounded-md border border-brand-purple-border bg-white px-3 py-2 text-[13px] focus:border-brand-purple focus:outline-none"
                />
                {VINI_INSTRUCTION_TEMPLATES[item.intent_id] ? (
                  <button
                    onClick={() =>
                      setViniInstructions(
                        VINI_INSTRUCTION_TEMPLATES[item.intent_id]
                      )
                    }
                    className="mt-1 text-[10px] font-medium text-brand-purple hover:underline"
                  >
                    Use {item.intent_id.replace(/_/g, " ")} template
                  </button>
                ) : null}

                {/* Expected-response prompt */}
                <div className="mt-2 rounded-md border border-dashed border-brand-purple-border bg-white/60 px-2.5 py-1.5 text-[11px] text-text-secondary">
                  <strong className="font-semibold text-brand-purple">
                    Vini will log a resolution note
                  </strong>{" "}
                  describing what it did and why; you'll see it in the
                  Completed view and can audit.
                </div>
              </div>
            ) : null}

            {/* Reason — only on reassignment */}
            {item.assignee_user_id && !isViniSelected ? (
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                  Reason for reassignment (optional)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                  placeholder="Short note for audit log…"
                  className="mt-1.5 w-full rounded-md border border-border-subtle px-3 py-2 text-[13px] focus:border-brand-purple focus:outline-none"
                />
              </div>
            ) : null}

            {error ? (
              <div className="rounded-md border border-status-past/30 bg-status-past-soft px-3 py-2 text-[12px] text-status-past">
                {error}
              </div>
            ) : null}
          </section>

          <footer className="flex flex-shrink-0 items-center justify-end gap-2 border-t border-border-subtle bg-white px-5 py-3">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" disabled={!canSubmit} onClick={submit}>
              <CheckIcon size={12} />
              Assign {isViniSelected ? "to Vini" : ""}
            </Button>
          </footer>
        </div>
      ) : null}
    </Drawer>
  );
}

function ViniOption({
  selected,
  onSelect,
}: {
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`flex w-full items-center justify-between gap-3 rounded-md border px-3 py-2 text-left transition-colors ${
        selected
          ? "border-brand-purple bg-brand-purple-soft"
          : "border-brand-purple-border bg-brand-purple-soft/40 hover:bg-brand-purple-soft"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-purple text-white">
          <RobotIcon size={16} />
        </span>
        <div>
          <div className="text-[13px] font-semibold text-text-primary">
            Vini (AI agent)
          </div>
          <div className="text-[10px] text-text-secondary">
            Auto-resolves with a logged note · requires instructions below
          </div>
        </div>
      </div>
      <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-bold uppercase text-brand-purple">
        AI
      </span>
    </button>
  );
}

function UserOption({
  userId,
  selected,
  onSelect,
  suggested,
}: {
  userId: string;
  selected: boolean;
  onSelect: () => void;
  suggested?: boolean;
}) {
  const user = getUser(userId);
  if (!user) return null;
  return (
    <li>
      <button
        onClick={onSelect}
        className={`flex w-full items-center justify-between gap-3 rounded-md border px-3 py-2 text-left transition-colors ${
          selected
            ? "border-brand-purple bg-brand-purple-soft"
            : "border-border-subtle bg-white hover:bg-surface-subtle"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-text-secondary text-[10px] font-bold text-white">
            {user.avatar_initials}
          </span>
          <div>
            <div className="text-[13px] font-medium text-text-primary">
              {user.display_name}
            </div>
            <div className="text-[10px] uppercase tracking-wide text-text-tertiary">
              {user.role.replace(/_/g, " ")}
            </div>
          </div>
        </div>
        {suggested ? (
          <span className="rounded-full bg-status-ok-soft px-1.5 py-0.5 text-[9px] font-bold uppercase text-status-ok">
            Suggested
          </span>
        ) : null}
      </button>
    </li>
  );
}
