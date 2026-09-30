import test from "node:test";
import assert from "node:assert/strict";
import { groupLeads, shouldRouteToFirm } from "./domain.js";
import { mockEvents } from "./mock-data.js";

test("routes only qualified leads with consent", () => {
  assert.equal(shouldRouteToFirm({ qualified: true, consent: true }), true);
  assert.equal(shouldRouteToFirm({ qualified: true, consent: false }), false);
  assert.equal(shouldRouteToFirm({ qualified: false, consent: true }), false);
});

test("keeps an unqualified lead in Sofia follow-up", () => {
  const marcus = groupLeads(mockEvents).find((lead) => lead.lead_uid === "LD-1046");
  assert.equal(marcus.stage, "Follow-up");
  assert.deepEqual(marcus.routing, { status: "follow-up", label: "Sofia follow-up only" });
});

test("builds one record per lead with its latest event", () => {
  const leads = groupLeads(mockEvents);
  assert.equal(leads.length, 6);
  assert.equal(leads[0].lead_uid, "LD-1048");
  assert.equal(leads[0].lastEvent.event_type, "stage_changed");
});
