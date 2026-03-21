import { useState, useCallback } from "react";
import Badge      from "../../components/common/Badge/Badge";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import Button     from "../../components/common/Button/Button";
import { useApi } from "../../hooks/useApi";
import { eventApi } from "../../api/event.api";
import { EVENT_ICON_MAP } from "../../utils/helpers";
import "./Events.css";

const EVENT_TYPES = [
  "all",
  "payment.succeeded",
  "payment.failed",
  "payment.retry_scheduled",
  "subscription.created",
  "subscription.canceled",
  "subscription.trial_ending",
  "webhook.failed",
  "webhook.test",
];

export default function Events() {
  const [expanded,   setExpanded]   = useState(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const [page,       setPage]       = useState(1);
  const LIMIT = 20;

  const { data, loading, error, refetch } = useApi(
    useCallback(
      () => eventApi.listEvents({
        ...(typeFilter !== "all" ? { type: typeFilter } : {}),
        page,
        limit: LIMIT,
      }),
      [typeFilter, page]
    )
  );

  const events    = data?.data  || [];
  const total     = data?.total || 0;
  const totalPages = Math.ceil(total / LIMIT);

  const handleTypeChange = (val) => { setTypeFilter(val); setPage(1); };

  return (
    <div>
      <div className="toolbar">
        <select className="filter-select" value={typeFilter} onChange={(e) => handleTypeChange(e.target.value)}>
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>{t === "all" ? "All Event Types" : t}</option>
          ))}
        </select>
        <Button variant="ghost" onClick={refetch}>↻ Refresh</Button>
        <span className="mono text-muted events__count">{loading ? "…" : `${total} events`}</span>
      </div>

      {error && <div className="api-error">{error}</div>}

      <div className="card">
        {loading ? (
          <div className="table-loading">Loading events…</div>
        ) : events.length === 0 ? (
          <EmptyState icon="⚡" text="No events found" />
        ) : events.map((e) => {
          const cfg  = EVENT_ICON_MAP[e.type] || { bg: "var(--surface2)", color: "var(--text3)", icon: "·" };
          const open = expanded === e._id;

          return (
            <div key={e._id} className="events__row" onClick={() => setExpanded(open ? null : e._id)}>
              <div className="events__row-main">
                <div className="events__icon" style={{ background: cfg.bg, color: cfg.color }}>
                  {cfg.icon}
                </div>
                <div className="events__body">
                  <div className="flex items-center justify-between">
                    <span className="events__type" style={{ color: cfg.color }}>{e.type}</span>
                    <div className="flex items-center gap-8">
                      <Badge status={e.status} />
                      <span className="text-muted events__chevron">{open ? "▲" : "▼"}</span>
                    </div>
                  </div>
                  <div className="events__meta">
                    {e.service} · {new Date(e.createdAt).toLocaleString()} · <span className="mono">{e._id?.slice(-8)}</span>
                  </div>
                </div>
              </div>

              {open && (
                <div className="events__payload-wrap" onClick={(ev) => ev.stopPropagation()}>
                  <div className="text-muted text-sm mb-4">Payload</div>
                  <pre className="events__payload">
                    {JSON.stringify(e.payload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <Button variant="ghost" size="sm" disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}>← Prev</Button>
          <span className="mono text-muted">Page {page} of {totalPages}</span>
          <Button variant="ghost" size="sm" disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}>Next →</Button>
        </div>
      )}
    </div>
  );
}
