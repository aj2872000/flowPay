import React, { useState } from "react";
import { DUMMY_USER, NOTIFICATION_DEFAULTS } from "../data/index";

function Settings({ addToast }) {
  const [profile, setProfile] = useState({ name: DUMMY_USER.name, email: DUMMY_USER.email });
  const [apiKey] = useState("sk_live_••••••••••••••••••••••••••4f8e");
  const [showKey, setShowKey] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATION_DEFAULTS);
  
  function Notifications({ addToast }) {
    const toggleNotification = (index) => {
      setNotifications((prev) =>
        prev.map((n, i) =>
          i === index ? { ...n, enabled: !n.enabled } : n
        )
      );
    };

    return (
      <>
        {
          notifications.map((n, i) => (
            <div key={n.label} className="flex items-center justify-between"
              style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: 13, color: "var(--text)" }}>{n.label}</span>
              <div
                onClick={() => {
                  toggleNotification(i);
                  addToast(`${n.label} ${!n.enabled ? "enabled" : "disabled"}`, "info");
                }}
                style={{
                  width: 38, height: 22, borderRadius: 11,
                  background: n.enabled ? "var(--accent)" : "var(--surface2)",
                  cursor: "pointer", position: "relative",
                  transition: "background 0.2s", border: "1px solid var(--border)"
                }}
              >
                <div style={{
                  position: "absolute", top: 2,
                  left: n.enabled ? 18 : 2,
                  width: 16, height: 16, borderRadius: "50%",
                  background: "#fff", transition: "left 0.2s",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.3)"
                }} />
              </div>
            </div>
          ))
        }
      </>
    );
  }

  return (
    <div>
      <div className="grid-2">
        <div className="card">
          <div className="card-header"><span className="card-title">Profile</span></div>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input className="form-input" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <input className="form-input" value={DUMMY_USER.role} disabled style={{ opacity: 0.6 }} />
          </div>
          <button className="btn btn-primary" onClick={() => addToast("Profile saved", "success")}>Save Changes</button>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">API Keys</span></div>
          <div className="form-group">
            <label className="form-label">Live Secret Key</label>
            <div className="flex gap-8">
              <input className="form-input" value={showKey ? "sk_live_abcdef1234567890abcdef1234567890_4f8e" : apiKey} readOnly style={{ fontFamily: "var(--font-mono)", fontSize: 12 }} />
              <button className="btn btn-ghost btn-sm" onClick={() => setShowKey(s => !s)}>{showKey ? "Hide" : "Show"}</button>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Test Secret Key</label>
            <div className="flex gap-8">
              <input className="form-input" value="sk_test_••••••••••••••••••••••••••9a2c" readOnly style={{ fontFamily: "var(--font-mono)", fontSize: 12 }} />
              <button className="btn btn-ghost btn-sm">Show</button>
            </div>
          </div>
          <div className="flex gap-8">
            <button className="btn btn-ghost" onClick={() => addToast("API key copied", "info")}>📋 Copy Key</button>
            <button className="btn btn-danger" onClick={() => addToast("New key generated", "success")}>↻ Rotate Key</button>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Notifications</span></div>
          <Notifications addToast={addToast} />
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Danger Zone</span></div>
          <div style={{ padding: "16px", background: "var(--red-bg)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(245,101,101,0.2)", marginBottom: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Delete Account</div>
            <div className="text-muted text-sm">Permanently delete your account and all data. This cannot be undone.</div>
          </div>
          <button className="btn btn-danger" onClick={() => addToast("Are you sure? This is irreversible.", "error")}>Delete Account</button>
        </div>
      </div>
    </div>
  );
}

export default Settings;