# Sofia Lead Portal

A self-contained, demo-ready lead operations dashboard for tracking a lead from first landing-page visit through Sofia's intake, qualification, routing, and final outcome.

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:5173`. The project has no install-time dependencies. For a static production build, run `npm run build`; for domain tests, run `npm test`.

## What is included

- One sortable-by-recency row per lead with name, phone, intake lane, current stage, routing state, and latest event.
- Search plus lane and stage filters covering `NIL-MVA`, `BTL-LA-abuse`, `BTL-CA-prison`, `BTL-rideshare`, and `NIL-rideshare`.
- A detailed per-lead timeline separating lead activity (landing-page visits and quiz answers) from Sofia activity (calls, SMS, qualification, transfers, stage changes, and next actions).
- A visible routing guardrail: only a lead with both `qualified: true` and `consent: true` is eligible for firm routing. An unqualified lead remains in Sofia's follow-up queue and is never routed.
- Responsive desktop styling, keyboard-accessible rows, and an Escape-to-close detail drawer.

## Mock versus real

### Mock in this scaffold

- Every lead, phone number, timestamp, firm name, intake answer, activity event, and KPI is fictional demo data from `src/mock-data.js`.
- “Live operations,” notifications, Sofia availability, conversion rate, and active-conversation counts are presentational.
- Export displays a demo message; it does not download or transmit data.
- There are no API calls, authentication, persistence, analytics, or BigQuery credentials.

### Real application behavior

- Timeline aggregation, latest-event selection, current-stage derivation, filters, and search run against the event collection.
- The routing predicate in `src/domain.js` is executable and tested. It returns true **only** when qualification and consent are explicitly true.
- The UI is a dependency-free browser application and its production directory can be deployed as static assets once connected to an approved data/API layer.

## Event schema and future BigQuery mapping

The UI consumes an append-only event stream. Each event has this stable envelope:

```js
{
  lead_uid: "LD-1048",                // STRING, required
  lane: "NIL-MVA",                    // STRING, required
  event_type: "qualification_completed", // STRING, required
  timestamp: "2026-09-30T14:09:18Z", // TIMESTAMP, required
  payload: { qualified: true, consent: true, reason: "..." } // JSON, required
}
```

Recommended BigQuery table:

| UI field | BigQuery type | Mode | Notes |
| --- | --- | --- | --- |
| `lead_uid` | `STRING` | `REQUIRED` | Stable lead identifier; cluster key candidate |
| `lane` | `STRING` | `REQUIRED` | One of the five configured lanes |
| `event_type` | `STRING` | `REQUIRED` | Event vocabulary defined in `src/domain.js` |
| `timestamp` | `TIMESTAMP` | `REQUIRED` | Partition the table by `DATE(timestamp)` |
| `payload` | `JSON` | `REQUIRED` | Event-specific details; keep sensitive access controlled |

In production, replace the `mockEvents` import in `src/main.js` with a server-side API response backed by a parameterized BigQuery query. Do not expose BigQuery credentials in the browser. The API should return this same envelope, ordered by timestamp, so the present grouping and timeline logic can remain unchanged.

### Payload contracts

- `lead_created`: `name`, `phone`, `source`
- `page_visited`: `page`, `path`
- `quiz_answered`: `question`, `answer`
- `call_attempted`: `outcome`, `duration_seconds`
- `sms_sent`: `status`, `message`
- `qualification_completed`: `qualified`, `consent`, `reason`
- `transfer_updated`: `status`, `destination`
- `stage_changed`: `stage`
- `next_action_scheduled`: `action`, `scheduled_for`

For production, validate payloads at ingestion, restrict lane/stage/event values, define retention and PII policies, and add a unique event ID to support idempotent streaming inserts.
