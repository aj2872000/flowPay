import React from "react";
import { fmt, fmtNum } from "../utils/formatters";
import { DUMMY_STATS, DUMMY_EVENTS } from "../data/index";
import StatCard from "../components/StatCard";
import MRRChart from "../components/MRRChart";
import PlanDistribution from "../components/PlanDistribution";
import Badge from "../components/Badge";

function Dashboard() {
  return (
    <div>
      <div className="stats-grid">
        <StatCard label="Monthly Revenue" value={fmt(DUMMY_STATS.mrr)} change={DUMMY_STATS.mrrChange} icon="💰" color="green" />
        <StatCard label="Active Subscriptions" value={fmtNum(DUMMY_STATS.activeSubscriptions)} change={DUMMY_STATS.subChange} icon="📦" color="blue" />
        <StatCard label="Payment Success Rate" value={`${DUMMY_STATS.successRate}%`} change={DUMMY_STATS.rateChange} icon="✅" color="yellow" />
        <StatCard label="Failed Payments" value={DUMMY_STATS.failedPayments} change={DUMMY_STATS.failedChange} icon="⚠️" color="red" />
      </div>

      <div className="grid-2 mb-24">
        <div className="card col-span-2" style={{ gridColumn: "1/3" }}>
          <MRRChart />
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <PlanDistribution />
        </div>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Events</span>
            <span className="mono-sm">Live</span>
          </div>
          {DUMMY_EVENTS.slice(0, 5).map(e => {
            const icons = { "payment.succeeded": { bg: "var(--green-bg)", icon: "✓" }, "payment.failed": { bg: "var(--red-bg)", icon: "✗" }, "subscription.created": { bg: "var(--accent-glow)", icon: "+" }, "subscription.canceled": { bg: "var(--surface2)", icon: "−" }, "webhook.failed": { bg: "var(--red-bg)", icon: "⚠" }, "payment.retry_scheduled": { bg: "var(--yellow-bg)", icon: "↻" }, "subscription.trial_ending": { bg: "var(--yellow-bg)", icon: "⏰" } };
            const cfg = icons[e.type] || { bg: "var(--surface2)", icon: "·" };
            return (
              <div key={e.id} className="event-row">
                <div className="event-icon-wrap" style={{ background: cfg.bg }}>{cfg.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="event-type">{e.type}</div>
                  <div className="event-meta">{e.service} · {new Date(e.timestamp).toLocaleString()}</div>
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

export default Dashboard;