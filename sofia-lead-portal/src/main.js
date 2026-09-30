import "./styles.css";
import { LANES, groupLeads } from "./domain.js";
import { mockEvents } from "./mock-data.js";

const leads = groupLeads(mockEvents);
const app = document.querySelector("#app");
const state = { search: "", lane: "All lanes", stage: "All stages", selected: null };

const icons = {
  lead_created: "person_add",
  page_visited: "language",
  quiz_answered: "quiz",
  call_attempted: "call",
  sms_sent: "chat_bubble",
  qualification_completed: "fact_check",
  transfer_updated: "swap_horiz",
  stage_changed: "timeline",
  next_action_scheduled: "event",
};

const labels = {
  lead_created: "Lead captured",
  page_visited: "Landing page visited",
  quiz_answered: "Quiz response",
  call_attempted: "Call attempt",
  sms_sent: "SMS sent",
  qualification_completed: "Qualification result",
  transfer_updated: "Transfer update",
  stage_changed: "Stage changed",
  next_action_scheduled: "Next action scheduled",
};

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" })[char]);
}

const fmtTime = (iso) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(new Date(iso));
const relativeTime = (iso) => {
  const minutes = Math.round((new Date("2026-09-30T14:20:00Z") - new Date(iso)) / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / 1440)}d ago`;
};

function eventDetail(event) {
  const p = event.payload;
  switch (event.event_type) {
    case "lead_created": return `${p.source} · ${p.phone}`;
    case "page_visited": return `${p.page} · ${p.path}`;
    case "quiz_answered": return `<strong>${escapeHtml(p.question)}</strong><span>${escapeHtml(p.answer)}</span>`;
    case "call_attempted": return `${p.outcome}${p.duration_seconds ? ` · ${Math.floor(p.duration_seconds / 60)}m ${p.duration_seconds % 60}s` : ""}`;
    case "sms_sent": return `<strong>${p.status}</strong><span>“${escapeHtml(p.message)}”</span>`;
    case "qualification_completed": return `<strong class="${p.qualified ? "positive" : "negative"}">${p.qualified ? "Qualified" : "Not qualified"} · ${p.consent ? "Consent received" : "No consent"}</strong><span>${escapeHtml(p.reason)}</span>`;
    case "transfer_updated": return `<strong>${escapeHtml(p.status)}</strong><span>${escapeHtml(p.destination)}</span>`;
    case "stage_changed": return `Moved to ${p.stage}`;
    case "next_action_scheduled": return `<strong>${escapeHtml(p.action)}</strong><span>${fmtTime(p.scheduled_for)} UTC</span>`;
    default: return JSON.stringify(p);
  }
}

function filteredLeads() {
  const term = state.search.toLowerCase();
  return leads.filter((lead) =>
    (!term || `${lead.name} ${lead.phone} ${lead.lead_uid}`.toLowerCase().includes(term)) &&
    (state.lane === "All lanes" || lead.lane === state.lane) &&
    (state.stage === "All stages" || lead.stage === state.stage)
  );
}

function metric(label, value, note, tone = "") {
  return `<article class="metric ${tone}"><div class="metric-label">${label}<span class="material-symbols-rounded">${tone === "success" ? "trending_up" : tone === "warn" ? "schedule" : "monitoring"}</span></div><strong>${value}</strong><small>${note}</small></article>`;
}

function render() {
  const visible = filteredLeads();
  const selected = state.selected ? leads.find((lead) => lead.lead_uid === state.selected) : null;
  app.innerHTML = `
    <header class="topbar">
      <a class="brand" href="#" aria-label="Sofia home"><span class="brand-mark"><i></i><i></i><i></i></span><span>Sofia</span></a>
      <div class="top-actions"><span class="live"><i></i>Live operations</span><button class="icon-button" aria-label="Notifications"><span class="material-symbols-rounded">notifications</span><b>3</b></button><div class="avatar">AM</div></div>
    </header>
    <div class="layout">
      <aside>
        <nav><a class="active" href="#"><span class="material-symbols-rounded">space_dashboard</span>Lead overview</a><a href="#"><span class="material-symbols-rounded">route</span>Routing</a><a href="#"><span class="material-symbols-rounded">analytics</span>Performance</a></nav>
        <div class="aside-foot"><div class="sofia-status"><span class="material-symbols-rounded">smart_toy</span><div><strong>Sofia is online</strong><small>Handling 4 conversations</small></div></div><a href="#"><span class="material-symbols-rounded">settings</span>Settings</a></div>
      </aside>
      <main>
        <div class="heading"><div><p class="eyebrow">Operations dashboard</p><h1>Lead progress</h1><p>Follow every lead from first click to final outcome.</p></div><button class="primary" id="export"><span class="material-symbols-rounded">download</span>Export view</button></div>
        <section class="metrics">
          ${metric("Active leads", leads.filter((l) => !["Converted", "Turned Down"].includes(l.stage)).length, "Across all five lanes")}
          ${metric("Qualified today", leads.filter((l) => ["Qualified", "Transferred", "Converted"].includes(l.stage)).length, "+18% from yesterday", "success")}
          ${metric("Awaiting action", leads.filter((l) => l.events.some((e) => e.event_type === "next_action_scheduled")).length, "Next 24 hours", "warn")}
          ${metric("Conversion rate", "24.8%", "7-day rolling average", "success")}
        </section>
        <section class="panel">
          <div class="panel-head"><div><h2>All leads</h2><span>${visible.length} of ${leads.length} records</span></div><div class="filters">
            <label class="search"><span class="material-symbols-rounded">search</span><input id="search" value="${escapeHtml(state.search)}" placeholder="Search leads" /></label>
            <select id="lane" aria-label="Filter by lane"><option>All lanes</option>${LANES.map((lane) => `<option ${state.lane === lane ? "selected" : ""}>${lane}</option>`).join("")}</select>
            <select id="stage" aria-label="Filter by stage"><option>All stages</option>${[...new Set(leads.map((l) => l.stage))].map((stage) => `<option ${state.stage === stage ? "selected" : ""}>${stage}</option>`).join("")}</select>
          </div></div>
          <div class="table-wrap"><table><thead><tr><th>Lead</th><th>Lane</th><th>Stage</th><th>Routing</th><th>Last event</th><th></th></tr></thead><tbody>
            ${visible.map((lead) => `<tr data-lead="${lead.lead_uid}" tabindex="0"><td><div class="lead"><div class="lead-avatar">${lead.name.split(" ").map((n) => n[0]).join("")}</div><div><strong>${lead.name}</strong><small>${lead.phone} · ${lead.lead_uid}</small></div></div></td><td><span class="lane">${lead.lane}</span></td><td><span class="stage stage-${lead.stage.toLowerCase().replace(" ", "-")}"><i></i>${lead.stage}</span></td><td><span class="route route-${lead.routing.status}"><span class="material-symbols-rounded">${lead.routing.status === "routed" ? "check_circle" : lead.routing.status === "follow-up" ? "replay" : "hourglass_top"}</span>${lead.routing.label}</span></td><td><strong class="last-event">${labels[lead.lastEvent.event_type]}</strong><small>${relativeTime(lead.lastEvent.timestamp)}</small></td><td><button class="row-button" aria-label="Open ${lead.name}"><span class="material-symbols-rounded">chevron_right</span></button></td></tr>`).join("") || `<tr><td colspan="6" class="empty">No leads match these filters.</td></tr>`}
          </tbody></table></div>
        </section>
        <p class="data-note"><span class="material-symbols-rounded">science</span>Demo environment · All lead and activity data shown is realistic mock data</p>
      </main>
    </div>
    ${selected ? renderDrawer(selected) : ""}`;
  bindEvents();
}

function renderDrawer(lead) {
  return `<div class="scrim" id="scrim"></div><aside class="drawer" aria-label="Lead details">
    <div class="drawer-head"><div><span class="lane">${lead.lane}</span><h2>${lead.name}</h2><p>${lead.phone} · ${lead.lead_uid}</p></div><button class="close" id="close" aria-label="Close"><span class="material-symbols-rounded">close</span></button></div>
    <div class="drawer-summary"><div><small>Current stage</small><span class="stage stage-${lead.stage.toLowerCase().replace(" ", "-")}"><i></i>${lead.stage}</span></div><div><small>Routing status</small><span class="route route-${lead.routing.status}">${lead.routing.label}</span></div></div>
    ${lead.routing.status === "follow-up" ? `<div class="guardrail"><span class="material-symbols-rounded">shield</span><div><strong>Routing guardrail active</strong><p>This lead will remain with Sofia and will never be sent to a law firm unless qualification and consent are both confirmed.</p></div></div>` : ""}
    <div class="timeline-head"><div><h3>Lead timeline</h3><p>What the lead saw and what Sofia did</p></div><span>${lead.events.length} events</span></div>
    <div class="timeline">${[...lead.events].reverse().map((event) => `<article class="event event-${event.event_type}"><div class="event-icon"><span class="material-symbols-rounded">${icons[event.event_type]}</span></div><div class="event-body"><div class="event-title"><strong>${labels[event.event_type]}</strong><time>${fmtTime(event.timestamp)}</time></div><div class="event-detail">${eventDetail(event)}</div><span class="actor">${["page_visited", "quiz_answered", "lead_created"].includes(event.event_type) ? "LEAD ACTIVITY" : "SOFIA ACTIVITY"}</span></div></article>`).join("")}</div>
  </aside>`;
}

function bindEvents() {
  document.querySelector("#search")?.addEventListener("input", (event) => { state.search = event.target.value; render(); document.querySelector("#search")?.focus(); });
  document.querySelector("#lane")?.addEventListener("change", (event) => { state.lane = event.target.value; render(); });
  document.querySelector("#stage")?.addEventListener("change", (event) => { state.stage = event.target.value; render(); });
  document.querySelectorAll("tr[data-lead]").forEach((row) => {
    const open = () => { state.selected = row.dataset.lead; render(); };
    row.addEventListener("click", open);
    row.addEventListener("keydown", (event) => { if (event.key === "Enter") open(); });
  });
  [document.querySelector("#close"), document.querySelector("#scrim")].forEach((el) => el?.addEventListener("click", () => { state.selected = null; render(); }));
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && state.selected) { state.selected = null; render(); } }, { once: true });
  document.querySelector("#export")?.addEventListener("click", () => alert("Demo export ready — connect this action to BigQuery in production."));
}

render();
