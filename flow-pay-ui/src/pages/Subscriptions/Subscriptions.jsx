import { useState, useCallback } from "react";
import Badge      from "../../components/common/Badge/Badge";
import Button     from "../../components/common/Button/Button";
import SearchBar  from "../../components/common/SearchBar/SearchBar";
import Modal, { ModalActions } from "../../components/common/Modal/Modal";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import { useApi, useMutation } from "../../hooks/useApi";
import { billingApi } from "../../api/billing.api";
import { fmt, fmtDate } from "../../utils/helpers";
import "./Subscriptions.css";

export default function Subscriptions({ addToast }) {
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal,    setShowModal]    = useState(false);
  const [form, setForm] = useState({ customer: "", email: "", planId: "" });

  const { data, loading, error, refetch } = useApi(
    useCallback(() => {
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (search) params.search = search;
      return billingApi.listSubscriptions(params);
    }, [statusFilter, search])
  );

  const { data: plans, loading: plansLoading } = useApi(billingApi.listPlans);

  const { mutate: createSub, loading: creating } = useMutation(billingApi.createSubscription);
  const { mutate: cancelSub } = useMutation(billingApi.cancelSubscription);

  const subscriptions = data?.data || [];

  const handleCreate = async () => {
    if (!form.customer || !form.email || !form.planId) {
      addToast("Please fill all fields", "error"); return;
    }
    try {
      await createSub(form);
      addToast(`Subscription created for ${form.customer}`, "success");
      setShowModal(false);
      setForm({ customer: "", email: "", planId: "" });
      refetch();
    } catch (err) { addToast(err.message, "error"); }
  };

  const handleCancel = async (sub) => {
    if (!window.confirm(`Cancel subscription for ${sub.customer}?`)) return;
    try {
      await cancelSub(sub._id, { reason: "user_request", cancelImmediately: false });
      addToast(`Cancelled ${sub.customer}`, "success");
      refetch();
    } catch (err) { addToast(err.message, "error"); }
  };

  return (
    <div>
      <div className="toolbar">
        <SearchBar value={search} onChange={setSearch} placeholder="Search customers or ID…" />
        <select className="filter-select" value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="trialing">Trialing</option>
          <option value="past_due">Past Due</option>
          <option value="canceled">Canceled</option>
        </select>
        <Button variant="primary" onClick={() => setShowModal(true)}>+ New Subscription</Button>
      </div>

      {error && <div className="api-error">{error}</div>}

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Customer</th><th>Plan</th><th>Status</th>
                <th>Amount</th><th>Next Billing</th><th>Created</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7}><div className="table-loading">Loading…</div></td></tr>
              ) : subscriptions.length === 0 ? (
                <tr><td colSpan={7}><EmptyState icon="📭" text="No subscriptions found" /></td></tr>
              ) : subscriptions.map((s) => (
                <tr key={s._id}>
                  <td>
                    <div className="subs__customer-name">{s.customer}</div>
                    <div className="mono-sm">{(s._id || "").slice(-8)}</div>
                  </td>
                  <td><span className="fw-bold">{s.planName}</span></td>
                  <td><Badge status={s.status} /></td>
                  <td>
                    <span className="mono text-green">
                      {fmt(s.amount || 0)}<span className="text-muted">/mo</span>
                    </span>
                  </td>
                  <td className="mono">{fmtDate(s.nextBillingDate)}</td>
                  <td className="mono text-muted">{fmtDate(s.createdAt)}</td>
                  <td>
                    {s.status === "active" && (
                      <Button size="sm" variant="danger" onClick={() => handleCancel(s)}>
                        Cancel
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(data?.total || 0) > 0 && (
          <div className="table-footer">
            Showing {subscriptions.length} of {data.total}
          </div>
        )}
      </div>

      {showModal && (
        <Modal title="New Subscription" subtitle="Create a subscription for a customer"
          onClose={() => setShowModal(false)}>
          <div className="form-group">
            <label className="form-label">Customer Name</label>
            <input className="form-input" placeholder="Acme Corp" value={form.customer}
              onChange={(e) => setForm((p) => ({ ...p, customer: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" placeholder="billing@acme.com" value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Plan</label>
            <select className="form-input filter-select" value={form.planId}
              onChange={(e) => setForm((p) => ({ ...p, planId: e.target.value }))}>
              <option value="">Select a plan…</option>
              {!plansLoading && (plans || []).map((p) => (
                <option key={p._id} value={p._id}>{p.name} – ${p.price}/mo</option>
              ))}
            </select>
          </div>
          <ModalActions>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreate} disabled={creating}>
              {creating ? "Creating…" : "Create Subscription"}
            </Button>
          </ModalActions>
        </Modal>
      )}
    </div>
  );
}
