const e = (lead_uid, lane, event_type, timestamp, payload) => ({ lead_uid, lane, event_type, timestamp, payload });

export const mockEvents = [
  e("LD-1048", "NIL-MVA", "lead_created", "2026-09-30T14:02:00Z", { name: "Maya Johnson", phone: "+1 (310) 555-0148", source: "Google Search" }),
  e("LD-1048", "NIL-MVA", "page_visited", "2026-09-30T14:02:13Z", { page: "California Car Accident Help", path: "/ca/mva" }),
  e("LD-1048", "NIL-MVA", "quiz_answered", "2026-09-30T14:03:02Z", { question: "Were you injured in the accident?", answer: "Yes — neck and shoulder" }),
  e("LD-1048", "NIL-MVA", "quiz_answered", "2026-09-30T14:03:28Z", { question: "When did the accident happen?", answer: "Within the last 30 days" }),
  e("LD-1048", "NIL-MVA", "call_attempted", "2026-09-30T14:05:00Z", { outcome: "Connected", duration_seconds: 248 }),
  e("LD-1048", "NIL-MVA", "stage_changed", "2026-09-30T14:05:05Z", { stage: "Qualifying" }),
  e("LD-1048", "NIL-MVA", "qualification_completed", "2026-09-30T14:09:18Z", { qualified: true, consent: true, reason: "Injury, recent incident, represented by no other firm" }),
  e("LD-1048", "NIL-MVA", "stage_changed", "2026-09-30T14:09:20Z", { stage: "Qualified" }),
  e("LD-1048", "NIL-MVA", "transfer_updated", "2026-09-30T14:10:04Z", { status: "Warm transfer connected", destination: "West Coast Injury Law" }),
  e("LD-1048", "NIL-MVA", "stage_changed", "2026-09-30T14:10:06Z", { stage: "Transferred" }),

  e("LD-1047", "BTL-LA-abuse", "lead_created", "2026-09-30T13:18:00Z", { name: "Elena Ramirez", phone: "+1 (504) 555-0182", source: "Meta" }),
  e("LD-1047", "BTL-LA-abuse", "page_visited", "2026-09-30T13:18:09Z", { page: "Louisiana Survivor Support", path: "/la/support" }),
  e("LD-1047", "BTL-LA-abuse", "quiz_answered", "2026-09-30T13:19:42Z", { question: "Are you comfortable speaking with our intake team?", answer: "Not right now — text first" }),
  e("LD-1047", "BTL-LA-abuse", "sms_sent", "2026-09-30T13:21:00Z", { status: "Delivered", message: "Hi Elena, this is Sofia. We can continue by text whenever you're ready." }),
  e("LD-1047", "BTL-LA-abuse", "stage_changed", "2026-09-30T13:21:02Z", { stage: "Contacted" }),
  e("LD-1047", "BTL-LA-abuse", "next_action_scheduled", "2026-09-30T13:24:00Z", { action: "Send a gentle SMS check-in", scheduled_for: "2026-10-01T16:00:00Z" }),

  e("LD-1046", "BTL-CA-prison", "lead_created", "2026-09-30T11:54:00Z", { name: "Marcus Lee", phone: "+1 (916) 555-0133", source: "Organic" }),
  e("LD-1046", "BTL-CA-prison", "page_visited", "2026-09-30T11:54:11Z", { page: "California Civil Rights Review", path: "/ca/civil-rights" }),
  e("LD-1046", "BTL-CA-prison", "quiz_answered", "2026-09-30T11:55:37Z", { question: "Where did the incident occur?", answer: "County facility" }),
  e("LD-1046", "BTL-CA-prison", "call_attempted", "2026-09-30T12:02:00Z", { outcome: "Connected", duration_seconds: 391 }),
  e("LD-1046", "BTL-CA-prison", "qualification_completed", "2026-09-30T12:08:34Z", { qualified: false, consent: true, reason: "Incident is outside the applicable intake window" }),
  e("LD-1046", "BTL-CA-prison", "stage_changed", "2026-09-30T12:08:36Z", { stage: "Follow-up" }),
  e("LD-1046", "BTL-CA-prison", "next_action_scheduled", "2026-09-30T12:09:00Z", { action: "Sofia resource follow-up — do not route", scheduled_for: "2026-10-07T18:00:00Z" }),

  e("LD-1045", "BTL-rideshare", "lead_created", "2026-09-30T10:26:00Z", { name: "Jordan Williams", phone: "+1 (213) 555-0197", source: "TikTok" }),
  e("LD-1045", "BTL-rideshare", "page_visited", "2026-09-30T10:26:10Z", { page: "Rideshare Accident Check", path: "/rideshare/check" }),
  e("LD-1045", "BTL-rideshare", "quiz_answered", "2026-09-30T10:28:51Z", { question: "Were you a driver or passenger?", answer: "Passenger" }),
  e("LD-1045", "BTL-rideshare", "call_attempted", "2026-09-30T10:31:00Z", { outcome: "No answer", duration_seconds: 0 }),
  e("LD-1045", "BTL-rideshare", "sms_sent", "2026-09-30T10:31:19Z", { status: "Delivered", message: "Hi Jordan — Sofia here. I just tried to reach you about your rideshare inquiry." }),
  e("LD-1045", "BTL-rideshare", "stage_changed", "2026-09-30T10:31:21Z", { stage: "Working" }),
  e("LD-1045", "BTL-rideshare", "next_action_scheduled", "2026-09-30T10:32:00Z", { action: "Second call attempt", scheduled_for: "2026-09-30T19:30:00Z" }),

  e("LD-1044", "NIL-rideshare", "lead_created", "2026-09-30T09:03:00Z", { name: "Priya Patel", phone: "+1 (415) 555-0116", source: "Google Search" }),
  e("LD-1044", "NIL-rideshare", "page_visited", "2026-09-30T09:03:08Z", { page: "Rideshare Injury Options", path: "/rideshare/injury" }),
  e("LD-1044", "NIL-rideshare", "quiz_answered", "2026-09-30T09:04:22Z", { question: "Did you receive medical treatment?", answer: "Yes" }),
  e("LD-1044", "NIL-rideshare", "call_attempted", "2026-09-30T09:06:00Z", { outcome: "Connected", duration_seconds: 522 }),
  e("LD-1044", "NIL-rideshare", "qualification_completed", "2026-09-30T09:14:42Z", { qualified: true, consent: true, reason: "Treatment confirmed and incident meets criteria" }),
  e("LD-1044", "NIL-rideshare", "transfer_updated", "2026-09-30T09:16:00Z", { status: "Accepted", destination: "Partner firm" }),
  e("LD-1044", "NIL-rideshare", "stage_changed", "2026-09-30T09:16:02Z", { stage: "Converted" }),

  e("LD-1043", "NIL-MVA", "lead_created", "2026-09-29T22:42:00Z", { name: "Noah Thompson", phone: "+1 (702) 555-0155", source: "Direct" }),
  e("LD-1043", "NIL-MVA", "page_visited", "2026-09-29T22:42:07Z", { page: "Accident Help", path: "/mva" }),
  e("LD-1043", "NIL-MVA", "stage_changed", "2026-09-29T22:42:08Z", { stage: "New" }),
];
