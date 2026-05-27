/**
 * Mock data store with in-memory mutability for the prototype.
 *
 * Engineers wiring backend: replace these getters with API calls. The TS shapes
 * are 1:1 with the §10 entities in the PRD.
 */
import {
  ACTION_ITEMS,
  CUSTOMER_DETAILS,
  VEHICLES,
  APPOINTMENTS,
  CONVERSATIONS,
  USERS,
  INTENT_TAXONOMY,
  CURRENT_USER_ID,
  NOW_ISO,
  type ActionItem,
  type ActionItemStatus,
  type CustomerProfile,
  type IntentId,
  type IntentMeta,
  type ResolutionType,
  type User,
  type Conversation,
  type CustomerDetails,
  type Vehicle,
  type Appointment,
} from "@test-data";

// In-memory mutable appointment copy — supports create-new flow from CloseDrawer
let _appointments: Appointment[] = [...APPOINTMENTS];

// Re-export NOW_ISO so components can reference the prototype's fixed clock.
export { NOW_ISO, CURRENT_USER_ID };

// In-memory mutable copy (resets on hard refresh — perfect for prototype).
let _items: ActionItem[] = [...ACTION_ITEMS];

// Subscribers for re-rendering on mutations
const _listeners = new Set<() => void>();
function _notify() {
  _listeners.forEach((fn) => fn());
}
export function subscribe(fn: () => void): () => void {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}

// =========================================================================
// READERS
// =========================================================================

export function getActionItems(status?: ActionItemStatus): ActionItem[] {
  return status ? _items.filter((i) => i.status === status) : [..._items];
}

export function getActionItem(id: string): ActionItem | undefined {
  return _items.find((i) => i.action_item_id === id);
}

export function getAppointmentsForCustomer(customerId: string): Appointment[] {
  return _appointments.filter((a) => a.customer_id === customerId);
}

export function getActionItemsForCustomer(customerId: string): ActionItem[] {
  return _items.filter((i) => i.customer_id === customerId);
}

export function getPendingForCustomer(customerId: string): ActionItem[] {
  return _items.filter(
    (i) => i.customer_id === customerId && i.status === "pending"
  );
}

export function getCustomerDetails(id: string): CustomerDetails | undefined {
  return CUSTOMER_DETAILS.find((c) => c.customer_id === id);
}

export function getCustomerProfile(id: string): CustomerProfile | undefined {
  const details = getCustomerDetails(id);
  if (!details) return undefined;
  return {
    details,
    vehicles: VEHICLES.filter((v) => v.customer_id === id),
    conversations: CONVERSATIONS.filter((c) => c.customer_id === id),
    action_items: getActionItemsForCustomer(id),
    appointments: _appointments.filter((a) => a.customer_id === id),
  };
}

export function getConversation(id: string): Conversation | undefined {
  return CONVERSATIONS.find((c) => c.conversation_id === id);
}

export function getUser(id: string | undefined): User | undefined {
  if (!id) return undefined;
  return USERS.find((u) => u.user_id === id);
}

export function listUsers(): User[] {
  return USERS;
}

export function getIntent(id: IntentId): IntentMeta {
  return INTENT_TAXONOMY[id];
}

export function getAllCustomers(): CustomerDetails[] {
  return CUSTOMER_DETAILS;
}

export function getVehicle(id: string | undefined): Vehicle | undefined {
  if (!id) return undefined;
  return VEHICLES.find((v) => v.vehicle_id === id);
}

export function getAppointment(id: string | undefined): Appointment | undefined {
  if (!id) return undefined;
  return APPOINTMENTS.find((a) => a.appointment_id === id);
}

// =========================================================================
// MUTATIONS — emit §10.2 events (logged to console for the prototype;
// engineers would publish to the shared event bus instead)
// =========================================================================

function _emit(event: string, payload: Record<string, unknown>) {
  // In production: push to event bus. Here: just console-log for the prototype.
  // eslint-disable-next-line no-console
  console.log(`[event] ${event}`, payload);
}

