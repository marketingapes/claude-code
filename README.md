# Email Retargeting & Traffic Recycling System

No visitor leaves without being trackable or retargetable.

## Files

| File | Purpose |
|---|---|
| `retargeting.js` | Drop-in script — email capture popup, GTM events, session tracking |
| `retargeting-plan.json` | Audience segments, messaging angles, sequences |
| `gtm-tags.json` | GTM trigger/tag config for Meta Pixel + GA4 |

## How it works

### 1. Soft Email Capture Popup
Triggers after user interaction (40% scroll or 2+ clicks). Shows a minimal popup with email input. Suppressed for 90 days after capture via cookie.

### 2. GTM Retargeting Events
Pushes to `dataLayer` automatically:
- **`view_content`** — after 3s dwell time
- **`scroll_50`** — when user scrolls past 50%
- **`affiliate_click`** — on any affiliate/CTA link click
- **`soft_capture_submit`** — on email form submission
- **`session_abandon`** — on page exit without conversion

### 3. Abandoned Visitor Tracking
Every session gets a unique ID stored in `sessionStorage`. On `beforeunload`, if no conversion event fired, a `session_abandon` event is pushed with full session context.

## Installation

Add to any page before `</body>`:

```html
<script src="retargeting.js"></script>
```

Then import `gtm-tags.json` triggers/tags into your GTM container.
