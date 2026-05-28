import { getUser } from "../data/store";
import { SparkleIcon } from "./Icon";

/**
 * Assignee chip — shipped in two variants.
 *
 * Phase 1 design contract #4 + Vini-as-assignee Phase 2 seam:
 *   - Human user → grey-dot avatar · text-primary name
 *   - Vini (user_id "vini_agent") → brand-purple dot with sparkle icon ·
 *     brand-purple "Vini" label. Phase 2 turns this on for real; Phase 1
 *     just renders it correctly when seed data marks an item as
 *     Vini-assigned (resolved-by-Vini items in completed history).
 *   - Unassigned → dashed warning chip.
 */
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
      <span
        className="inline-flex items-center gap-1 text-[11px] font-medium text-status-warning"
        aria-label="Unassigned"
      >
        <span className="flex h-4 w-4 items-center justify-center rounded-full border border-dashed border-status-warning text-[9px]">
          ?
        </span>
        Unassigned
      </span>
    );
  }

  const isAi = user.user_id === "vini_agent";
  const showName = variant === "full";

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium ${
        isAi ? "text-brand-purple" : "text-text-primary"
      }`}
      title={user.display_name}
      aria-label={`Assignee: ${user.display_name}`}
    >
      {isAi ? (
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-purple text-white">
          <SparkleIcon size={9} />
        </span>
      ) : (
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-text-secondary text-[8px] font-bold text-white">
          {user.avatar_initials}
        </span>
      )}
      {showName ? (
        <span className="truncate-1">
          {isAi ? "Vini" : user.display_name}
        </span>
      ) : null}
    </span>
  );
}

export function AssigneeFullBadge({ userId }: { userId: string | undefined }) {
  return <AssigneeBadge userId={userId} variant="full" />;
}
