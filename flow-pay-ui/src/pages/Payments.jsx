import React, { useState } from "react";
import { fmt, fmtDate } from "../utils/formatters";
import { DUMMY_PAYMENTS } from "../data/index";
import StatCard from "../components/StatCard";
import Badge from "../components/Badge";

function Payments({ addToast }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = DUMMY_PAYMENTS.filter(p => {
    const matchSearch = p.customer.toLowerCase().includes(search.toLowerCase()) || p.id.includes(search);
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const methodLabel = m => ({ card_visa: "Visa ····4242", card_mc: "MC ····5353", card_amex: "Amex ····0005", bank_transfer: "Bank Transfer" }[m] || m);

  return (
    <div>
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        <StatCard label="Total Collected" value={fmt(DUMMY_PAYMENTS.filter(p=>p.status==="succeeded").reduce((s,p)=>s+p.amount,0))} change={8.3} icon="💳" color="green" />
        <StatCard label="Failed" value={DUMMY_PAYMENTS.filter(p=>p.status==="failed").length} change={-5.2} icon="❌" color="red" />
        <StatCard label="Refunded" value={fmt(DUMMY_PAYMENTS.filter(p=>p.status==="refunded").reduce((s,p)=>s+p.amount,0))} change={-1.1} icon="↩️" color="yellow" />
      </div>

      <div className="toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input placeholder="Search payments…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="succeeded">Succeeded</option>
          <option value="failed">Failed</option>
          <option value="processing">Processing</option>
          <option value="refunded">Refunded</option>
        </select>
        <button className="btn btn-ghost" onClick={() => addToast("Export started", "info")}>⬇ Export CSV</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Method</th>
                <th>Retries</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8}><div className="empty-state"><div className="empty-icon">💳</div><div className="empty-text">No payments found</div></div></td></tr>
              ) : filtered.map(p => (
                <tr key={p.id}>
                  <td className="mono text-accent">{p.id}</td>
                  <td style={{ fontWeight: 600 }}>{p.customer}</td>
                  <td><span className="font-mono" style={{ color: p.status === "failed" ? "var(--red)" : "var(--green)" }}>{fmt(p.amount)}</span></td>
                  <td><Badge status={p.status} /></td>
                  <td className="mono">{methodLabel(p.method)}</td>
                  <td>
                    {p.retries > 0
                      ? <span style={{ color: "var(--yellow)", fontFamily: "var(--font-mono)", fontSize: 12 }}>↻ {p.retries}</span>
                      : <span className="text-muted mono">—</span>}
                  </td>
                  <td className="mono text-muted">{fmtDate(p.date)}</td>
                  <td>
                    <div className="flex gap-8">
                      <button className="btn btn-ghost btn-sm" onClick={() => addToast(`Viewing ${p.id}`, "info")}>Details</button>
                      {p.status === "failed" && <button className="btn btn-primary btn-sm" onClick={() => addToast(`Retrying ${p.id}…`, "success")}>↻ Retry</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Payments;