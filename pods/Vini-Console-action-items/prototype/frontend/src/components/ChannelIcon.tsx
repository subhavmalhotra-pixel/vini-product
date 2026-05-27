import type { Channel } from "@test-data";
import { channelLabel } from "../data/helpers";
import { ChannelGlyph } from "./Icon";

export function ChannelIcon({
  channel,
  showLabel = false,
  size = 13,
}: {
  channel: Channel;
  showLabel?: boolean;
  size?: number;
}) {
  const isHitl =
    channel === "hitl_takeover" || channel === "hitl_warm_transfer";
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] ${
        isHitl ? "font-semibold text-brand-purple" : "text-text-tertiary"
      }`}
      title={channelLabel(channel)}
    >
      <ChannelGlyph channel={channel} size={size} />
      {showLabel ? <span>{channelLabel(channel)}</span> : null}
    </span>
  );
}
