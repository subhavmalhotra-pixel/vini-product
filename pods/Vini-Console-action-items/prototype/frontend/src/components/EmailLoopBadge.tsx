import type { ActionItem } from "@test-data";
import { formatDate } from "../data/helpers";
import { MailEnvelopeIcon } from "./Icon";

const EMAIL_TYPE_LABEL: Record<string, string> = {
  daily: "Daily Digest",
  weekly: "Weekly Performance",
  monthly: "Monthly Value",
  eoc: "End-of-Campaign",
};

export function EmailLoopBadge({ item }: { item: ActionItem }) {
  if (!item.surfaced_in_emails.length) return null;
  const latest = item.surfaced_in_emails[item.surfaced_in_emails.length - 1];
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-text-tertiary">
      <MailEnvelopeIcon size={11} />
      <span>
        Surfaced in {EMAIL_TYPE_LABEL[latest.email_type]} ·{" "}
        {formatDate(latest.surfaced_at)}
        {latest.cta_clicked ? (
          <span className="ml-1 font-semibold text-status-ok">· clicked</span>
        ) : null}
      </span>
    </span>
  );
}
