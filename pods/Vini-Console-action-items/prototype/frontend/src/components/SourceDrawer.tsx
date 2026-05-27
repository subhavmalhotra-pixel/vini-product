import type { ActionItem } from "@test-data";
import { getConversation } from "../data/store";
import { Drawer } from "./Drawer";
import { ChannelIcon } from "./ChannelIcon";
import { formatDateTime } from "../data/helpers";
import { PlayIcon } from "./Icon";

export function SourceDrawer({
  item,
  onClose,
}: {
  item: ActionItem | null;
  onClose: () => void;
}) {
  const open = !!item;
  const conv = item ? getConversation(item.source_conversation_id) : null;
  const isHitl =
    conv?.channel === "hitl_takeover" ||
    conv?.channel === "hitl_warm_transfer";

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="560px"
      title={isHitl ? "Conversation thread" : "Source conversation"}
    >
      {conv ? (
        <div className="flex h-full flex-col">
          <section className="border-b border-border-subtle bg-surface-subtle px-5 py-3">
            <div className="flex items-center gap-2.5">
              <ChannelIcon channel={conv.channel} showLabel />
              <span className="text-text-tertiary">·</span>
              <span className="tabular text-[11px] text-text-secondary">
                {formatDateTime(conv.started_at)}
              </span>
              <span className="text-text-tertiary">·</span>
              <span className="font-mono text-[10px] text-text-tertiary">
                {conv.conversation_id}
              </span>
            </div>
            {conv.recording_url ? (
              <button className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-white px-2.5 py-1 text-[11px] font-medium text-text-primary hover:bg-surface-subtle">
                <PlayIcon size={11} /> Play recording
              </button>
            ) : null}
          </section>

          <section className="flex-1 overflow-y-auto px-5 py-4 scroll-thin">
            <ol className="space-y-3">
              {conv.transcript.map((turn, i) => (
                <TurnBubble key={i} turn={turn} />
              ))}
            </ol>
          </section>
        </div>
      ) : null}
    </Drawer>
  );
}

function TurnBubble({
  turn,
}: {
  turn: { speaker: "agent" | "customer" | "human_agent"; text: string; timestamp: string };
}) {
  const meta = (() => {
    switch (turn.speaker) {
      case "agent":
        return {
          label: "Vini",
          bg: "bg-brand-purple-soft text-text-primary",
          align: "self-start",
        };
      case "human_agent":
        return {
          label: "Human",
          bg: "bg-status-ok-soft text-text-primary",
          align: "self-start",
        };
      case "customer":
        return {
          label: "Customer",
          bg: "bg-surface-subtle text-text-primary",
          align: "self-end",
        };
    }
  })();
  return (
    <li className="flex flex-col gap-1">
      <div className="flex items-baseline gap-2 text-[10px] uppercase tracking-wide text-text-tertiary">
        <span className="font-semibold">{meta.label}</span>
        <span className="tabular normal-case">{formatDateTime(turn.timestamp)}</span>
      </div>
      <div className={`${meta.align} max-w-[88%] rounded-lg ${meta.bg} px-3 py-2 text-[13px]`}>
        {turn.text}
      </div>
    </li>
  );
}
