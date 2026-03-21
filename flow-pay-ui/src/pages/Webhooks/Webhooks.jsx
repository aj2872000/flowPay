import { useState } from "react";
import Badge    from "../../components/common/Badge/Badge";
import Button   from "../../components/common/Button/Button";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import Modal, { ModalActions } from "../../components/common/Modal/Modal";
import { useApi, useMutation } from "../../hooks/useApi";
import { eventApi } from "../../api/event.api";
import "./Webhooks.css";

const ALL_EVENT_TYPES = [
  "payment.succeeded",
  "payment.failed",
  "payment.retry_scheduled",
  "subscription.created",
  "subscription.canceled",
  "subscription.trial_ending",
  "webhook.test",
];

export default function Webhooks({ addToast }) {
  const { data: webhooks, loading, error, refetch } = useApi(eventApi.listWebhooks, []);

  const [showModal,  setShowModal]  = useState(false);
  const [form, setForm] = useState({ url: "", events: [] });
  const [testResults, setTestResults] = useState({});

  const { mutate: createWebhook, loading: creating } = useMutation(eventApi.createWebhook);
  const { mutate: deleteWebhook } = useMutation(eventApi.deleteWebhook);
  const { mutate: testWebhook,  loading: testing }  = useMutation(eventApi.testWebhook);

  const toggleEvent = (ev) =>
    setForm((p) => ({
      ...p,
      events: p.events.includes(ev) ? p.events.filter((e) => e !== ev) : [...p.events, ev],
    }));

  const handleCreate = async () => {
    if (!form.url)            { addToast("URL is required", "error"); return; }
    if (!form.events.length)  { addToast("Select at least one event", "error"); return; }
    try {
      await createWebhook({ url: form.url, events: form.events });
      addToast("Webhook registered", "success");
      setShowModal(false);
      setForm({ url: "", events: [] });
      refetch();
    } catch (err) { addToast(err.message, "error"); }
  };

  const handleDelete = async (wh) => {
    if (!window.confirm(`Delete webhook for ${wh.url}?`)) return;
    try {
      await deleteWebhook(wh._id);
      addToast("Webhook deleted", "success");
      refetch();
    } catch (err) { addToast(err.message, "error"); }
  };

  const handleTest = async (wh) => {
    try {
      const result = await testWebhook(wh._id);
      setTestResults((p) => ({ ...p, [wh._id]: result }));
      addToast(
        result.status === "delivered"
          ? `✓ Ping delivered (${result.responseCode}) in ${result.responseTime}ms`
          : `✗ Ping failed: ${result.error || "unknown error"}`,
        result.status === "delivered" ? "success" : "error"
      );
    } catch (err) { addToast(err.message, "error"); }
  };

  const list = webhooks || [];

  return (
    <div>
      <div className="webhooks__header">
        <div>
          <div className="webhooks__title">Webhooks</div>
          <div className="text-muted text-sm">Manage event delivery to external endpoints</div>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>+ Register Webhook</Button>
      </div>

      {error && <div className="api-error">{error}</div>}

      {loading ? (
        <div className="text-muted text-sm">Loading webhooks…</div>
      ) : list.length === 0 ? (
        <EmptyState icon="🔗" text="No webhooks registered yet" />
      ) : list.map((w) => (
        <div className="webhook-card" key={w._id}>
          <div className="webhook-card__header">
            <span className="webhook-card__url">{w.url}</span>
            <div className="flex items-center gap-8">
              <Badge status={w.status} />
              <Button size="sm" disabled={testing}
                onClick={() => handleTest(w)}>
                {testing ? "…" : "Test"}
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleDelete(w)}>Delete</Button>
            </div>
          </div>

          <div className="webhook-card__events">
            {(w.events || []).map((ev) => (
              <span key={ev} className="webhook-card__chip">{ev}</span>
            ))}
          </div>

          <div className="webhook-card__meta">
            <span className="text-muted text-sm">
              Last delivery:{" "}
              <span className="mono">
                {w.lastDeliveryAt ? new Date(w.lastDeliveryAt).toLocaleString() : "Never"}
              </span>
            </span>
            <span className="text-muted text-sm">
              Success rate:{" "}
              <span
                className="font-mono fw-bold"
                style={{
                  color: w.successRate >= 90 ? "var(--green)"
                       : w.successRate >= 70 ? "var(--yellow)"
                       : "var(--red)",
                }}
              >
                {w.successRate ?? 100}%
              </span>
            </span>
            <span className="text-muted text-sm">
              Deliveries: <span className="mono">{w.totalDeliveries ?? 0}</span>
            </span>
          </div>

          <div className="mini-progress" style={{ marginTop: 10 }}>
            <div
              className="mini-progress__fill"
              style={{
                width: `${w.successRate ?? 100}%`,
                background:
                  (w.successRate ?? 100) >= 90 ? "var(--green)"
                : (w.successRate ?? 100) >= 70 ? "var(--yellow)"
                : "var(--red)",
              }}
            />
          </div>

          {testResults[w._id] && (
            <div className={`webhook-card__test-result webhook-card__test-result--${testResults[w._id].status}`}>
              {testResults[w._id].status === "delivered"
                ? `✓ Last test: ${testResults[w._id].responseCode} in ${testResults[w._id].responseTime}ms`
                : `✗ Last test failed: ${testResults[w._id].error}`}
            </div>
          )}
        </div>
      ))}

      {showModal && (
        <Modal title="Register Webhook" subtitle="We'll POST events to your endpoint in real time"
          onClose={() => setShowModal(false)}>
          <div className="form-group">
            <label className="form-label">Endpoint URL</label>
            <input className="form-input" placeholder="https://your-server.com/webhooks"
              value={form.url} onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Events to Subscribe</label>
            <div className="webhooks__event-checkboxes">
              {ALL_EVENT_TYPES.map((ev) => (
                <label key={ev} className="webhooks__event-check">
                  <input type="checkbox" checked={form.events.includes(ev)}
                    onChange={() => toggleEvent(ev)} />
                  <span className="mono" style={{ fontSize: 12 }}>{ev}</span>
                </label>
              ))}
            </div>
          </div>
          <ModalActions>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreate} disabled={creating}>
              {creating ? "Registering…" : "Register"}
            </Button>
          </ModalActions>
        </Modal>
      )}
    </div>
  );
}
