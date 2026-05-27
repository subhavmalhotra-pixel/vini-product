import type { ActionItem, Conversation } from "@test-data";
import { getConversation } from "../data/store";
import { formatDateTime } from "../data/helpers";
import { ChannelIcon } from "./ChannelIcon";
import { PlayIcon } from "./Icon";

/**
 * Inline excerpt of the source conversation that produced an action item.
 * Shows the channel + timestamp · the most relevant turns (customer's primary
 * ask + any handover) · a "View full conversation" link that opens the
 * full SourceDrawer.
 *
 * Used by:
 *   - PendingRow (expanded inline state)
 *   - CloseDrawer (so the BDC has context when closing)
 */
export function ConversationSnippet({
  item,
  onViewFull,
  variant = "embed",
}: {
  item: ActionItem;
  onViewFull?: (item: ActionItem) => void;
  variant?: "embed" | "card";
}) {
  const conv = getConversation(item.source_conversation_id);
  if (!conv) {
    return (
      <div className="text-[11px] text-text-tertiary">
        Source conversation not available.
      </div>
    );
  }

  const turns = pickRelevantTurns(conv);
  const isHitl =
    conv.channel === "hitl_takeover" ||
    conv.channel === "hitl_warm_transfer";

  const containerClasses =
    variant === "card"
      ? "rounded-lg border border-border-subtle bg-white px-3.5 py-2.5"
      : "rounded-md border border-border-subtle bg-white px-3 py-2";

  return (
    <div className={containerClasses}>
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wide text-text-tertiary">
          <ChannelIcon channel={conv.channel} showLabel />
          <span>·</span>
          <span className="tabular normal-case">
            {formatDateTime(conv.started_at)}
          </span>
          <span>·</span>
          <span className="font-mono normal-case text-[10px]">
            {conv.conversation_id.slice(-8)}
          </span>
        </div>
        {onViewFull ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewFull(item);
            }}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-purple hover:underline"
          >
            <PlayIcon size={10} />
            {isHitl ? "View full thread" : "View full call"}
          </button>
        ) : null}
      </div>

      <ol className="space-y-1.5">
        {turns.map((turn, i) => (
          <SnippetLine key={i} turn={turn} />
        ))}
        {conv.transcript.length > turns.length ? (
          <li className="text-[11px] italic text-text-tertiary">
            … {conv.transcript.length - turns.length} more turn
            {conv.transcript.length - turns.length === 1 ? "" : "s"} in the full conversation
          </li>
        ) : null}
      </ol>
    </div>
  );
}

const SPEAKER_META: Record<
  "agent" | "customer" | "human_agent",
  { label: string; tone: string }
> = {
  agent: { label: "Vini", tone: "text-brand-purple" },
  human_agent: { label: "Human", tone: "text-status-ok" },
  customer: { label: "Customer", tone: "text-text-secondary" },
};

function SnippetLine({
  turn,
}: {
  turn: { speaker: "agent" | "customer" | "human_agent"; text: string };
}) {
  const meta = SPEAKER_META[turn.speaker];
  return (
    <li className="flex gap-2 text-[12px] leading-snug">
      <span className={`flex-shrink-0 font-semibold ${meta.tone}`}>
        {meta.label}
      </span>
      <span className="min-w-0 truncate-1 text-text-primary">{turn.text}</span>
    </li>
  );
}

/**
 * Pick the most relevant turns from a transcript for the inline snippet.
 *
 * Heuristic:
 *   1) Always include the FIRST customer turn (the primary ask).
 *   2) If there's a human-agent turn (HITL), include the first one too.
 *   3) Always include the LAST customer turn if it differs from (1).
 *   4) Cap at 3 turns.
 */
function pickRelevantTurns(
  conv: Conversation
): Conversation["transcript"] {
  const turns = conv.transcript;
  if (turns.length === 0) return [];

  const picks = new Set<number>();

  const firstCustomer = turns.findIndex((t) => t.speaker === "customer");
  if (firstCustomer >= 0) picks.add(firstCustomer);

  const firstHuman = turns.findIndex((t) => t.speaker === "human_agent");
  if (firstHuman >= 0) picks.add(firstHuman);

  const lastCustomer = (() => {
    for (let i = turns.length - 1; i >= 0; i--) {
      if (turns[i].speaker === "customer") return i;
    }
    return -1;
  })();
  if (lastCustomer >= 0) picks.add(lastCustomer);

  // Fallback — if nothing matched, take first 2
  if (picks.size === 0) {
    return turns.slice(0, 2);
  }

  return Array.from(picks)
    .sort((a, b) => a - b)
    .slice(0, 3)
    .map((idx) => turns[idx]);
}
