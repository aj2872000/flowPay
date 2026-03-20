import React from "react";
import { fmt } from "../utils/formatters";
import { DUMMY_PLANS } from "../data/index";

function Plans({ addToast }) {
  return (
    <div>
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "var(--font-head)", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Billing Plans</div>
          <div className="text-muted text-sm">Manage your subscription tiers and pricing</div>
        </div>
        <button className="btn btn-primary" onClick={() => addToast("Plan editor coming soon", "info")}>+ New Plan</button>
      </div>

      <div className="grid-3">
        {DUMMY_PLANS.map((p, i) => (
          <div className="plan-card" key={p.id} style={{ borderColor: i === 1 ? "var(--accent)" : undefined }}>
            {i === 1 && <div className="plan-pill">MOST POPULAR</div>}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: "var(--font-head)", fontSize: 15, fontWeight: 800, color: p.color }}>{p.name}</div>
                <div className="text-muted text-sm">{p.subscribers} subscribers</div>
              </div>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.color, boxShadow: `0 0 12px ${p.color}` }} />
            </div>
            <div className="plan-price" style={{ color: p.color, marginBottom: 16 }}>
              <sup>$</sup>{(p.price).toLocaleString()}<sub>/mo</sub>
            </div>
            <hr className="divider" />
            <div style={{ marginBottom: 20 }}>
              {p.features.map(f => <div key={f} className="plan-feature">{f}</div>)}
            </div>
            <div className="flex gap-8">
              <button className="btn btn-ghost btn-sm w-full" onClick={() => addToast(`Editing ${p.name} plan`, "info")}>Edit Plan</button>
              <button className="btn btn-ghost btn-sm w-full" onClick={() => addToast(`Archived ${p.name}`, "success")}>Archive</button>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Revenue by Plan</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Plan</th>
              <th>Subscribers</th>
              <th>Price/mo</th>
              <th>MRR</th>
              <th>% of Total</th>
            </tr>
          </thead>
          <tbody>
            {DUMMY_PLANS.map(p => {
              const mrr = p.price * p.subscribers;
              const total = DUMMY_PLANS.reduce((s, x) => s + x.price * x.subscribers, 0);
              const pct = ((mrr / total) * 100).toFixed(1);
              return (
                <tr key={p.id}>
                  <td><span style={{ color: p.color, fontWeight: 700 }}>{p.name}</span></td>
                  <td className="mono">{p.subscribers}</td>
                  <td className="mono">{fmt(p.price)}</td>
                  <td><span className="mono text-green">{fmt(mrr)}</span></td>
                  <td>
                    <div className="flex items-center gap-8">
                      <div className="mini-progress" style={{ width: 80, flex: "none" }}>
                        <div className="mini-progress-fill" style={{ width: `${pct}%`, background: p.color }} />
                      </div>
                      <span className="mono">{pct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Plans;