/**
 * Barrel re-export for all mock data.
 *
 * FE imports from this single entry point:
 *   import { ACTION_ITEMS, CUSTOMER_DETAILS, INTENT_TAXONOMY, NOW_ISO } from "@test-data";
 *
 * Engineers wiring backend: each constant maps to a REST resource:
 *   ACTION_ITEMS        ← GET /api/action-items?status=...
 *   CUSTOMER_DETAILS    ← GET /api/customers
 *   CONVERSATIONS       ← GET /api/conversations
 *   USERS               ← GET /api/users
 *   INTENT_TAXONOMY     ← static config bundled with FE
 */

export * from "./schema";
export { INTENT_TAXONOMY, INTENTS_BY_DEPT_COLOR } from "./taxonomy";
export { USERS, CURRENT_USER_ID, ROOFTOP_ID } from "./users";
export { CUSTOMER_DETAILS, VEHICLES, APPOINTMENTS, NOW_ISO } from "./customers";
export { CONVERSATIONS } from "./conversations";

import { ACTION_ITEMS as _CORE_ACTION_ITEMS } from "./action_items";
import { COMPLETED_HISTORY } from "./completed_history";
import type { ActionItem } from "./schema";

/**
 * Combined live + historical completed items. The bulk history lives in
 * `completed_history.ts` to demonstrate the Completed view at scale (~200 items).
 */
export const ACTION_ITEMS: ActionItem[] = [..._CORE_ACTION_ITEMS, ...COMPLETED_HISTORY];
