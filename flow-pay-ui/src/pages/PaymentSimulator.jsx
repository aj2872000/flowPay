import React, { useState } from "react";
import { fmt } from "../utils/formatters";

function PaymentSimulator({ addToast }) {
  const [form, setForm] = useState({ amount: "", method: "card_visa", scenario: "success", customer: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const scenarios = [
    { value: "success", label: "✓ Payment Succeeds", color: "var(--green)" },
    { value: "insufficient_funds", label: "✗ Insufficient Funds", color: "var(--red)" },
    { value: "card_declined", label: "✗ Card Declined", color: "var(--red)" },
    { value: "network_error", label: "⚠ Network Timeout", color: "var(--yellow)" },
    { value: "fraud_detected", label: "🛡 Fraud Detected", color: "var(--red)" },
  ];

  const simulate = () => {
    if (!form.amount || !form.customer) { addToast("Fill all fields", "error"); return; }
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      const success = form.scenario === "success";
      setResult({
        id: `pay_sim_${Math.random().toString(36).slice(2, 8)}`,
        status: success ? "succeeded" : "failed",
        amount: parseFloat(form.amount),
        customer: form.customer,
        scenario: form.scenario,
        timestamp: new Date().toISOString(),
        message: success ? "Payment processed successfully" : `Payment failed: ${form.scenario.replace(/_/g, " ")}`,
        retryable: ["insufficient_funds", "network_error"].includes(form.scenario),
      });
      setLoading(false);
      addToast(success ? "Payment succeeded!" : "Payment failed — check result", success ? "success" : "error");
    }, 1400);
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "var(--font-head)", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Payment Simulator</div>
        <div className="text-muted text-sm">Test payment flows without real transactions</div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><span className="card-title">Simulation Config</span></div>
          <div className="form-group">
            <label className="form-label">Customer</label>
            <input className="form-input" placeholder="Customer name" value={form.customer} onChange={e => setForm(p => ({ ...p, customer: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Amount (USD)</label>
            <input className="form-input" type="number" placeholder="0.00" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <select className="form-input filter-select" value={form.method} onChange={e => setForm(p => ({ ...p, method: e.target.value }))}>
              <option value="card_visa">Visa ····4242</option>
              <option value="card_mc">Mastercard ····5353</option>
              <option value="card_amex">Amex ····0005</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Scenario</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {scenarios.map(s => (
                <label key={s.value} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "10px 12px", background: form.scenario === s.value ? "var(--surface2)" : "transparent", borderRadius: "var(--radius-sm)", border: `1px solid ${form.scenario === s.value ? "var(--border2)" : "transparent"}` }}>
                  <input type="radio" value={s.value} checked={form.scenario === s.value} onChange={e => setForm(p => ({ ...p, scenario: e.target.value }))} style={{ accentColor: s.color }} />
                  <span style={{ fontSize: 13, color: form.scenario === s.value ? s.color : "var(--text2)" }}>{s.label}</span>
                </label>
              ))}
            </div>
          </div>
          <button className="btn btn-primary w-full" onClick={simulate} disabled={loading} style={{ marginTop: 8, justifyContent: "center", opacity: loading ? 0.7 : 1 }}>
            {loading ? <><span className="pulse">●</span> Processing…</> : "▶ Run Simulation"}
          </button>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Result</span></div>
          {!result && !loading && (
            <div className="empty-state">
              <div className="empty-icon">🧪</div>
              <div className="empty-text">Run a simulation to see results</div>
            </div>
          )}
          {loading && (
            <div className="empty-state">
              <div style={{ fontSize: 36, animation: "pulse 1s infinite" }}>⏳</div>
              <div className="text-muted" style={{ marginTop: 12 }}>Processing payment…</div>
            </div>
          )}
          {result && !loading && (
            <div>
              <div style={{ padding: "16px", background: result.status === "succeeded" ? "var(--green-bg)" : "var(--red-bg)", borderRadius: "var(--radius-sm)", marginBottom: 20, borderLeft: `3px solid ${result.status === "succeeded" ? "var(--green)" : "var(--red)"}` }}>
                <div style={{ fontFamily: "var(--font-head)", fontSize: 18, fontWeight: 800, color: result.status === "succeeded" ? "var(--green)" : "var(--red)", marginBottom: 4 }}>
                  {result.status === "succeeded" ? "✓ Payment Succeeded" : "✗ Payment Failed"}
                </div>
                <div style={{ fontSize: 13, color: "var(--text2)" }}>{result.message}</div>
              </div>
              {[
                ["Payment ID", result.id],
                ["Customer", result.customer],
                ["Amount", fmt(result.amount)],
                ["Status", result.status],
                ["Scenario", result.scenario.replace(/_/g, " ")],
                ["Retryable", result.retryable ? "Yes" : "No"],
                ["Timestamp", new Date(result.timestamp).toLocaleString()],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between" style={{ padding: "9px 0", borderBottom: "1px solid var(--border)" }}>
                  <span className="text-muted text-sm">{k}</span>
                  <span className="mono" style={{ fontSize: 12 }}>{v}</span>
                </div>
              ))}
              {result.retryable && (
                <button className="btn btn-primary w-full" style={{ marginTop: 16, justifyContent: "center" }} onClick={() => addToast("Retry scheduled", "success")}>
                  ↻ Schedule Retry
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaymentSimulator;