/**
 * Tracker · rooftop list + send history.
 *
 * Real rooftop list imported from the team's Google Sheet on 04 Jun 2026
 * (18 rooftops · 5 sent · 13 not-sent for various data-quality reasons).
 * Each rooftop carries the reason its email did or didn't go out so the
 * CSM can act on the dashboard directly.
 */
export type SendStatus =
  | "sent"
  | "suppressed"
  | "failed"
  | "not_sent"
  | "not_subscribed"
  | "scheduled";

/**
 * Why the email didn't land. Drives both the cell tooltip and the
 * specific CSM-action CTA rendered on the failing cell.
 */
export type NotSentReason =
  | "recipients_missing" // No email recipient configured at all
  | "tag_missing" // Service/sales designation not set
  | "recipient_placeholder" // Email field has a placeholder ("m") — needs real address
  | "smtp_timeout" // Send attempted, server timed out
  | "scheduler_skipped" // Job didn't fire on time
  | "silent_day" // Suppressed legitimately (no activity)
  | "bounced"; // Recipient inbox rejected the message

export type Cadence = "daily" | "weekly" | "monthly";

export type SendCell = {
  date: string; // ISO YYYY-MM-DD
  cadence: Cadence;
  status: SendStatus;
  reason?: NotSentReason;
  recipient_count?: number;
};

export type RooftopRow = {
  rooftop_id: string;
  name: string;
  enterprise_id?: string;
  team_id?: string;
  csm: string;
  group?: string;
  tag?: "sales" | "service" | null;
  recipients: string[];
  subscriptions: { daily: boolean; weekly: boolean; monthly: boolean };
  /** Why this rooftop is in its current state — surfaced in the tracker */
  current_block?: NotSentReason | null;
  daily: SendCell[];
  weekly: SendCell[];
  monthly: SendCell[];
};

const TODAY = "2026-06-04"; // per user · tracker anchors here

