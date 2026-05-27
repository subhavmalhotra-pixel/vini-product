/** Derived helpers — pure functions over store data. */
import {
  type ActionItem,
  type Channel,
  type Dept,
  INTENT_TAXONOMY,
  INTENTS_BY_DEPT_COLOR,
} from "@test-data";
import { NOW_ISO } from "./store";

const NOW_MS = new Date(NOW_ISO).getTime();

/** Age in minutes since creation, vs the fixed NOW_ISO. */
export function ageMinutes(item: ActionItem): number {
  return Math.floor((NOW_MS - new Date(item.created_at).getTime()) / 60_000);
}

export function ageLabel(mins: number): string {
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    const remMin = mins % 60;
    return remMin > 0 ? `${hours}h ${remMin}m ago` : `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

/**
 * Returns SLA status for a pending item.
 * Note: this simplified check uses elapsed-wall-time vs SLA hours; "business
 * hours only" intents would need a true business-calendar in production.
 */
export type SLAState = "fresh" | "ok" | "warning" | "past";

export function slaState(item: ActionItem): SLAState {
  if (item.status === "completed") return "ok";
  const intent = INTENT_TAXONOMY[item.intent_id];
  const slaMins = intent.sla_hours * 60;
  const elapsed = ageMinutes(item);
  if (elapsed < 30) return "fresh";
  if (elapsed >= slaMins) return "past";
  if (elapsed >= slaMins * 0.75) return "warning";
  return "ok";
}

export function deptOf(item: ActionItem): Dept {
  return INTENT_TAXONOMY[item.intent_id].dept;
}

export function deptColor(dept: Dept): string {
  return INTENTS_BY_DEPT_COLOR[dept] ?? "slate";
}

export function channelLabel(channel: Channel): string {
  switch (channel) {
    case "call":
      return "Call";
    case "sms":
      return "SMS";
    case "chat":
      return "Chat";
    case "email":
      return "Email";
    case "hitl_takeover":
      return "Human takeover";
    case "hitl_warm_transfer":
      return "Warm transfer";
  }
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
