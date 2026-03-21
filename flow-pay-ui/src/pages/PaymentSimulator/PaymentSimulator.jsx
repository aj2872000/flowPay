import { useState } from "react";
import Button   from "../../components/common/Button/Button";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import { useApi, useMutation } from "../../hooks/useApi";
import { simulatorApi } from "../../api/simulator.api";
import { fmt } from "../../utils/helpers";
import "./PaymentSimulator.css";

const STATUS_COLORS = {
  succeeded: "var(--green)",
  failed:    "var(--red)",
};

const RESULT_ROWS = [
  ["Payment ID",   (r) => r.id],
  ["Customer",     (r) => r.customer],
  ["Amount",       (r) => fmt(r.amount)],
  ["Status",       (r) => r.status],
  ["Scenario",     (r) => r.scenario?.replace(/_/g, " ")],
  ["Decline Code", (r) => r.declineCode || "—"],
  ["Retryable",    (r) => (r.retryable ? "Yes" : "No")],
  ["Timestamp",    (r) => new Date(r.timestamp).toLocaleString()],
];

export default function PaymentSimulator({ addToast }) {
  const { data: scenariosData, loading: scenariosLoading } = useApi(simulatorApi.listScenarios, []);
  const scenarios = scenariosData || [];

  const [form, setForm] = useState({
    customer: "", amount: "", method: "card_visa", scenario: "success",
  });
  const [result,  setResult]  = useState(null);
  const [history, setHistory] = useState([]);

  const { mutate: runCharge, loading: charging } = useMutation(simulatorApi.charge);

  const simulate = async () => {
    if (!form.customer || !form.amount) { addToast("Fill all fields", "error"); return; }
    setResult(null);
    try {
      const res = await runCharge({
        customer: form.customer,
        amount:   parseFloat(form.amount),
        currency: "USD",
        method:   form.method,
        scenario: form.scenario,
      });
      setResult(res);
      setHistory((h) => [res, ...h].slice(0, 10));
      addToast(
        res.status === "succeeded" ? "Payment succeeded!" : `Payment failed: ${res.declineCode}`,
        res.status === "succeeded" ? "success" : "error"
      );
    } catch (err) { addToast(err.message, "error"); }
  };

  return (
    <div>
      <div className="sim__header">
        <div className="sim__title">Payment Simulator</div>
        <div className="text-muted text-sm">Test payment flows without real transactions</div>
      </div>

      <div className="sim__grid">
        {/* ── Config panel ── */}
        <div className="card">
          <div className="card-header"><span className="card-title">Simulation Config</span></div>

          <div className="form-group">
            <label className="form-label">Customer</label>
            <input className="form-input" placeholder="Customer name" value={form.customer}
              onChange={(e) => setForm((p) => ({ ...p, customer: e.target.value }))} />
          </div>

          <div className="form-group">
            <label className="form-label">Amount (USD)</label>
            <input className="form-input" type="number" min="0.01" step="0.01"
              placeholder="0.00" value={form.amount}
              onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} />
          </div>

          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <select className="form-input filter-select" value={form.method}
              onChange={(e) => setForm((p) => ({ ...p, method: e.target.value }))}>
              <option value="card_visa">Visa ····4242</option>
              <option value="card_mc">Mastercard ····5353</option>
              <option value="card_amex">Amex ····0005</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Scenario {scenariosLoading && <span className="text-muted">(loading…)</span>}
            </label>
            <div className="sim__scenarios">
              {scenarios.map((s) => {
                const isActive = form.scenario === s.id;
                const color = s.status === "succeeded" ? "var(--green)"
                            : s.retryable ? "var(--yellow)" : "var(--red)";
                return (
                  <label key={s.id}
                    className={`sim__scenario ${isActive ? "sim__scenario--active" : ""}`}>
                    <input type="radio" value={s.id} checked={isActive}
                      onChange={() => setForm((p) => ({ ...p, scenario: s.id }))}
                      style={{ accentColor: color }} />
                    <span style={{ color: isActive ? color : "var(--text2)", fontSize: 13 }}>
                      {s.label}
                    </span>
                    {s.retryable && (
                      <span className="sim__retryable-tag">retryable</span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          <Button variant="primary" fullWidth onClick={simulate} disabled={charging || scenariosLoading}>
            {charging ? <><span className="sim__pulse">●</span> Processing…</> : "▶ Run Simulation"}
          </Button>
        </div>

        {/* ── Result panel ── */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Result</span>
            {history.length > 0 && (
              <span className="mono-sm">{history.length} run{history.length !== 1 ? "s" : ""}</span>
            )}
          </div>

          {!result && !charging && (
            <EmptyState icon="🧪" text="Run a simulation to see results" />
          )}

          {charging && (
            <div className="sim__empty">
              <div className="sim__loading-icon">⏳</div>
              <div className="text-muted" style={{ marginTop: 12 }}>Processing payment…</div>
            </div>
          )}

          {result && !charging && (
            <div>
              <div className={`sim__result-banner sim__result-banner--${result.status}`}>
                <div className="sim__result-title"
                  style={{ color: STATUS_COLORS[result.status] }}>
                  {result.status === "succeeded" ? "✓ Payment Succeeded" : "✗ Payment Failed"}
                </div>
                <div className="sim__result-msg">{result.message}</div>
              </div>

              {RESULT_ROWS.map(([label, getValue]) => (
                <div key={label} className="sim__result-row">
                  <span className="text-muted text-sm">{label}</span>
                  <span className="mono" style={{ fontSize: 12 }}>{getValue(result)}</span>
                </div>
              ))}

              {result.retryable && (
                <Button variant="primary" fullWidth onClick={() => addToast("Retry scheduling is handled automatically by billing-service", "info")}
                  className="sim__retry-btn">
                  ℹ Retry handled by billing-service
                </Button>
              )}
            </div>
          )}

          {/* Run history */}
          {history.length > 0 && (
            <div className="sim__history">
              <div className="card-title" style={{ marginBottom: 10, marginTop: result ? 20 : 0 }}>
                Recent Runs
              </div>
              {history.map((r, i) => (
                <div key={`${r.id}-${i}`} className="sim__history-row">
                  <span className="mono" style={{ fontSize: 11, color: "var(--text3)" }}>
                    {r.id?.slice(-8)}
                  </span>
                  <span style={{ fontSize: 12 }}>{r.customer}</span>
                  <span className="mono" style={{ fontSize: 12 }}>{fmt(r.amount)}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 600,
                    color: r.status === "succeeded" ? "var(--green)" : "var(--red)",
                  }}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