function isoDaysAgo(daysAgo: number): string {
  const [y, m, d] = TODAY.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

function isoWeeksAgo(weeksAgo: number): string {
  return isoDaysAgo(weeksAgo * 7);
}

function isoMonthsAgo(monthsAgo: number): string {
  const [y, m, d] = TODAY.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCMonth(date.getUTCMonth() - monthsAgo);
  return date.toISOString().slice(0, 10);
}

/* ============================================================
   Raw sheet data · what landed in the CSV today
   ============================================================ */
type SheetRow = {
  name: string;
  enterprise_id?: string;
  team_id?: string;
  tag?: "sales" | "service" | null;
  recipients: string[];
  /** "sent" if the rightmost CSV column had it, else "" */
  current_status: "sent" | "";
  csm: string;
};

const CSMS_POOL = ["Aanya Sharma", "Carlos Vega", "Diego Park", "Mira Patel"];

// Parsed from /tmp/rooftops.csv on 04 Jun 2026
const SHEET: SheetRow[] = [
  { name: "Honda DTLA", enterprise_id: "7d06f7427", team_id: "9923577d07", tag: null, recipients: [], current_status: "", csm: "Aanya Sharma" },
  { name: "Covina Kia", enterprise_id: "7d06f7427", team_id: "49a06313cf", tag: "service", recipients: ["mamri@covinakia.com"], current_status: "sent", csm: "Aanya Sharma" },
  { name: "Honda Resida", enterprise_id: "7d06f7427", team_id: "2b110492b6", tag: null, recipients: [], current_status: "", csm: "Aanya Sharma" },
  { name: "Victory", enterprise_id: "ef09d889d", team_id: "bf718528af", tag: "service", recipients: ["sergio.reyna@victorytoyota.com", "david.quinto@victorytoyota.com"], current_status: "sent", csm: "Carlos Vega" },
  { name: "Brown Daub", enterprise_id: "fe7e2e8e5", team_id: "5d2ffea9c0", tag: "service", recipients: ["m"], current_status: "", csm: "Carlos Vega" },
  { name: "World Car Mazda", enterprise_id: "4f772edd8", team_id: "d4c824c0-9", tag: "service", recipients: ["m"], current_status: "", csm: "Carlos Vega" },
  { name: "World Car Kia South", enterprise_id: "4f772edd8", team_id: "48d0fea7-2", tag: "service", recipients: ["m"], current_status: "", csm: "Carlos Vega" },
  { name: "World Car Kia San Antonio", enterprise_id: "4f772edd8", team_id: "d2999d21-c", tag: "service", recipients: ["brent.worldcar@gmail.com", "rene.galvan@worldcarsatx.com", "sandrag@worldcar.com"], current_status: "sent", csm: "Carlos Vega" },
  { name: "Burns Hyundai", enterprise_id: "4c65517e7", team_id: "9c9e3d1259", tag: "service", recipients: ["tsmith@burnsbuickgmc.com", "pgutowski@burnsbuickgmc.com", "mbrairton@burnshyundai.com"], current_status: "sent", csm: "Diego Park" },
  { name: "Toronto Honda", enterprise_id: "56a910bcc", team_id: "1c402ffba8", tag: null, recipients: [], current_status: "", csm: "Diego Park" },
  { name: "i40 Auto", enterprise_id: "b7a9c31a8", team_id: "b4df3297f5", tag: "sales", recipients: ["toddi@i40auto.com", "ahammood@i40autogroup.com"], current_status: "sent", csm: "Diego Park" },
  { name: "Dream Nissan Midwest", tag: "sales", recipients: [], current_status: "", csm: "Mira Patel" },
  { name: "Dream Nissan Lawrence", tag: "sales", recipients: [], current_status: "", csm: "Mira Patel" },
  { name: "Dream Nissan Kansas", tag: "sales", recipients: [], current_status: "", csm: "Mira Patel" },
  { name: "Merc Arrington", tag: null, recipients: [], current_status: "", csm: "Mira Patel" },
  { name: "Edwards Chevy 280", tag: null, recipients: [], current_status: "", csm: "Mira Patel" },
  { name: "Wolfchase Honda", tag: null, recipients: [], current_status: "", csm: "Aanya Sharma" },
  { name: "Wolfchase Nissan", tag: null, recipients: [], current_status: "", csm: "Aanya Sharma" },
];

/* ============================================================
   Derive a per-rooftop current_block + send history
   ============================================================ */
function deriveBlock(row: SheetRow): NotSentReason | null {
  if (row.current_status === "sent") return null;
  // tag missing first — that's the most upstream gap
  if (row.tag == null) return "tag_missing";
  // tag present but recipient is a placeholder
  if (row.recipients.length === 1 && row.recipients[0] === "m") {
    return "recipient_placeholder";
  }
  if (row.recipients.length === 0) return "recipients_missing";
  // Catch-all if status is empty but data looks fine — scheduler issue
  return "scheduler_skipped";
}

function buildDailyHistory(row: SheetRow, block: NotSentReason | null): SendCell[] {
  // Generate 14 days of history
  return Array.from({ length: 14 }, (_, i) => {
    const date = isoDaysAgo(i);
    // If rooftop is currently sent: most days are sent, with silent-day suppression
    if (row.current_status === "sent") {
      // Day 6 / 13 = weekly silent day suppression
      if (i === 6 || i === 13) {
        return { date, cadence: "daily" as const, status: "suppressed" as const, reason: "silent_day" as const };
      }
      return { date, cadence: "daily" as const, status: "sent" as const };
    }
    // If rooftop is blocked: cells reflect the block reason
    if (block === "tag_missing" || block === "recipients_missing") {
      // Pre-blocked rooftops have never sent — show as not_subscribed for older days,
      // not_sent for recent days where the email SHOULD have fired
      if (i <= 6) {
        return { date, cadence: "daily" as const, status: "not_sent" as const, reason: block };
      }
      return { date, cadence: "daily" as const, status: "not_subscribed" as const };
    }
    if (block === "recipient_placeholder") {
      if (i <= 6) {
        return { date, cadence: "daily" as const, status: "not_sent" as const, reason: block };
      }
      return { date, cadence: "daily" as const, status: "not_subscribed" as const };
    }
    if (block === "scheduler_skipped") {
      if (i === 0) return { date, cadence: "daily" as const, status: "not_sent" as const, reason: block };
      return { date, cadence: "daily" as const, status: "sent" as const };
    }
    return { date, cadence: "daily" as const, status: "not_subscribed" as const };
  });
}

function buildWeeklyHistory(row: SheetRow, block: NotSentReason | null): SendCell[] {
  return Array.from({ length: 8 }, (_, i) => {
    const date = isoWeeksAgo(i);
    if (row.current_status === "sent") {
      return { date, cadence: "weekly" as const, status: "sent" as const };
    }
    if (block === "tag_missing" || block === "recipients_missing" || block === "recipient_placeholder") {
      if (i === 0) {
        return { date, cadence: "weekly" as const, status: "not_sent" as const, reason: block };
      }
      return { date, cadence: "weekly" as const, status: "not_subscribed" as const };
    }
    return { date, cadence: "weekly" as const, status: "sent" as const };
  });
}

function buildMonthlyHistory(row: SheetRow, block: NotSentReason | null): SendCell[] {
  return Array.from({ length: 6 }, (_, i) => {
    const date = isoMonthsAgo(i);
    if (row.current_status === "sent") {
      return { date, cadence: "monthly" as const, status: "sent" as const };
    }
    if (block === "tag_missing" || block === "recipients_missing" || block === "recipient_placeholder") {
      if (i === 0) {
        return { date, cadence: "monthly" as const, status: "not_sent" as const, reason: block };
      }
      return { date, cadence: "monthly" as const, status: "not_subscribed" as const };
    }
    return { date, cadence: "monthly" as const, status: "sent" as const };
  });
}

/* ============================================================
   Build the rooftop list from the sheet
   ============================================================ */
function buildRooftops(): RooftopRow[] {
  return SHEET.map((row, i) => {
    const block = deriveBlock(row);
    // Determine subscription mix from tag + current status
    const tagPresent = row.tag != null;
    const hasGoodRecipients =
      row.recipients.length > 0 && row.recipients[0] !== "m";
    const subscribed = tagPresent && hasGoodRecipients;

    return {
      rooftop_id: `rt-${String(i + 1).padStart(3, "0")}`,
      name: row.name,
      enterprise_id: row.enterprise_id,
      team_id: row.team_id,
      csm: row.csm ?? CSMS_POOL[i % CSMS_POOL.length],
      group: row.enterprise_id ? `Enterprise ${row.enterprise_id.slice(0, 6)}` : undefined,
      tag: row.tag,
      recipients: row.recipients,
      subscriptions: {
        daily: subscribed,
        weekly: subscribed,
        monthly: subscribed,
      },
      current_block: block,
      daily: buildDailyHistory(row, block),
      weekly: buildWeeklyHistory(row, block),
      monthly: buildMonthlyHistory(row, block),
    };
  });
}

export const ROOFTOPS = buildRooftops();

/* ============================================================
   Tracker meta + helpers
   ============================================================ */
export const TRACKER_META = {
  today: TODAY,
  lastSyncedMinutesAgo: 7,
  totalRooftops: ROOFTOPS.length,
  csms: Array.from(new Set(ROOFTOPS.map((r) => r.csm))),
  groups: Array.from(
    new Set(ROOFTOPS.map((r) => r.group).filter((g): g is string => !!g))
  ),
  source: "Google Sheet · synced 04 Jun 2026",
};

export const NOT_SENT_REASON_LABEL: Record<NotSentReason, string> = {
  recipients_missing: "Recipients missing",
  tag_missing: "Service/sales tag missing",
  recipient_placeholder: "Recipient is a placeholder",
  smtp_timeout: "SMTP timeout",
  scheduler_skipped: "Scheduler skipped",
  silent_day: "Silent day · no activity",
  bounced: "Inbox bounced",
};

/** What the CSM has to do to unblock this rooftop. */
export const NOT_SENT_REASON_CTA: Record<NotSentReason, { label: string; tone: "warn" | "danger" }> = {
  recipients_missing: { label: "+ Add recipients", tone: "warn" },
  tag_missing: { label: "+ Classify rooftop", tone: "warn" },
  recipient_placeholder: { label: "+ Fix recipient", tone: "warn" },
  smtp_timeout: { label: "⚠ Retry", tone: "danger" },
  scheduler_skipped: { label: "→ Send now", tone: "danger" },
  silent_day: { label: "—", tone: "warn" },
  bounced: { label: "+ Update recipient", tone: "danger" },
};

export function countStatus(
  rooftops: RooftopRow[],
  cadence: Cadence,
  days: number
): Record<SendStatus, number> {
  const counts: Record<SendStatus, number> = {
    sent: 0,
    suppressed: 0,
    failed: 0,
    not_sent: 0,
    not_subscribed: 0,
    scheduled: 0,
  };
  for (const r of rooftops) {
    const cells =
      cadence === "daily" ? r.daily : cadence === "weekly" ? r.weekly : r.monthly;
    for (const c of cells.slice(0, days)) {
      counts[c.status] += 1;
    }
  }
  return counts;
}

/**
 * Aggregate not-sent reasons across visible rooftops for the action board.
 */
export function reasonBreakdown(
  rooftops: RooftopRow[]
): { reason: NotSentReason; count: number; rooftops: string[] }[] {
  const map = new Map<NotSentReason, string[]>();
  for (const r of rooftops) {
    if (r.current_block) {
      const list = map.get(r.current_block) ?? [];
      list.push(r.name);
      map.set(r.current_block, list);
    }
  }
  return Array.from(map.entries())
    .map(([reason, names]) => ({ reason, count: names.length, rooftops: names }))
    .sort((a, b) => b.count - a.count);
}
