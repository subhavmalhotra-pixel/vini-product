import { useMemo, useState } from "react";
import type { AppointmentInput } from "../data/store";
import {
  getAppointmentsForCustomer,
  getUser,
  listUsers,
  getCustomerProfile,
} from "../data/store";
import { formatDateTime } from "../data/helpers";
import { CalendarIcon, CheckIcon } from "./Icon";

/**
 * Subform for the Close drawer when resolution_type === "appointment_booked".
 * Lets the closer either:
 *   - Pick an existing scheduled appointment for the customer (e.g. one Vini
 *     pre-booked or a human pre-scheduled), OR
 *   - Create a new appointment inline (date · time · advisor · vehicle).
 *
 * Emits an `AppointmentInput` to the parent which forwards it to closeActionItem.
 */
export function AppointmentPicker({
  customerId,
  value,
  onChange,
}: {
  customerId: string;
  value: AppointmentInput | null;
  onChange: (next: AppointmentInput | null) => void;
}) {
  const existing = useMemo(
    () =>
      getAppointmentsForCustomer(customerId)
        .filter((a) => a.status === "scheduled")
        .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at)),
    [customerId]
  );

  const profile = getCustomerProfile(customerId);
  const customerVehicles = profile?.vehicles ?? [];
  const advisors = listUsers().filter(
    (u) =>
      u.role === "service_advisor" ||
      u.role === "sales_advisor" ||
      u.role === "bdc_agent"
  );

  const initialMode: "existing" | "new" =
    value?.kind === "existing"
      ? "existing"
      : value?.kind === "new"
        ? "new"
        : existing.length > 0
          ? "existing"
          : "new";
  const [mode, setMode] = useState<"existing" | "new">(initialMode);

  // New-appointment local state
  const defaultDate = (() => {
    const d = new Date("2026-05-22T10:00:00-07:00");
    return d.toISOString().slice(0, 16);
  })();
  const [newDateTime, setNewDateTime] = useState<string>(
    value?.kind === "new" ? value.scheduled_at.slice(0, 16) : defaultDate
  );
  const [newAdvisor, setNewAdvisor] = useState<string>(
    value?.kind === "new" ? value.advisor_user_id ?? "" : ""
  );
  const [newVehicle, setNewVehicle] = useState<string>(
    value?.kind === "new" ? value.vehicle_id ?? "" : ""
  );

  // Push updates upstream on every local mutation
  const updateNew = (
    nextDateTime = newDateTime,
    nextAdvisor = newAdvisor,
    nextVehicle = newVehicle
  ) => {
    onChange({
      kind: "new",
      scheduled_at: new Date(nextDateTime).toISOString(),
      advisor_user_id: nextAdvisor || undefined,
      vehicle_id: nextVehicle || undefined,
    });
  };

  const selectExisting = (id: string) =>
    onChange({ kind: "existing", appointment_id: id });

  return (
    <div className="rounded-lg border border-brand-purple-border bg-brand-purple-soft/30 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-brand-purple">
          <CalendarIcon size={12} />
          Link appointment
        </div>
        <div className="inline-flex overflow-hidden rounded-md border border-brand-purple-border">
          <button
            onClick={() => {
              setMode("existing");
              if (existing.length > 0) {
                selectExisting(value?.kind === "existing" ? value.appointment_id : existing[0].appointment_id);
              } else {
                onChange(null);
              }
            }}
            disabled={existing.length === 0}
            className={`px-2.5 py-0.5 text-[10px] font-semibold disabled:opacity-40 ${
              mode === "existing"
                ? "bg-brand-purple text-white"
                : "bg-white text-brand-purple"
            }`}
          >
            Use existing
            {existing.length > 0 ? ` (${existing.length})` : ""}
          </button>
          <button
            onClick={() => {
              setMode("new");
              updateNew();
            }}
            className={`px-2.5 py-0.5 text-[10px] font-semibold ${
              mode === "new"
                ? "bg-brand-purple text-white"
                : "bg-white text-brand-purple"
            }`}
          >
            Create new
          </button>
        </div>
      </div>

      {mode === "existing" ? (
        existing.length === 0 ? (
          <div className="mt-2 text-[12px] text-text-tertiary">
            No scheduled appointments for this customer. Create one below.
          </div>
        ) : (
          <ul className="mt-2 space-y-1">
            {existing.map((a) => {
              const checked =
                value?.kind === "existing" && value.appointment_id === a.appointment_id;
              const advisor = getUser(a.advisor_user_id);
              return (
                <li key={a.appointment_id}>
                  <button
                    onClick={() => selectExisting(a.appointment_id)}
                    className={`flex w-full items-center justify-between gap-2 rounded-md border px-2.5 py-2 text-left text-[12px] ${
                      checked
                        ? "border-brand-purple bg-white"
                        : "border-border-subtle bg-white hover:bg-surface-subtle"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`flex h-3.5 w-3.5 items-center justify-center rounded-full border ${
                          checked
                            ? "border-brand-purple bg-brand-purple text-white"
                            : "border-border-strong"
                        }`}
                      >
                        {checked ? <CheckIcon size={9} /> : null}
                      </span>
                      <span>
                        <span className="font-semibold text-text-primary">
                          {formatDateTime(a.scheduled_at)}
                        </span>
                        {advisor ? (
                          <span className="ml-1.5 text-text-tertiary">
                            · adviser {advisor.display_name}
                          </span>
                        ) : null}
                      </span>
                    </span>
                    <span className="rounded-full bg-status-ok-soft px-2 py-0.5 text-[10px] font-semibold uppercase text-status-ok">
                      Scheduled
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )
      ) : (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="col-span-2">
            <label className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
              Date & time <span className="text-status-past">*</span>
            </label>
            <input
              type="datetime-local"
              value={newDateTime}
              onChange={(e) => {
                setNewDateTime(e.target.value);
                updateNew(e.target.value);
              }}
              className="mt-1 w-full rounded-md border border-border-subtle bg-white px-2.5 py-1.5 text-[12px] focus:border-brand-purple focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
              Advisor
            </label>
            <select
              value={newAdvisor}
              onChange={(e) => {
                setNewAdvisor(e.target.value);
                updateNew(undefined, e.target.value);
              }}
              className="mt-1 w-full rounded-md border border-border-subtle bg-white px-2.5 py-1.5 text-[12px] focus:border-brand-purple focus:outline-none"
            >
              <option value="">Unassigned</option>
              {advisors.map((u) => (
                <option key={u.user_id} value={u.user_id}>
                  {u.display_name} ({u.role.replace("_", " ")})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
              Vehicle
            </label>
            <select
              value={newVehicle}
              onChange={(e) => {
                setNewVehicle(e.target.value);
                updateNew(undefined, undefined, e.target.value);
              }}
              className="mt-1 w-full rounded-md border border-border-subtle bg-white px-2.5 py-1.5 text-[12px] focus:border-brand-purple focus:outline-none"
              disabled={customerVehicles.length === 0}
            >
              <option value="">
                {customerVehicles.length === 0 ? "No vehicle on file" : "—"}
              </option>
              {customerVehicles.map((v) => (
                <option key={v.vehicle_id} value={v.vehicle_id}>
                  {v.year} {v.make} {v.model} · VIN ···{v.vin_suffix}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
