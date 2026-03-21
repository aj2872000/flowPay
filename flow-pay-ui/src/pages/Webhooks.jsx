import React, { useState } from "react";
import { DUMMY_WEBHOOKS } from "../data/index";
import Badge from "../components/Badge";

function Webhooks({ addToast }) {
  const [showModal, setShowModal] = useState(false);
  const [newWh, setNewWh] = useState({ url: "", events: "" });

  const handleCreate = () => {
    if (!newWh.url) { addToast("Please enter a URL", "error"); return; }
    addToast(`Webhook registered for ${newWh.url}`, "success");
    setShowModal(false);
    setNewWh({ url: "", events: "" });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-16">
        <div>
          <div style={{ fontFamily: "var(--font-head)", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Webhooks</div>
          <div className="text-muted text-sm">Manage event delivery to external endpoints</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Register Webhook</button>
      </div>

      {DUMMY_WEBHOOKS.map(w => (
        <div className="webhook-card" key={w.id}>
          <div className="flex items-center justify-between mb-8">
            <div className="webhook-url">{w.url}</div>
            <div className="flex items-center gap-8">
              <Badge status={w.status} />
              <button className="btn btn-ghost btn-sm" onClick={() => addToast(`Testing ${w.url}`, "info")}>Test</button>
              <button className="btn btn-ghost btn-sm" onClick={() => addToast(`Deleted webhook`, "success")}>Delete</button>
            </div>
          </div>
          <div className="webhook-events">
            {w.events.map(ev => <span key={ev} className="event-chip">{ev}</span>)}
          </div>
          <div className="flex items-center gap-12">
            <span className="text-muted text-sm">Last delivery: <span className="mono">{new Date(w.lastDelivery).toLocaleString()}</span></span>
            <span className="text-muted text-sm">Success rate: <span className={w.successRate >= 90 ? "text-green" : w.successRate >= 70 ? "text-yellow" : "text-red"} style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{w.successRate}%</span></span>
          </div>
          <div className="mini-progress" style={{ marginTop: 10 }}>
            <div className="mini-progress-fill" style={{ width: `${w.successRate}%`, background: w.successRate >= 90 ? "var(--green)" : w.successRate >= 70 ? "var(--yellow)" : "var(--red)" }} />
          </div>
        </div>
      ))}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Register Webhook</div>
            <div className="modal-sub">We'll POST events to your endpoint in real time</div>
            <div className="form-group">
              <label className="form-label">Endpoint URL</label>
              <input className="form-input" placeholder="https://your-server.com/webhooks" value={newWh.url} onChange={e => setNewWh(p => ({ ...p, url: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Events (comma-separated)</label>
              <input className="form-input" placeholder="payment.succeeded, payment.failed" value={newWh.events} onChange={e => setNewWh(p => ({ ...p, events: e.target.value }))} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate}>Register</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Webhooks;