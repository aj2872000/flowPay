import React, { useState } from "react";
import { DUMMY_EVENTS } from "../data/index";
import Badge from "../components/Badge";

function Events() {
  const [expanded, setExpanded] = useState(null);
  const [typeFilter, setTypeFilter] = useState("all");

  const types = ["all", ...Array.from(new Set(DUMMY_EVENTS.map(e => e.type)))];
  const filtered = DUMMY_EVENTS.filter(e => typeFilter === "all" || e.type === typeFilter);

  const iconMap = { "payment.succeeded": { bg: "var(--green-bg)", c: "var(--green)", i: "✓" }, "payment.failed": { bg: "var(--red-bg)", c: "var(--red)", i: "✗" }, "subscription.created": { bg: "var(--accent-glow)", c: "var(--accent)", i: "+" }, "subscription.canceled": { bg: "var(--surface2)", c: "var(--text3)", i: "−" }, "webhook.failed": { bg: "var(--red-bg)", c: "var(--red)", i: "⚠" }, "payment.retry_scheduled": { bg: "var(--yellow-bg)", c: "var(--yellow)", i: "↻" }, "subscription.trial_ending": { bg: "var(--yellow-bg)", c: "var(--yellow)", i: "⏰" } };

  return (
    <div>
      <div className="toolbar">
        <select className="filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          {types.map(t => <option key={t} value={t}>{t === "all" ? "All Events" : t}</option>)}
        </select>
        <span className="mono text-muted" style={{ marginLeft: "auto" }}>{filtered.length} events</span>
      </div>

      <div className="card">
        {filtered.map(e => {
          const cfg = iconMap[e.type] || { bg: "var(--surface2)", c: "var(--text3)", i: "·" };
          const open = expanded === e.id;
          return (
            <div key={e.id} className="event-row" style={{ flexDirection: "column", cursor: "pointer" }} onClick={() => setExpanded(open ? null : e.id)}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div className="event-icon-wrap" style={{ background: cfg.bg, color: cfg.c }}>{cfg.i}</div>
                <div style={{ flex: 1 }}>
                  <div className="flex items-center justify-between">
                    <span className="event-type" style={{ color: cfg.c }}>{e.type}</span>
                    <div className="flex items-center gap-8">
                      <Badge status={e.status} />
                      <span className="text-muted" style={{ fontSize: 12 }}>{open ? "▲" : "▼"}</span>
                    </div>
                  </div>
                  <div className="event-meta">{e.service} · {new Date(e.timestamp).toLocaleString()} · <span className="mono">{e.id}</span></div>
                </div>
              </div>
              {open && (
                <div style={{ paddingLeft: 46, marginTop: 8 }}>
                  <div className="text-muted text-sm mb-4">Payload</div>
                  <div className="event-payload">{JSON.stringify(JSON.parse(e.payload), null, 2)}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Events;