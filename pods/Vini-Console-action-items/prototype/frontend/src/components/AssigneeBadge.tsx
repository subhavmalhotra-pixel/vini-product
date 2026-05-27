import { getUser } from "../data/store";

export function AssigneeBadge({
  userId,
  variant = "compact",
}: {
  userId: string | undefined;
  variant?: "compact" | "full";
}) {
  const user = getUser(userId);

  if (!user) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-status-warning">
        <span className="flex h-4 w-4 items-center justify-center rounded-full border border-dashed border-status-warning text-[9px]">
          ?
        </span>
        Unassigned
      </span>
    );
  }

  const isAi = user.user_id === "vini_agent";
  const showName = variant === "full";

  const dotClass = isAi
    ? "bg-brand-purple"
    : "bg-text-secondary";

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium ${
        isAi ? "text-brand-purple" : "text-text-primary"
      }`}
      title={user.display_name}
    >
      <span
        className={`flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-white ${dotClass}`}
      >
        {user.avatar_initials}
      </span>
      {showName ? <span className="truncate-1">{user.display_name}</span> : null}
    </span>
  );
}

export function AssigneeFullBadge({ userId }: { userId: string | undefined }) {
  return <AssigneeBadge userId={userId} variant="full" />;
}
