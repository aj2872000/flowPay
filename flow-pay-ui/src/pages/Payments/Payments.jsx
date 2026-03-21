import { useState, useCallback } from "react";
import Badge      from "../../components/common/Badge/Badge";
import Button     from "../../components/common/Button/Button";
import SearchBar  from "../../components/common/SearchBar/SearchBar";
import StatCard   from "../../components/common/StatCard/StatCard";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import { useApi, useMutation } from "../../hooks/useApi";
import { billingApi } from "../../api/billing.api";
import { fmt, fmtDate, methodLabel } from "../../utils/helpers";
import "./Payments.css";

export default function Payments({ addToast }) {
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, loading, error, refetch } = useApi(
    useCallback(() => {
      const params = { limit: 100 }; // load enough to compute stats client-side
      if (statusFilter !== "all") params.status = statusFilter;
      return billingApi.listPayments(params);
    }, [statusFilter])
  );

  const { mutate: retryPay, loading: retrying } = useMutation(billingApi.retryPayment);

  const allPayments = data?.data || [];

  // Client-side search filter
  const payments = allPayments.filter((p) => {
    if (!search) return true;
    const id = (p._id || "").toLowerCase();
    return (
      (p.customer || "").toLowerCase().includes(search.toLowerCase()) ||
      id.includes(search.toLowerCase())
    );
  });

  // Stats from all loaded payments (before search filter)
  const succeeded = allPayments.filter((p) => p.status === "succeeded");
  const failed    = allPayments.filter((p) => p.status === "failed");
  const refunded  = allPayments.filter((p) => p.status === "refunded");
  const processing = allPayments.filter((p) => p.status === "processing");

  const handleRetry = async (payment) => {
    if (!payment._id) { addToast("Payment ID missing", "error"); return; }
    try {
      await retryPay(payment._id);
      addToast("Retry initiated — payment is processing", "success");
      refetch();
    } catch (err) { addToast(err.message, "error"); }
  };

  return (
    <div>
      {/* Stats row */}
      <div className="payments__stats">
        <StatCard label="Collected"
          value={fmt(succeeded.reduce((s, p) => s + (p.amount || 0), 0))}
          change={0} icon="💳" color="green" />
        <StatCard label="Processing"
          value={processing.length}
          change={0} icon="⏳" color="blue" />
        <StatCard label="Failed"
          value={failed.length}
          change={0} icon="❌" color="red" />
        <StatCard label="Refunded"
          value={fmt(refunded.reduce((s, p) => s + (p.amount || 0), 0))}
          change={0} icon="↩️" color="yellow" />
      </div>

      <div className="toolbar">
        <SearchBar value={search} onChange={setSearch} placeholder="Search customer or payment ID…" />
        <select className="filter-select" value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="succeeded">Succeeded</option>
          <option value="processing">Processing</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <Button variant="ghost" onClick={refetch}>↻ Refresh</Button>
      </div>

      {error && <div className="api-error">{error}</div>}

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Customer</th><th>Amount</th>
                <th>Status</th><th>Method</th><th>Retries</th><th>Date</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8}><div className="table-loading">Loading payments…</div></td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={8}>
                  <EmptyState icon="💳"
                    text={allPayments.length === 0
                      ? "No payments yet — create a subscription to generate one"
                      : "No payments match your filter"} />
                </td></tr>
              ) : payments.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div className="mono text-accent" style={{ fontSize: 11 }}>
                      {(p._id || "").slice(-8)}
                    </div>
                    {p.simulatorRef && (
                      <div className="mono-sm">{p.simulatorRef.slice(-6)}</div>
                    )}
                  </td>
                  <td><span className="fw-bold">{p.customer}</span></td>
                  <td>
                    <span className="mono"
                      style={{ color: p.status === "failed" ? "var(--red)" : p.status === "succeeded" ? "var(--green)" : "var(--text2)" }}>
                      {fmt(p.amount || 0)}
                    </span>
                  </td>
                  <td><Badge status={p.status} /></td>
                  <td className="mono">{methodLabel(p.method)}</td>
                  <td>
                    {(p.retries || 0) > 0
                      ? <span className="payments__retry-count">↻ {p.retries}/{p.maxRetries}</span>
                      : <span className="text-muted mono">—</span>}
                  </td>
                  <td className="mono text-muted" style={{ fontSize: 11 }}>
                    {fmtDate(p.createdAt || p.date)}
                    {p.nextRetryAt && p.status !== "succeeded" && (
                      <div style={{ color: "var(--yellow)", fontSize: 10, marginTop: 2 }}>
                        retry: {fmtDate(p.nextRetryAt)}
                      </div>
                    )}
                  </td>
                  <td>
                    {p.status === "failed" && p._id && p.retries < p.maxRetries && (
                      <Button size="sm" variant="primary" disabled={retrying}
                        onClick={() => handleRetry(p)}>
                        ↻ Retry
                      </Button>
                    )}
                    {p.status === "processing" && (
                      <span style={{ fontSize: 11, color: "var(--text3)" }}>processing…</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          {loading ? "Loading…" : `${payments.length} of ${data?.total || 0} payments`}
          {processing.length > 0 && (
            <span style={{ marginLeft: 12, color: "var(--yellow)", fontSize: 11 }}>
              {processing.length} processing — refresh to update
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
