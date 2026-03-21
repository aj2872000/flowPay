import { useState } from "react";
import Button     from "../../components/common/Button/Button";
import Modal, { ModalActions } from "../../components/common/Modal/Modal";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import { useApi, useMutation } from "../../hooks/useApi";
import { useAuth } from "../../context/AuthContext";
import { billingApi } from "../../api/billing.api";
import { fmt, fmtNum } from "../../utils/helpers";
import "./Plans.css";

const PLAN_COLORS = ["#38bdf8", "#818cf8", "#f59e0b", "#22d3a3", "#f56565"];

export default function Plans({ addToast }) {
  const { user } = useAuth();
  const isAdmin  = user?.role === "admin";

  const { data: plans, loading, error, refetch } = useApi(billingApi.listPlans);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", price: "", interval: "month", features: "" });

  const { mutate: createPlan, loading: creating } = useMutation(billingApi.createPlan);
  const { mutate: archivePlan } = useMutation(billingApi.archivePlan);

  const planList = plans || [];
  const totalMrr = planList.reduce((s, p) => s + (p.price || 0) * (p.subscribers || 0), 0);

  const handleCreate = async () => {
    if (!form.name || !form.price) { addToast("Name and price are required", "error"); return; }
    try {
      await createPlan({
        name:     form.name,
        price:    parseFloat(form.price),
        interval: form.interval,
        features: form.features.split("\n").map((f) => f.trim()).filter(Boolean),
      });
      addToast(`Plan "${form.name}" created`, "success");
      setShowModal(false);
      setForm({ name: "", price: "", interval: "month", features: "" });
      refetch();
    } catch (err) { addToast(err.message, "error"); }
  };

  const handleArchive = async (plan) => {
    if (!window.confirm(`Archive plan "${plan.name}"?`)) return;
    try {
      await archivePlan(plan._id);
      addToast(`Plan "${plan.name}" archived`, "success");
      refetch();
    } catch (err) { addToast(err.message, "error"); }
  };

  return (
    <div>
      <div className="plans__header">
        <div>
          <div className="plans__title">Billing Plans</div>
          <div className="text-muted text-sm">Subscription tiers and pricing</div>
        </div>
        {/* Admin only */}
        {isAdmin && (
          <Button variant="primary" onClick={() => setShowModal(true)}>+ New Plan</Button>
        )}
      </div>

      {!isAdmin && (
        <div className="role-notice">
          You can view plans. Contact an admin to create or modify plans.
        </div>
      )}

      {error && <div className="api-error">{error}</div>}

      {loading ? (
        <div className="text-muted text-sm">Loading plans…</div>
      ) : planList.length === 0 ? (
        <EmptyState icon="🏷" text="No plans yet" />
      ) : (
        <div className="plans__grid">
          {planList.map((p, i) => {
            const color = PLAN_COLORS[i % PLAN_COLORS.length];
            return (
              <div className="plan-card" key={p._id}>
                <div className="plan-card__header">
                  <div>
                    <div className="plan-card__name" style={{ color }}>{p.name}</div>
                    <div className="text-muted text-sm">{fmtNum(p.subscribers || 0)} subscribers</div>
                  </div>
                  <div className="plan-card__dot" style={{ background: color }} />
                </div>
                <div className="plan-card__price" style={{ color }}>
                  <sup>$</sup>{(p.price || 0).toLocaleString()}<sub>/{p.interval}</sub>
                </div>
                <hr className="divider" />
                <div className="plan-card__features">
                  {(p.features || []).map((f) => (
                    <div key={f} className="plan-card__feature">✓ {f}</div>
                  ))}
                </div>
                {/* Archive only for admin */}
                {isAdmin && (
                  <Button variant="ghost" size="sm" fullWidth onClick={() => handleArchive(p)}>
                    Archive
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {planList.length > 0 && (
        <div className="card">
          <div className="card-header"><span className="card-title">Revenue by Plan</span></div>
          <table>
            <thead>
              <tr><th>Plan</th><th>Subscribers</th><th>Price/mo</th><th>MRR</th><th>% of Total</th></tr>
            </thead>
            <tbody>
              {planList.map((p, i) => {
                const mrr = (p.price || 0) * (p.subscribers || 0);
                const pct = totalMrr > 0 ? ((mrr / totalMrr) * 100).toFixed(1) : "0.0";
                const color = PLAN_COLORS[i % PLAN_COLORS.length];
                return (
                  <tr key={p._id}>
                    <td><span style={{ color, fontWeight: 700 }}>{p.name}</span></td>
                    <td className="mono">{fmtNum(p.subscribers || 0)}</td>
                    <td className="mono">{fmt(p.price || 0)}</td>
                    <td><span className="mono text-green">{fmt(mrr)}</span></td>
                    <td>
                      <div className="flex items-center gap-8">
                        <div className="plans__bar-bg">
                          <div className="plans__bar-fill" style={{ width: `${pct}%`, background: color }} />
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
      )}

      {isAdmin && showModal && (
        <Modal title="New Plan" subtitle="Define a new billing tier" onClose={() => setShowModal(false)}>
          <div className="form-group">
            <label className="form-label">Plan Name</label>
            <input className="form-input" placeholder="Pro" value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Price (USD/month)</label>
            <input className="form-input" type="number" placeholder="999" value={form.price}
              onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Interval</label>
            <select className="form-input filter-select" value={form.interval}
              onChange={(e) => setForm((p) => ({ ...p, interval: e.target.value }))}>
              <option value="month">Monthly</option>
              <option value="year">Yearly</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Features (one per line)</label>
            <textarea className="form-input" rows={4}
              placeholder={"25 seats\n100K API calls/mo\nPriority support"}
              value={form.features}
              onChange={(e) => setForm((p) => ({ ...p, features: e.target.value }))}
              style={{ resize: "vertical" }} />
          </div>
          <ModalActions>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreate} disabled={creating}>
              {creating ? "Creating…" : "Create Plan"}
            </Button>
          </ModalActions>
        </Modal>
      )}
    </div>
  );
}
