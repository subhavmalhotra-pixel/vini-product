/**
 * Barrel re-export for all mock data.
 *
 * Frontend imports from this single entry point:
 *   import { ALL_DAILY_SCENARIOS, ALL_WEEKLY_SCENARIOS } from "@test-data";
 *
 * Engineers wiring backend: each scenario corresponds to a single API response
 * shape — replace static imports with `fetch('/api/emails/daily?...').then(...)`
 * returning the same TypeScript shape.
 */

export * from "./schema";
export * from "./dealers";
export * from "./conversations";

export { ALL_DAILY_SCENARIOS } from "./scenarios/daily";
export { ALL_WEEKLY_SCENARIOS } from "./scenarios/weekly";
export { ALL_MONTHLY_SCENARIOS } from "./scenarios/monthly";
export { ALL_EOC_SCENARIOS } from "./scenarios/eoc";
export { ALL_POST_CALL_SCENARIOS } from "./scenarios/post_call";

// Individual scenario exports — used by FE scenario switcher
export {
  DAILY_NORMAL_BOTH, // v3: restored — GM view (sales + service) back in the active switcher
  DAILY_NORMAL_SALES,
  DAILY_NORMAL_SERVICE,
  DAILY_SILENT_DAY,
  DAILY_ZERO_INBOUND_CALLS,
  DAILY_NO_OUTBOUND_NO_CAMPAIGN,
  DAILY_ZERO_OB_ACTIVE_CAMPAIGN,
  DAILY_YESTERDAY_ZERO_MTD_POSITIVE,
  DAILY_DAY_1_ROOFTOP,
  DAILY_SMALL_DENOMINATOR,
} from "./scenarios/daily";

export {
  WEEKLY_MULTI_AGENT_NORMAL, // deprecated v2 alias → Sales IB
  WEEKLY_SALES_IB_ONLY,
  WEEKLY_SALES_OB_ONLY,
  WEEKLY_SERVICE_IB_ONLY,
  WEEKLY_SERVICE_OB_ONLY,
  WEEKLY_NO_STORY_FALLBACK,
} from "./scenarios/weekly";

export {
  MONTHLY_SALES_IB_ONLY,
  MONTHLY_SALES_OB_ONLY,
  MONTHLY_SERVICE_IB_ONLY,
  MONTHLY_SERVICE_OB_ONLY,
  MONTHLY_NO_STORIES,
} from "./scenarios/monthly";

export {
  EOC_NORMAL,
  EOC_WITH_ESTIMATE,
  EOC_AUDIENCES_EXHAUSTED,
} from "./scenarios/eoc";

export {
  POST_CALL_BOTH,
  POST_CALL_ONLY_ACTION,
  POST_CALL_ONLY_APPT,
} from "./scenarios/post_call";
