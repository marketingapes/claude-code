# Proposal: A Better System for Managing the Sofia Intake Assistants

**Status:** Proposal / RFC — nothing built yet
**Owner:** Marketing Apes (Best Tort Lawyers intake)
**Scope:** Sofia inbound + outbound Vapi voice assistants and their supporting tools
**Date:** 2026-07-22

---

## 1. Why this exists

Sofia (the Best Tort Lawyers / Phillips Law Group intake voice assistant) is currently
managed by editing prompts directly in the Vapi dashboard and by poking the Vapi API
through ad-hoc Zapier "raw request" calls. That approach has already produced concrete
problems:

- **No source of truth.** The assistant's behavior (a ~10k-character system prompt) lives
  only inside Vapi. There is no reviewable history, no diff, and no rollback.
- **Configuration drift between assistants.** Two near-duplicate assistants exist
  (`Sofia – BTL Outbound Callback v1` and `Sofia – BTL Pre-Qual → Phillips v2`) with
  independently copy-pasted prompts. Compliance-critical language (A.I. disclosure,
  consent gate, DNC handling) can diverge silently between them.
- **Unsafe manual edits.** During a recent optimization pass, a diagnostic probe
  temporarily set the live outbound `firstMessage` to a placeholder ("TEST PING"), and a
  separate, out-of-band dashboard edit changed it again — all with no record of who
  changed what or why. On a system that dials real accident leads, that is a real risk.
- **No pre-deploy testing.** There is no automated check that a prompt change still
  satisfies the required behaviors (identifies as A.I., confirms callback first, never
  fabricates lead data, honors the consent gate, respects DNC, transfers only in AZ
  hours, etc.) before it reaches production.
- **Fragile tooling.** Editing through the Zapier raw-request bridge requires manually
  escaping a giant JSON string, which is error-prone and not auditable.

The goal is not "a different API pipe." It is to treat Sofia as **config-as-code**: the
git repo becomes the source of truth, and Vapi becomes a deploy target that is updated
through a reviewed, tested, reversible pipeline.

---

## 2. Current state (as observed)

**Assistants**

| Name | ID | Framing | Voice |
|------|----|---------|-------|
| Sofia – BTL Outbound Callback v1 | `fce08c17-…` | Outbound FB-lead callback | 11labs `matilda` |
| Sofia – BTL Pre-Qual → Phillips v2 | `5ee926d7-…` | Inbound ("how can I help you today?") | 11labs custom `299hh…` |

**Shared across both**

- Model: OpenAI `gpt-4o`, temperature `0.3`
- The same 5 tool IDs (transferCall, book_callback, send_text_tool, ZapierMCP_Sofia, +1)
- Server webhook: a single Zapier catch hook
- `phoneNumberId`: `null` at the assistant level (numbers bound elsewhere)

**Outbound assistant also carries** (easy to lose in a careless full-object write):

- `voicemailMessage`, `endCallMessage`
- `transcriber`: Deepgram `nova-2`, `language: multi`
- `backgroundSound: office`
- `analysisPlan.structuredDataPlan` — a rich extraction schema already capturing
  `qualified`, `routing` (`phillips_send | btl_recycle | not_looking | dnc`),
  `sms_email_consent`, `has_attorney`, `case_type`, `caller_language`, sentiment, etc.
- `compliancePlan` (HIPAA/PCI/ZDR flags)

> The existence of `structuredDataPlan` is important: **the data needed to measure and
> optimize Sofia already exists on every call.** We are just not using it in a loop yet.

---

## 3. Proposed architecture

```
Source of truth:   git repo (this repo)
Prompt authoring:  markdown partials  ──►  composed build  ──►  assistant JSON
Deploy:            vapi-sync  (Vapi REST API; Vapi MCP for interactive edits)
Safety gate:       test harness (LLM-judge over the 10 scenarios) in CI
Optimize loop:     nightly pull of transcripts + structuredData  ──►  KPI scorecard
```

### Tier 1 — Config-as-code + safe deploy (foundation)

- `vapi/assistants/sofia-outbound.json`, `sofia-inbound.json` — full configs in git.
- A small `vapi-sync` CLI (Node or Python) with:
  - `pull <assistant>` → GET from Vapi, write file (instant backup; changes show as git diffs).
  - `push <assistant> [--dry-run]` → **partial** PATCH from file (only intended fields),
    dry-run prints the diff first.
