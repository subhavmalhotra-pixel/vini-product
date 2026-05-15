/**
 * Lookup of conversation journeys by ID — sourced from test-data/conversations.ts.
 * Allows the lead-drilldown route to resolve any journey_id to its full data.
 */
import {
  STORY_AT_RISK_SAVE,
  STORY_RECALL_ESCALATION,
  STORY_LAPSED_REENGAGEMENT,
  STORY_MULTI_TOUCH,
  STORY_COMPLIANCE_HANDLED,
  STORY_SHORT_HANGUP,
} from "@test-data/conversations";

import type { ConversationJourney } from "@test-data/schema";

export const ALL_JOURNEYS_TS: Record<string, ConversationJourney> = {
  [STORY_AT_RISK_SAVE.journey_id]: STORY_AT_RISK_SAVE,
  [STORY_RECALL_ESCALATION.journey_id]: STORY_RECALL_ESCALATION,
  [STORY_LAPSED_REENGAGEMENT.journey_id]: STORY_LAPSED_REENGAGEMENT,
  [STORY_MULTI_TOUCH.journey_id]: STORY_MULTI_TOUCH,
  [STORY_COMPLIANCE_HANDLED.journey_id]: STORY_COMPLIANCE_HANDLED,
  [STORY_SHORT_HANGUP.journey_id]: STORY_SHORT_HANGUP,
};
