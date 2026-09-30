export const LANES = [
  "NIL-MVA",
  "BTL-LA-abuse",
  "BTL-CA-prison",
  "BTL-rideshare",
  "NIL-rideshare",
];

export const STAGES = [
  "New",
  "Contacted",
  "Qualifying",
  "Qualified",
  "Transferred",
  "Converted",
  "Working",
  "Turned Down",
  "Follow-up",
];

export const EVENT_TYPES = [
  "lead_created",
  "page_visited",
  "quiz_answered",
  "call_attempted",
  "sms_sent",
  "qualification_completed",
  "transfer_updated",
  "stage_changed",
  "next_action_scheduled",
];

export function shouldRouteToFirm({ qualified, consent }) {
  return qualified === true && consent === true;
}

export function routingDecision(events) {
  const qualification = [...events].reverse().find((event) => event.event_type === "qualification_completed");
  if (!qualification) return { status: "pending", label: "Qualification pending" };
  if (shouldRouteToFirm(qualification.payload)) {
    return { status: "routed", label: "Eligible for firm routing" };
  }
  return {
    status: "follow-up",
    label: qualification.payload.qualified ? "Consent follow-up" : "Sofia follow-up only",
  };
}

export function latestStage(events) {
  return [...events].reverse().find((event) => event.event_type === "stage_changed")?.payload.stage ?? "New";
}

export function latestEvent(events) {
  return [...events].sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];
}

export function groupLeads(events) {
  const grouped = new Map();
  for (const event of events) {
    if (!grouped.has(event.lead_uid)) grouped.set(event.lead_uid, []);
    grouped.get(event.lead_uid).push(event);
  }

  return [...grouped.entries()].map(([lead_uid, leadEvents]) => {
    leadEvents.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    const created = leadEvents.find((event) => event.event_type === "lead_created");
    return {
      lead_uid,
      name: created?.payload.name ?? "Unknown lead",
      phone: created?.payload.phone ?? "—",
      lane: created?.lane ?? leadEvents[0].lane,
      stage: latestStage(leadEvents),
      lastEvent: latestEvent(leadEvents),
      events: leadEvents,
      routing: routingDecision(leadEvents),
    };
  }).sort((a, b) => b.lastEvent.timestamp.localeCompare(a.lastEvent.timestamp));
}