- **Partial-by-default writes.** Only send the fields being changed (e.g. `firstMessage`
  and `model`), and when sending a nested object like `model`, include all of its existing
  sub-fields so nothing (toolIds, temperature) is dropped. Never blind-overwrite the whole
  assistant.
- Outcome: every change is a reviewable diff with full history and one-command rollback.

### Tier 2 — Shared prompt modules (kills drift)

- Break the monolithic prompt into partials:
  `_identity.md`, `_transparency.md`, `_missing-data.md`, `_consent-gate.md`,
  `_transfer.md`, `_callback-booking.md`, `_dnc.md`, `_non-plg-flow.md`, `_style.md`,
  `_legal-limits.md`, `_bilingual.md`, `_tool-safety.md`.
- Compose outbound vs inbound from the **same** blocks with a thin per-assistant header.
- Compliance-critical language (SB 37 / TCPA-relevant disclosures, consent, DNC) lives in
  one place and updates everywhere at once — no more divergence between v1 and v2.

### Tier 3 — Test + eval harness (where "best intake" actually comes from)

- Encode the 10 acceptance scenarios as fixtures (complete FB lead, missing form answers,
  missing first name, denies request, qualified in-hours, qualified out-of-hours, failed
  transfer, Spanish caller, already-has-attorney, STOP request).
- Before any `push`, run them through an **LLM-judge** (or Vapi's native test-suite) that
  asserts the required behaviors. Deploy blocks on any failed assertion.
- Close the loop with real calls: nightly, pull transcripts + `structuredDataPlan` output
  and score KPIs:
  - callback-confirmation rate
  - consent-gate consent rate
  - transfer connect / failure rate
  - DNC compliance (must be 100%)
  - qualified-lead rate, Spanish-handling rate
  - "placeholder spoken" incidents (should be zero)
- Those numbers drive the next prompt change — a continuous optimization engine, not a
  one-time rewrite.

---

## 4. Guardrails baked in (non-negotiables)

These come straight from the intake requirements and must survive every deploy:

1. Sofia always identifies as an A.I.
2. Confirms identity, then confirms the callback was requested — **before** any case talk.
3. Never claims to have lead/form data that was not actually passed into the call.
4. Uses available FB lead data without re-asking answered questions; falls back gracefully
   when data is missing.
5. Consent gate before sharing info or transferring; Phillips Law Group named only at the
   consent gate / connect line / post-consent callback.
6. Transfers only 6:00am–5:00pm Arizona time; otherwise book a callback.
7. DNC / STOP handled immediately, sends nothing.
8. **Tool safety:** preserve `transferCall`, `book_callback`, `send_text_tool`,
   `ZapierMCP_Sofia` (email-only) and their IDs; never delete/recreate tools, phone
   bindings, webhooks, or the structuredData/compliance plans on a write.

---

## 5. How this maps to today's tools

- **Vapi MCP server** (`https://mcp.vapi.ai/mcp`, bearer auth): the clean *interactive*
  front door — replaces the Zapier raw-request escaping for one-off edits. Worth wiring
  up, but it is not the system by itself.
- **Zapier**: keep for what it is good at — the lead → call trigger and the
  send_text / email actions. Stop using it as the config-editing path.
- **This repo + CI**: the system of record and the safety gate.

---

## 6. Rollout plan (when approved)

1. **Tier 1**: scaffold `vapi/` config-as-code + `vapi-sync` (pull both assistants, build
   `push --dry-run`). Immediately gives backup + rollback and ends unsafe manual edits.
2. **Tier 2**: refactor the prompt into shared partials; reconcile v1/v2 so they share
   compliance language.
3. **Tier 3**: add the 10-scenario test gate, then the nightly KPI scorecard.
4. Optionally, a lightweight internal dashboard over the KPI data.

Estimated effort: Tier 1 ≈ half a day; Tier 2 ≈ half a day; Tier 3 ≈ 1–2 days.

---

## 7. Open questions

- Which assistant is the true production outbound path today (v1 vs v2), and should they be
  consolidated to one composed-from-partials definition?
- Where should the Vapi private key live for CI (environment secret vs. manual-only pushes)?
- Use Vapi's native test-suite feature or an independent LLM-judge (or both)?
- Do we want a Slack notification on every deploy / KPI regression?

---

*This document proposes an approach only. No code, tooling, or Vapi configuration has been
created or changed as part of it.*
