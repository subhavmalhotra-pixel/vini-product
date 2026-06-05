/**
 * Mock data · CSM-ops rooftop tracker.
 *
 * 40 rooftops with realistic dealership names, CSM owners, group
 * affiliations, subscription mix, and a 30-day send history per cadence.
 *
 * Status enum:
 *   "sent"            · green · email landed in the inbox
 *   "suppressed"      · amber · suppression triggered (silent day, etc.)
 *   "failed"          · red   · send attempted but failed · click to retry
 *   "not_sent"        · red   · scheduled, never fired · click to send now
 *   "not_subscribed"  · gray  · rooftop opted out of this cadence
 *   "scheduled"       · blue  · future date, not yet fired
 */
export type SendStatus =
  | "sent"
  | "suppressed"
  | "failed"
  | "not_sent"
  | "not_subscribed"
  | "scheduled";

export type Cadence = "daily" | "weekly" | "monthly";

export type SendCell = {
  date: string; // ISO YYYY-MM-DD
  cadence: Cadence;
  status: SendStatus;
  suppression_reason?: string;
  recipient_count?: number;
};

export type RooftopRow = {
  rooftop_id: string;
  name: string;
  csm: string;
  group?: string;
  state: string;
  brand: string;
  subscriptions: { daily: boolean; weekly: boolean; monthly: boolean };
  recipient_count: number;
  go_live_date: string;
  /** Last 30 days of send cells, newest first */
  daily: SendCell[];
  weekly: SendCell[];
  monthly: SendCell[];
};

const TODAY = "2026-06-03";

