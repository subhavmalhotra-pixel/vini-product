import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { ActionItem, CustomerProfile } from "@test-data";
import {
  getCustomerProfile,
  getUser,
  reopenActionItem,
  escalateActionItem,
} from "../data/store";
import { useStore } from "../data/useStore";
import { formatDateTime, formatDate } from "../data/helpers";
import { IntentChip } from "../components/IntentChip";
import { ChannelIcon } from "../components/ChannelIcon";
import { AgeBadge } from "../components/AgeBadge";
import { AssigneeBadge } from "../components/AssigneeBadge";
import { RepeatCallerChip } from "../components/RepeatCallerChip";
import { Button } from "../components/Button";
import { AssignDrawer } from "../components/AssignDrawer";
import { CloseDrawer } from "../components/CloseDrawer";
import { SourceDrawer } from "../components/SourceDrawer";
import { BulkCloseDrawer } from "../components/BulkCloseDrawer";
import {
  ArrowLeftIcon,
  AlertIcon,
  BoltIcon,
  PlayIcon,
  CheckIcon,
} from "../components/Icon";

type Tab = "details" | "vehicles" | "conversations" | "action_items" | "appointments";

export function CustomerProfilePage() {
  useStore();
  const { customerId } = useParams<{ customerId: string }>();
  const profile = customerId ? getCustomerProfile(customerId) : undefined;
  const [tab, setTab] = useState<Tab>("action_items");
  const [assignItem, setAssignItem] = useState<ActionItem | null>(null);
  const [closeItem, setCloseItem] = useState<ActionItem | null>(null);
  const [sourceItem, setSourceItem] = useState<ActionItem | null>(null);
  const [bulkItems, setBulkItems] = useState<ActionItem[] | null>(null);

  if (!profile) {
    return (
      <div className="flex h-full items-center justify-center text-[13px] text-text-secondary">
        Customer not found.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <ProfileHeader
        profile={profile}
        onEscalate={(id) => escalateActionItem(id, "repeat_caller_threshold")}
      />
      <ProfileTabs tab={tab} onChange={setTab} profile={profile} />
      <div className="flex-1 overflow-y-auto scroll-thin">
        {tab === "details" && <DetailsTab profile={profile} />}
        {tab === "vehicles" && <VehiclesTab profile={profile} />}
        {tab === "conversations" && <ConversationsTab profile={profile} />}
        {tab === "action_items" && (
          <ActionItemsTab
            profile={profile}
            onAssign={setAssignItem}
            onClose={setCloseItem}
            onListen={setSourceItem}
            onBulkClose={setBulkItems}
            onReopen={(i) =>
              reopenActionItem(i.action_item_id, "from customer profile")
            }
          />
        )}
        {tab === "appointments" && <AppointmentsTab profile={profile} />}
      </div>

      <AssignDrawer
        item={assignItem}
        onClose={() => setAssignItem(null)}
        onOpenSource={setSourceItem}
      />
      <CloseDrawer
        item={closeItem}
        onClose={() => setCloseItem(null)}
        onOpenSource={setSourceItem}
      />
      <BulkCloseDrawer
        items={bulkItems}
        onClose={() => setBulkItems(null)}
        onOpenSource={setSourceItem}
      />
      <SourceDrawer item={sourceItem} onClose={() => setSourceItem(null)} />
    </div>
  );
}

// -------------------------------------------------------------------------
function ProfileHeader({
  profile,
  onEscalate,
}: {
  profile: CustomerProfile;
  onEscalate: (id: string) => void;
}) {
  const { details } = profile;
  const repeatItem = profile.action_items.find(
    (i) => i.status === "pending" && i.repeat_caller_count >= 3
  );

  const customerTypeStyle: Record<string, string> = {
    new: "bg-status-ok-soft text-status-ok",
    returning: "bg-dept-sales-soft text-dept-sales",
    lapsed: "bg-status-warning-soft text-status-warning",
  };

  return (
    <div className="border-b border-border-subtle bg-white">
      {repeatItem ? (
        <div className="flex items-center justify-between gap-3 border-b border-status-warning/30 bg-status-warning-soft px-5 py-2">
          <div className="flex items-center gap-2 text-[12px] text-status-warning">
            <AlertIcon size={14} />
            <span>
              This customer has contacted us{" "}
              <strong>{repeatItem.repeat_caller_count} times</strong> for{" "}
              <strong>{repeatItem.intent_id.replace(/_/g, " ")}</strong> in the
              last few days.
            </span>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => onEscalate(repeatItem.action_item_id)}
          >
            <BoltIcon size={11} /> Escalate
          </Button>
        </div>
      ) : null}

      <div className="px-5 py-3">
        <Link
          to="/action-items/pending"
          className="mb-1.5 inline-flex items-center gap-1 text-[11px] text-text-tertiary hover:text-text-secondary"
        >
          <ArrowLeftIcon size={11} /> Back to Action Items
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-purple text-sm font-bold text-white">
            {details.display_name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold text-text-primary">
                {details.display_name}
              </h1>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                  customerTypeStyle[details.customer_type]
                }`}
              >
                {details.customer_type}
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-[11px] text-text-tertiary">
              <span className="tabular">{details.phone}</span>
              <span>·</span>
              <span>{details.email}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                Prefers <ChannelIcon channel={details.preferred_channel} showLabel />
              </span>
              <span>·</span>
              <span className="uppercase">{details.language}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileTabs({
  tab,
  onChange,
  profile,
}: {
  tab: Tab;
  onChange: (t: Tab) => void;
  profile: CustomerProfile;
}) {
  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "details", label: "Details", count: 0 },
    { id: "vehicles", label: "Vehicles", count: profile.vehicles.length },
    {
      id: "conversations",
      label: "Conversations",
      count: profile.conversations.length,
    },
    {
      id: "action_items",
      label: "Action items",
      count: profile.action_items.length,
    },
    {
      id: "appointments",
      label: "Appointments",
      count: profile.appointments.length,
    },
  ];
  return (
    <nav className="flex items-center gap-0 border-b border-border-subtle bg-white px-5">
      {tabs.map((t) => {
        const active = tab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`flex items-center gap-1.5 border-b-2 px-2.5 pb-2 pt-1.5 text-[12px] font-semibold ${
              active
                ? "border-brand-purple text-brand-purple"
                : "border-transparent text-text-tertiary hover:text-text-secondary"
            }`}
          >
            <span>{t.label}</span>
            {t.count > 0 ? (
              <span
                className={`rounded-full px-1.5 py-px text-[9px] font-bold tabular ${
                  active
                    ? "bg-brand-purple text-white"
                    : "bg-surface-subtle text-text-tertiary"
                }`}
              >
                {t.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}

// -------------------------------------------------------------------------
function DetailsTab({ profile }: { profile: CustomerProfile }) {
  const { details } = profile;
  const fields: { label: string; value: string; mono?: boolean }[] = [
    { label: "Customer ID", value: details.customer_id, mono: true },
    { label: "Name", value: details.display_name },
    { label: "Phone", value: details.phone, mono: true },
    { label: "Email", value: details.email },
    { label: "Preferred channel", value: details.preferred_channel },
    { label: "Language", value: details.language.toUpperCase() },
    { label: "Customer type", value: details.customer_type },
    { label: "First seen", value: formatDate(details.first_seen_at) },
  ];
  return (
    <div className="grid grid-cols-2 gap-2.5 p-4">
      {fields.map((f) => (
        <div
          key={f.label}
          className="rounded-md border border-border-subtle bg-white px-3 py-2"
        >
          <div className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
            {f.label}
          </div>
          <div
            className={`mt-0.5 text-[13px] text-text-primary ${
              f.mono ? "font-mono text-[12px]" : ""
            }`}
          >
            {f.value}
          </div>
        </div>
      ))}
    </div>
  );
}

// -------------------------------------------------------------------------
function VehiclesTab({ profile }: { profile: CustomerProfile }) {
  if (profile.vehicles.length === 0) {
    return (
      <div className="p-4 text-[13px] text-text-secondary">
        No vehicles on file for this customer.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-2.5 p-4">
      {profile.vehicles.map((v) => (
        <div
          key={v.vehicle_id}
          className="rounded-md border border-border-subtle bg-white px-3 py-2.5"
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-[13px] font-semibold text-text-primary">
                {v.year} {v.make} {v.model}
              </div>
              <div className="mt-0.5 font-mono text-[10px] text-text-tertiary">
                VIN ···{v.vin_suffix}
              </div>
            </div>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                v.ownership_status === "owned"
                  ? "bg-status-ok-soft text-status-ok"
                  : v.ownership_status === "leased"
                    ? "bg-dept-sales-soft text-dept-sales"
                    : "bg-surface-subtle text-text-tertiary"
              }`}
            >
              {v.ownership_status.replace("_", " ")}
            </span>
          </div>
          {v.open_recalls > 0 ? (
            <div className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-status-past-soft px-1.5 py-0.5 text-[10px] font-semibold text-status-past">
              <AlertIcon size={10} />
              {v.open_recalls} open recall{v.open_recalls > 1 ? "s" : ""}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

// -------------------------------------------------------------------------
function ConversationsTab({ profile }: { profile: CustomerProfile }) {
  const sorted = [...profile.conversations].sort((a, b) =>
    b.started_at.localeCompare(a.started_at)
  );
  if (sorted.length === 0) {
    return (
      <div className="p-4 text-[13px] text-text-secondary">
        No conversations yet.
      </div>
    );
  }
  return (
    <ul className="divide-y divide-border-subtle">
      {sorted.map((c) => (
        <li key={c.conversation_id} className="px-5 py-2.5 hover:bg-surface-subtle">
          <div className="flex items-center gap-2">
            <ChannelIcon channel={c.channel} showLabel />
            <span className="text-text-tertiary">·</span>
            <span className="tabular text-[11px] text-text-secondary">
              {formatDateTime(c.started_at)}
            </span>
            <span className="text-text-tertiary">·</span>
            <IntentChip intentId={c.primary_intent_id} size="xs" primary />
            {c.intent_ids
              .filter((id) => id !== c.primary_intent_id)
              .map((id) => (
                <IntentChip key={id} intentId={id} size="xs" />
              ))}
          </div>
          <div className="mt-1 text-[12px] text-text-secondary">
            <span className="font-mono text-[10px] text-text-tertiary">
              {c.conversation_id}
            </span>{" "}
            · {c.transcript.length} turns · outcome:{" "}
            <span className="font-semibold text-text-primary">
              {c.outcome.replace(/_/g, " ")}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

// -------------------------------------------------------------------------
function ActionItemsTab({
  profile,
  onAssign,
  onClose,
  onListen,
  onBulkClose,
  onReopen,
}: {
  profile: CustomerProfile;
  onAssign: (i: ActionItem) => void;
  onClose: (i: ActionItem) => void;
  onListen: (i: ActionItem) => void;
  onBulkClose: (items: ActionItem[]) => void;
  onReopen: (i: ActionItem) => void;
}) {
  const pending = profile.action_items
    .filter((i) => i.status === "pending")
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  const completed = profile.action_items
    .filter((i) => i.status === "completed")
    .sort((a, b) =>
      (b.closed_at ?? "").localeCompare(a.closed_at ?? "")
    );

  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Drop selections that no longer exist (after close)
  useEffect(() => {
    setSelected((prev) => {
      const valid = new Set<string>();
      for (const id of prev) {
        if (pending.find((i) => i.action_item_id === id)) valid.add(id);
      }
      return valid;
    });
  }, [pending.length]); // eslint-disable-line react-hooks/exhaustive-deps

  if (profile.action_items.length === 0) {
    return (
      <div className="p-4 text-[13px] text-text-secondary">
        No open or recent action items for this customer.
      </div>
    );
  }

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const selectAll = () =>
    setSelected(new Set(pending.map((i) => i.action_item_id)));
  const selectNone = () => setSelected(new Set());

  return (
    <div className="divide-y-2 divide-border-subtle">
      {pending.length > 0 ? (
        <section className="bg-white">
          {/* Pending header — with bulk-resolve CTA when 2+ items */}
          <div className="flex items-center justify-between gap-2 border-b border-border-subtle bg-surface-subtle px-5 py-2">
            <div className="text-[10px] font-bold uppercase tracking-wide text-text-secondary">
              Pending · {pending.length}
              {pending.length >= 2 ? (
                <span className="ml-2 normal-case font-medium text-text-tertiary">
                  · multiple intents detected — resolve together to save context
                </span>
              ) : null}
            </div>
            {pending.length >= 2 ? (
              <div className="flex items-center gap-2">
                {selected.size > 0 ? (
                  <>
                    <span className="text-[11px] text-text-tertiary">
                      {selected.size} selected
                    </span>
                    <button
                      onClick={selectNone}
                      className="text-[11px] font-medium text-text-tertiary hover:text-text-secondary"
                    >
                      Clear
                    </button>
                  </>
                ) : (
                  <button
                    onClick={selectAll}
                    className="text-[11px] font-medium text-text-tertiary hover:text-text-secondary"
                  >
                    Select all
                  </button>
                )}
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    const target =
                      selected.size > 0
                        ? pending.filter((i) =>
                            selected.has(i.action_item_id)
                          )
                        : pending;
                    onBulkClose(target);
                  }}
                >
                  <CheckIcon size={11} />
                  Resolve {selected.size > 0 ? selected.size : pending.length}{" "}
                  together
                </Button>
              </div>
            ) : null}
          </div>
          <ul>
            {pending.map((i) => (
              <li key={i.action_item_id} className="px-5 py-2.5">
                <CompactActionItem
                  item={i}
                  selectable={pending.length >= 2}
                  isSelected={selected.has(i.action_item_id)}
                  onToggleSelect={() => toggle(i.action_item_id)}
                  onAssign={onAssign}
                  onClose={onClose}
                  onListen={onListen}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {completed.length > 0 ? (
        <section className="bg-white">
          <div className="border-b border-border-subtle bg-surface-subtle px-5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-text-secondary">
            Completed · {completed.length}
          </div>
          <ul>
            {completed.map((i) => (
              <li key={i.action_item_id} className="px-5 py-2.5">
                <CompactActionItem item={i} onReopen={onReopen} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function CompactActionItem({
  item,
  selectable,
  isSelected,
  onToggleSelect,
  onAssign,
  onClose,
  onListen,
  onReopen,
}: {
  item: ActionItem;
  selectable?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onAssign?: (i: ActionItem) => void;
  onClose?: (i: ActionItem) => void;
  onListen?: (i: ActionItem) => void;
  onReopen?: (i: ActionItem) => void;
}) {
  const isPending = item.status === "pending";
  return (
    <div className="flex items-start justify-between gap-3">
      {selectable && isPending ? (
        <input
          type="checkbox"
          checked={!!isSelected}
          onChange={onToggleSelect}
          className="mt-1 h-3.5 w-3.5 cursor-pointer flex-shrink-0 rounded border-border-strong text-brand-purple focus:ring-brand-purple"
          aria-label="Include in bulk close"
        />
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <IntentChip
            intentId={item.intent_id}
            size="sm"
            primary={item.is_primary_intent_of_source}
          />
          <RepeatCallerChip item={item} />
        </div>
        <p className="mt-1 text-[13px] leading-snug text-text-primary">
          {item.intent_recap}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-text-tertiary">
          {isPending ? (
            <>
              <AgeBadge item={item} />
              <span>·</span>
              <ChannelIcon channel={item.source_channel} showLabel />
              {item.assignee_user_id ? (
                <>
                  <span>·</span>
                  <AssigneeBadge userId={item.assignee_user_id} variant="full" />
                </>
              ) : null}
            </>
          ) : (
            <>
              <span>
                Closed {item.closed_at ? formatDateTime(item.closed_at) : "—"} by{" "}
                <span className="font-semibold text-text-secondary">
                  {getUser(item.closed_by_user_id)?.display_name ?? "—"}
                </span>
              </span>
              {item.resolution_note ? (
                <span className="italic">— "{item.resolution_note}"</span>
              ) : null}
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        {isPending ? (
          <>
            <Button size="sm" variant="tertiary" onClick={() => onListen?.(item)}>
              <PlayIcon size={11} />
            </Button>
            <Button size="sm" variant="secondary" onClick={() => onAssign?.(item)}>
              {item.assignee_user_id ? "Reassign" : "Assign"}
            </Button>
            <Button size="sm" variant="primary" onClick={() => onClose?.(item)}>
              Close
            </Button>
          </>
        ) : (
          <Button size="sm" variant="tertiary" onClick={() => onReopen?.(item)}>
            Re-open
          </Button>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
function AppointmentsTab({ profile }: { profile: CustomerProfile }) {
  if (profile.appointments.length === 0) {
    return (
      <div className="p-4 text-[13px] text-text-secondary">
        No appointments scheduled.
      </div>
    );
  }
  const statusStyle: Record<string, string> = {
    scheduled: "bg-status-ok-soft text-status-ok",
    shown: "bg-dept-sales-soft text-dept-sales",
    no_show: "bg-status-past-soft text-status-past",
    completed: "bg-surface-subtle text-text-secondary",
  };
  return (
    <ul className="divide-y divide-border-subtle">
      {profile.appointments.map((a) => (
        <li key={a.appointment_id} className="px-5 py-2.5">
          <div className="flex items-center gap-2.5">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                statusStyle[a.status]
              }`}
            >
              {a.status.replace("_", " ")}
            </span>
            <span className="tabular text-[12px] text-text-primary">
              {formatDateTime(a.scheduled_at)}
            </span>
            {a.advisor_user_id ? (
              <span className="text-[10px] text-text-tertiary">
                · advisor {getUser(a.advisor_user_id)?.display_name}
              </span>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
