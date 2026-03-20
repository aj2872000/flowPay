import React, { useState } from "react";
import { fmt, fmtDate } from "../utils/formatters";
import { DUMMY_SUBSCRIPTIONS } from "../data/index";
import Badge from "../components/Badge";

function Subscriptions({ addToast }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [newSub, setNewSub] = useState({ customer: "", plan: "Starter", email: "" });

  const filtered = DUMMY_SUBSCRIPTIONS.filter(s => {
    const matchSearch = s.customer.toLowerCase().includes(search.toLowerCase()) || s.id.includes(search);
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCreate = () => {
    if (!newSub.customer || !newSub.email) { addToast("Please fill all fields", "error"); return; }
    addToast(`Subscription created for ${newSub.customer}`, "success");
    setShowModal(false);
    setNewSub({ customer: "", plan: "Starter", email: "" });
  };

  return (
    <div>
      <div className="toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input placeholder="Search customers or ID…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="trialing">Trialing</option>
          <option value="past_due">Past Due</option>
          <option value="canceled">Canceled</option>
        </select>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Subscription</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Next Billing</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon">📭</div><div className="empty-text">No subscriptions found</div></div></td></tr>
              ) : filtered.map(s => (
                <tr key={s.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--text)" }}>{s.customer}</div>
                    <div className="mono-sm">{s.id}</div>
                  </td>
                  <td><span style={{ fontWeight: 600 }}>{s.plan}</span></td>
                  <td><Badge status={s.status} /></td>
                  <td><span className="font-mono text-green">{fmt(s.amount)}<span className="text-muted">/mo</span></span></td>
                  <td className="mono">{fmtDate(s.nextBilling)}</td>
                  <td className="mono text-muted">{fmtDate(s.created)}</td>
                  <td>
                    <div className="flex gap-8">
                      <button className="btn btn-ghost btn-sm" onClick={() => addToast(`Viewing ${s.customer}`, "info")}>View</button>
                      {s.status === "active" && <button className="btn btn-danger btn-sm" onClick={() => addToast(`Cancelled ${s.customer}`, "success")}>Cancel</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">New Subscription</div>
            <div className="modal-sub">Create a new subscription for a customer</div>
            <div className="form-group">
              <label className="form-label">Customer Name</label>
              <input className="form-input" placeholder="Acme Corp" value={newSub.customer} onChange={e => setNewSub(p => ({ ...p, customer: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" placeholder="billing@acme.com" value={newSub.email} onChange={e => setNewSub(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Plan</label>
              <select className="form-input filter-select" value={newSub.plan} onChange={e => setNewSub(p => ({ ...p, plan: e.target.value }))}>
                <option>Starter</option><option>Pro</option><option>Enterprise</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate}>Create Subscription</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Subscriptions;
