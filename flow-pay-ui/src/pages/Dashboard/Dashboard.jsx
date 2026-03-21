import StatCard   from "../../components/common/StatCard/StatCard";
import MRRChart   from "../../components/common/MRRChart/MRRChart";
import Badge      from "../../components/common/Badge/Badge";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import { useApi } from "../../hooks/useApi";
import { billingApi } from "../../api/billing.api";
import { eventApi }   from "../../api/event.api";
import { fmt, fmtNum, EVENT_ICON_MAP } from "../../utils/helpers";
import "./Dashboard.css";

export default function Dashboard() {
  // Pass stable function references — no useCallback needed when fn never changes
  const { data: stats,      loading: statsLoading,  error: statsError  } = useApi(billingApi.getStats);
  const { data: eventsData, loading: eventsLoading, error: eventsError } = useApi(
    () => eventApi.listEvents({ limit: 5 })
  );

  const events = eventsData?.data || [];

  return (
    <div className="dashboard">

      {/* ── Stat cards ── */}
      <div className="dashboard__stats">
        <StatCard label="Monthly Revenue"      icon="💰" color="green"
          value={statsLoading ? "—" : fmt(stats?.mrr ?? 0)}
          change={stats?.mrrChange ?? 0} />
        <StatCard label="Active Subscriptions" icon="📦" color="blue"
          value={statsLoading ? "—" : fmtNum(stats?.activeSubscriptions ?? 0)}
          change={stats?.subChange ?? 0} />
        <StatCard label="Payment Success Rate" icon="✅" color="yellow"
          value={statsLoading ? "—" : `${stats?.paymentSuccessRate ?? 0}%`}
          change={stats?.rateChange ?? 0} />
        <StatCard label="Failed Payments"      icon="⚠️" color="red"
          value={statsLoading ? "—" : (stats?.failedPayments ?? 0)}
          change={stats?.failedChange ?? 0} />
      </div>

      {/* ── MRR chart ── */}
      <div className="card dashboard__chart">
        {statsLoading ? (
          <div className="table-loading">Loading revenue data…</div>
        ) : statsError ? (
          <div className="api-error">{statsError}</div>
        ) : (
          <MRRChart
            history={stats?.mrrHistory || []}
            currentMrr={stats?.mrr || 0}
            change={stats?.mrrChange || 0}
          />
        )}
      </div>

      {/* ── Bottom row ── */}
      <div className="dashboard__bottom">
        {/* Revenue snapshot */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Revenue Snapshot</span>
          </div>
          {statsLoading ? (
            <div className="table-loading">Loading…</div>
          ) : (
            <div style={{ padding: "8px 0" }}>
              {[
                ["Total MRR",            fmt(stats?.mrr || 0),                      "var(--green)"],
                ["Active Subscriptions", fmtNum(stats?.activeSubscriptions || 0),   null],
                ["Success Rate",         `${stats?.paymentSuccessRate || 0}%`,       (stats?.paymentSuccessRate || 0) >= 95 ? "var(--green)" : "var(--yellow)"],
                ["Failed Payments",      stats?.failedPayments || 0,                 (stats?.failedPayments || 0) > 0 ? "var(--red)" : "var(--green)"],
              ].map(([label, value, color]) => (
                <div key={label} className="flex items-center justify-between"
                  style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                  <span className="text-muted text-sm">{label}</span>
                  <span className="mono fw-bold" style={color ? { color } : {}}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent events */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Events</span>
            <span className="mono-sm">
              {eventsLoading ? "…" : `${eventsData?.total || 0} total`}
            </span>
          </div>
          {eventsLoading ? (
            <div className="table-loading">Loading…</div>
          ) : eventsError ? (
            <div className="api-error">{eventsError}</div>
          ) : events.length === 0 ? (
            <EmptyState icon="⚡" text="No events yet" />
          ) : events.map((e) => {
            const cfg = EVENT_ICON_MAP[e.type] || { bg: "var(--surface2)", color: "var(--text3)", icon: "·" };
            return (
              <div key={e._id} className="dashboard__event-row">
                <div className="dashboard__event-icon"
                  style={{ background: cfg.bg, color: cfg.color }}>
                  {cfg.icon}
                </div>
                <div className="dashboard__event-body">
                  <div className="dashboard__event-type">{e.type}</div>
                  <div className="dashboard__event-meta">
                    {e.service} · {new Date(e.createdAt).toLocaleString()}
                  </div>
                </div>
                <Badge status={e.status} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