function isoDaysAgo(daysAgo: number, ref: string = TODAY): string {
  const [y, m, d] = ref.split("-").map(Number);
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
   Rooftop pool · realistic US dealership names
   ============================================================ */
const CSMS = ["Aanya Sharma", "Carlos Vega", "Diego Park", "Mira Patel", "Tariq Brooks", "Hannah Cole"];
const BRANDS = [
  "Mercedes-Benz", "Ford", "Toyota", "Honda", "Chevrolet", "BMW",
  "Audi", "Nissan", "Hyundai", "Kia", "Lexus", "Mazda", "Subaru",
];
const CITIES = [
  "Laguna Niguel", "San Diego", "Newport Beach", "Anaheim", "Pasadena",
  "Long Beach", "Riverside", "Santa Barbara", "Bakersfield", "Fresno",
  "Sacramento", "San Jose", "Oakland", "Berkeley", "Modesto",
  "Stockton", "Salinas", "Monterey", "Santa Cruz", "Sunnyvale",
  "Tustin", "Irvine", "Costa Mesa", "Huntington Beach", "Garden Grove",
  "Westminster", "Fullerton", "Cerritos", "Glendale", "Burbank",
  "Pomona", "Ontario", "Rancho Cucamonga", "Corona", "Temecula",
  "Escondido", "Carlsbad", "Encinitas", "Vista", "Oceanside",
];
const GROUPS = [
  "Penske Automotive", "AutoNation", "Sonic Automotive", "Lithia Motors",
  "Group 1 Automotive", undefined, undefined, undefined, // some standalone
];

/* ============================================================
   Status patterns · seeded so the table feels real
   ============================================================ */
type Pattern = "healthy" | "occasional_failure" | "silent_days" | "paused_weekly" | "monthly_only" | "new_rooftop" | "failing";

function statusForDay(pattern: Pattern, daysAgo: number): { status: SendStatus; reason?: string } {
  // Future days = scheduled
  if (daysAgo < 0) return { status: "scheduled" };

  switch (pattern) {
    case "healthy":
      // Sunday (every 7th day back, anchored on Mon=today)
      // For mocking: every 6 days, mark as suppressed (silent day)
      if (daysAgo === 6 || daysAgo === 13 || daysAgo === 20 || daysAgo === 27) {
        return { status: "suppressed", reason: "silent_day" };
      }
      return { status: "sent" };

    case "occasional_failure":
      if (daysAgo === 2) return { status: "failed", reason: "smtp_timeout" };
      if (daysAgo === 12) return { status: "failed", reason: "bounced" };
      if (daysAgo === 6 || daysAgo === 13 || daysAgo === 20) {
        return { status: "suppressed", reason: "silent_day" };
      }
      return { status: "sent" };

    case "silent_days":
      // Multiple silent suppressions
      if ([3, 4, 10, 11, 17, 18, 24, 25].includes(daysAgo)) {
        return { status: "suppressed", reason: "silent_day" };
      }
      return { status: "sent" };

    case "paused_weekly":
      // Subscription paused 5 days ago
      if (daysAgo < 5) return { status: "not_subscribed" };
      if (daysAgo === 6 || daysAgo === 13) {
        return { status: "suppressed", reason: "silent_day" };
      }
      return { status: "sent" };

    case "monthly_only":
      return { status: "not_subscribed" };

    case "new_rooftop":
      // Onboarded 8 days ago
      if (daysAgo > 8) return { status: "not_subscribed" };
      if (daysAgo === 6) return { status: "suppressed", reason: "silent_day" };
      return { status: "sent" };

    case "failing":
      // Recent stretch of failures · CSM needs to act
      if (daysAgo <= 2) return { status: "failed", reason: "smtp_timeout" };
      if (daysAgo === 3) return { status: "not_sent", reason: "scheduler_skipped" };
      if (daysAgo === 6 || daysAgo === 13) {
        return { status: "suppressed", reason: "silent_day" };
      }
      return { status: "sent" };
  }
}

function generateDaily(pattern: Pattern): SendCell[] {
  return Array.from({ length: 30 }, (_, i) => {
    const { status, reason } = statusForDay(pattern, i);
    return {
      date: isoDaysAgo(i),
      cadence: "daily" as const,
      status,
      suppression_reason: reason,
    };
  });
}

function generateWeekly(pattern: Pattern): SendCell[] {
  return Array.from({ length: 8 }, (_, i) => {
    // Weekly cadence has fewer failure modes; simplify
    let status: SendStatus = "sent";
    let reason: string | undefined;
    if (pattern === "monthly_only") status = "not_subscribed";
    if (pattern === "new_rooftop" && i > 1) status = "not_subscribed";
    if (pattern === "failing" && i === 0) {
      status = "failed";
      reason = "smtp_timeout";
    }
    if (pattern === "paused_weekly" && i < 1) status = "not_subscribed";
    if (pattern === "occasional_failure" && i === 3) {
      status = "failed";
      reason = "bounced";
    }
    return {
      date: isoWeeksAgo(i),
      cadence: "weekly" as const,
      status,
      suppression_reason: reason,
    };
  });
}

function generateMonthly(pattern: Pattern): SendCell[] {
  return Array.from({ length: 6 }, (_, i) => {
    let status: SendStatus = "sent";
    let reason: string | undefined;
    if (pattern === "new_rooftop" && i > 0) status = "not_subscribed";
    if (pattern === "failing" && i === 0) {
      status = "failed";
      reason = "smtp_timeout";
    }
    return {
      date: isoMonthsAgo(i),
      cadence: "monthly" as const,
      status,
      suppression_reason: reason,
    };
  });
}

function rng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/* ============================================================
   Build the rooftop list
   ============================================================ */
const PATTERN_WEIGHTS: { pattern: Pattern; weight: number }[] = [
  { pattern: "healthy", weight: 22 },
  { pattern: "occasional_failure", weight: 6 },
  { pattern: "silent_days", weight: 4 },
  { pattern: "paused_weekly", weight: 2 },
  { pattern: "monthly_only", weight: 2 },
  { pattern: "new_rooftop", weight: 2 },
  { pattern: "failing", weight: 3 },
];

function pickPattern(r: () => number): Pattern {
  const total = PATTERN_WEIGHTS.reduce((s, w) => s + w.weight, 0);
  const pick = r() * total;
  let acc = 0;
  for (const p of PATTERN_WEIGHTS) {
    acc += p.weight;
    if (pick < acc) return p.pattern;
  }
  return "healthy";
}

function buildRooftops(): RooftopRow[] {
  const rooftops: RooftopRow[] = [];
  const r = rng(42);

  for (let i = 0; i < 40; i++) {
    const brand = BRANDS[Math.floor(r() * BRANDS.length)];
    const city = CITIES[i % CITIES.length];
    const csm = CSMS[Math.floor(r() * CSMS.length)];
    const group = GROUPS[Math.floor(r() * GROUPS.length)];
    const pattern = pickPattern(r);

    rooftops.push({
      rooftop_id: `rt-${String(i + 1).padStart(3, "0")}`,
      name: `${brand} of ${city}`,
      csm,
      group,
      state: "CA",
      brand,
      subscriptions: {
        daily: pattern !== "monthly_only",
        weekly:
          pattern !== "monthly_only" &&
          pattern !== "paused_weekly",
        monthly: true,
      },
      recipient_count: 2 + Math.floor(r() * 6),
      go_live_date:
        pattern === "new_rooftop" ? isoDaysAgo(8) : isoDaysAgo(120 + Math.floor(r() * 600)),
      daily: generateDaily(pattern),
      weekly: generateWeekly(pattern),
      monthly: generateMonthly(pattern),
    });
  }

  return rooftops;
}

export const ROOFTOPS = buildRooftops();

/* ============================================================
   Tracker meta · roll-up for the header strip
   ============================================================ */
export const TRACKER_META = {
  today: TODAY,
  lastSyncedMinutesAgo: 7,
  totalRooftops: ROOFTOPS.length,
  csms: CSMS,
  groups: Array.from(new Set(ROOFTOPS.map((r) => r.group).filter((g): g is string => !!g))),
  brands: Array.from(new Set(ROOFTOPS.map((r) => r.brand))),
};

/* ============================================================
   Helpers · status counters
   ============================================================ */
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