export function assignActionItem(
  actionItemId: string,
  assigneeUserId: string,
  assignedByUserId: string = CURRENT_USER_ID,
  reason?: string,
  viniInstructions?: string
) {
  const item = _items.find((i) => i.action_item_id === actionItemId);
  if (!item) return;

  // Vini-as-assignee requires explicit instructions (note-taker rule)
  if (assigneeUserId === "vini_agent") {
    if (!viniInstructions || viniInstructions.trim().length < 10) {
      throw new Error(
        "Vini-as-assignee requires instructions of at least 10 characters — describe what Vini should do for this item."
      );
    }
    item.vini_instructions = viniInstructions.trim();
  } else {
    // Clear instructions when reassigning away from Vini
    item.vini_instructions = undefined;
  }

  const wasAssigned = !!item.assignee_user_id;
  const fromUserId = item.assignee_user_id;

  item.assignee_user_id = assigneeUserId;
  item.assigned_at = NOW_ISO;
  item.assigned_by_user_id = assignedByUserId;

  if (wasAssigned && fromUserId !== assigneeUserId) {
    _emit("action_item.reassigned", {
      action_item_id: actionItemId,
      from_user_id: fromUserId,
      to_user_id: assigneeUserId,
      reassigned_at: NOW_ISO,
      reason: reason ?? "",
      vini_instructions: item.vini_instructions ?? null,
    });
  } else {
    _emit("action_item.assigned", {
      action_item_id: actionItemId,
      assignee_user_id: assigneeUserId,
      assigned_by_user_id: assignedByUserId,
      assigned_at: NOW_ISO,
      vini_instructions: item.vini_instructions ?? null,
    });
  }
  _notify();
}

export type AppointmentInput =
  | { kind: "existing"; appointment_id: string }
  | {
      kind: "new";
      scheduled_at: string; // ISO
      advisor_user_id?: string;
      vehicle_id?: string;
    };

export function closeActionItem(
  actionItemId: string,
  resolutionType: ResolutionType,
  resolutionNote: string,
  closedByUserId: string = CURRENT_USER_ID,
  appointment?: AppointmentInput
) {
  if (!resolutionNote || resolutionNote.length < 10) {
    throw new Error(
      "resolution_note must be at least 10 characters (API enforces non-empty notes — §10.2)"
    );
  }

  const item = _items.find((i) => i.action_item_id === actionItemId);
  if (!item) return;

  if (resolutionType === "appointment_booked" && !appointment) {
    throw new Error(
      "Closing with resolution_type=appointment_booked requires linking an appointment (create new or pick existing)."
    );
  }

  // Handle the appointment link/create
  let appointmentId: string | undefined;
  if (appointment) {
    if (appointment.kind === "existing") {
      const existing = _appointments.find(
        (a) => a.appointment_id === appointment.appointment_id
      );
      if (existing) {
        existing.source_action_item_id = actionItemId;
        appointmentId = existing.appointment_id;
      }
    } else {
      const id = `appt-new-${Date.now().toString(36)}`;
      const created: Appointment = {
        appointment_id: id,
        customer_id: item.customer_id,
        scheduled_at: appointment.scheduled_at,
        status: "scheduled",
        source_action_item_id: actionItemId,
        advisor_user_id: appointment.advisor_user_id,
        vehicle_id: appointment.vehicle_id,
      };
      _appointments.push(created);
      appointmentId = id;
      _emit("appointment.created", {
        appointment_id: id,
        customer_id: item.customer_id,
        source_action_item_id: actionItemId,
        scheduled_at: appointment.scheduled_at,
      });
    }
  }

  item.status = "completed";
  item.closed_at = NOW_ISO;
  item.closed_by_user_id = closedByUserId;
  item.resolution_type = resolutionType;
  item.resolution_note = resolutionNote;
  if (appointmentId) {
    item.closed_with_appointment_id = appointmentId;
  }

  _emit("action_item.closed", {
    action_item_id: actionItemId,
    closed_by_user_id: closedByUserId,
    closed_at: NOW_ISO,
    resolution_note: resolutionNote,
    resolution_type: resolutionType,
    closed_with_appointment_id: appointmentId ?? null,
  });
  _notify();
}

export function reopenActionItem(
  actionItemId: string,
  reason: string,
  reopenedByUserId: string = CURRENT_USER_ID
) {
  const item = _items.find((i) => i.action_item_id === actionItemId);
  if (!item) return;

  item.status = "pending";
  item.closed_at = undefined;
  item.closed_by_user_id = undefined;

  _emit("action_item.reopened", {
    action_item_id: actionItemId,
    reopened_by_user_id: reopenedByUserId,
    reopened_at: NOW_ISO,
    reason,
  });
  _notify();
}

export function escalateActionItem(
  actionItemId: string,
  reason: "aged_past_sla" | "repeat_caller_threshold" | "compliance_flagged"
) {
  const item = _items.find((i) => i.action_item_id === actionItemId);
  if (!item) return;

  item.escalation_reason = reason;
  item.escalated_at = NOW_ISO;

  _emit("action_item.escalated", {
    action_item_id: actionItemId,
    escalation_reason: reason,
    escalated_at: NOW_ISO,
  });
  _notify();
}
