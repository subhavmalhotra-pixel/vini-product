import type { ChannelBreakdown } from "@test-data";

type ChannelSplitBarProps = {
  data: ChannelBreakdown;
  showLabels?: boolean;
};

const CHANNEL_COLORS: Record<string, string> = {
  call: "#0369A1",
  sms: "#0891B2",
  chat: "#0D9488",
  email: "#6366F1",
  voice: "#8B5CF6",
};

export function ChannelSplitBar({ data, showLabels = true }: ChannelSplitBarProps) {
  const channels: Array<[string, number]> = [
    ["call", data.call],
    ["sms", data.sms],
    ["chat", data.chat],
  ];
  if (data.email !== undefined) channels.push(["email", data.email]);
  if (data.voice !== undefined) channels.push(["voice", data.voice]);

  const total = channels.reduce((acc, [, v]) => acc + v, 0);

  if (total === 0) {
    return <div className="text-xs italic text-text-muted">No channel activity</div>;
  }

  return (
    <div className="space-y-2">
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-surface-background">
        {channels.map(([ch, count]) => {
          if (count === 0) return null;
          const pct = (count / total) * 100;
          return (
            <div
              key={ch}
              style={{ width: `${pct}%`, backgroundColor: CHANNEL_COLORS[ch] }}
              title={`${ch}: ${count}`}
            />
          );
        })}
      </div>
      {showLabels ? (
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {channels.map(([ch, count]) => (
            <div key={ch} className="flex items-center gap-1.5 text-xs">
              <span
                className="inline-block h-2 w-2 rounded-sm"
                style={{ backgroundColor: CHANNEL_COLORS[ch] }}
              />
              <span className="font-medium capitalize text-text-primary">{ch}</span>
              <span className="tabular text-text-secondary">{count}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
