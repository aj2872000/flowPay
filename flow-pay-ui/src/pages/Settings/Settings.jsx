import { useState, useEffect } from "react";
import Button from "../../components/common/Button/Button";
import { useAuth } from "../../context/AuthContext";
import { useApi, useMutation } from "../../hooks/useApi";
import { accountApi } from "../../api/account.api";
import "./Settings.css";

const NOTIFICATION_KEYS = [
  { key: "paymentFailures",  label: "Payment failures"  },
  { key: "newSubscriptions", label: "New subscriptions" },
  { key: "trialEndings",     label: "Trial endings"     },
  { key: "webhookErrors",    label: "Webhook errors"    },
  { key: "monthlyReports",   label: "Monthly reports"   },
];

function Toggle({ on, onChange }) {
  return (
    <div className="settings__toggle" onClick={onChange}
      style={{ background: on ? "var(--accent)" : "var(--surface2)" }}>
      <div className="settings__toggle-knob"
        style={{ transform: on ? "translateX(16px)" : "translateX(0)" }} />
    </div>
  );
}

export default function Settings({ addToast }) {
  const { user, logout } = useAuth();

  // Single profile fetch — used for both profile form AND notifications
  const { data: profile, loading: profileLoading, refetch: refetchProfile } =
    useApi(accountApi.getProfile);

  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [notifs,      setNotifs]      = useState({});

  useEffect(() => {
    if (profile) {
      setProfileForm({ name: profile.name || "", email: profile.email || "" });
      setNotifs(profile.notifications || {});
    }
  }, [profile]);

  const { mutate: updateProfile, loading: savingProfile } = useMutation(accountApi.updateProfile);

  const handleSaveProfile = async () => {
    try {
      await updateProfile(profileForm);
      addToast("Profile saved", "success");
      refetchProfile();
    } catch (err) { addToast(err.message, "error"); }
  };

  // API Keys
  const { data: apiKeys, loading: keysLoading, refetch: refetchKeys } =
    useApi(accountApi.getApiKeys);
  const [visibleKeys,    setVisibleKeys]    = useState({});
  const [rotatedSecrets, setRotatedSecrets] = useState({});
  const { mutate: rotateKey, loading: rotating } = useMutation(accountApi.rotateApiKey);

  const handleRotate = async (keyId) => {
    if (!window.confirm("Rotate this key? The current key will be invalidated immediately.")) return;
    try {
      const res = await rotateKey(keyId);
      setRotatedSecrets((p) => ({ ...p, [keyId]: res.secret }));
      addToast("New key generated — copy it now, it won't be shown again", "success");
      refetchKeys();
    } catch (err) { addToast(err.message, "error"); }
  };

  // Notifications
  const { mutate: updateNotifs } = useMutation(accountApi.updateNotifications);

  const handleToggleNotif = async (key) => {
    const next = { ...notifs, [key]: !notifs[key] };
    setNotifs(next);
    try {
      await updateNotifs(next);
      addToast(`${key} ${next[key] ? "enabled" : "disabled"}`, "info");
    } catch (err) {
      setNotifs(notifs); // revert
      addToast(err.message, "error");
    }
  };

  // Delete account
  const { mutate: deleteAccount, loading: deleting } = useMutation(accountApi.deleteAccount);

  const handleDelete = async () => {
    if (!window.confirm("Permanently delete your account? This cannot be undone.")) return;
    if (!window.confirm("Are you absolutely sure?")) return;
    try {
      await deleteAccount();
      await logout();
    } catch (err) { addToast(err.message, "error"); }
  };

  const keys = apiKeys || [];

  return (
    <div className="settings__grid">
      {/* Profile */}
      <div className="card">
        <div className="card-header"><span className="card-title">Profile</span></div>
        {profileLoading ? (
          <div className="text-muted text-sm">Loading…</div>
        ) : (
          <>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" value={profileForm.name}
                onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" value={profileForm.email}
                onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <input className="form-input"
                value={user?.role === "admin" ? "Admin" : "User"}
                disabled style={{ opacity: 0.6 }} />
            </div>
            <Button variant="primary" onClick={handleSaveProfile} disabled={savingProfile}>
              {savingProfile ? "Saving…" : "Save Changes"}
            </Button>
          </>
        )}
      </div>

      {/* API Keys */}
      <div className="card">
        <div className="card-header"><span className="card-title">API Keys</span></div>
        {keysLoading ? (
          <div className="text-muted text-sm">Loading…</div>
        ) : keys.length === 0 ? (
          <div className="text-muted text-sm">No API keys found</div>
        ) : keys.map((k) => (
          <div key={k.id} className="form-group">
            <label className="form-label">
              {k.type === "live" ? "Live" : "Test"} Secret Key
            </label>
            {rotatedSecrets[k.id] ? (
              <div className="settings__new-key">
                <div className="settings__new-key-banner">Copy now — shown only once</div>
                <div className="flex gap-8">
                  <input className="form-input settings__key-input"
                    value={rotatedSecrets[k.id]} readOnly />
                  <Button variant="ghost" size="sm" onClick={() => {
                    navigator.clipboard?.writeText(rotatedSecrets[k.id]);
                    addToast("Copied!", "success");
                  }}>Copy</Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-8">
                <input className="form-input settings__key-input"
                  value={visibleKeys[k.id]
                    ? `${k.prefix}${"•".repeat(28)}${k.last4}`
                    : `${k.prefix}••••••••••••••••••••••••${k.last4}`}
                  readOnly />
                <Button variant="ghost" size="sm"
                  onClick={() => setVisibleKeys((p) => ({ ...p, [k.id]: !p[k.id] }))}>
                  {visibleKeys[k.id] ? "Hide" : "Show"}
                </Button>
                <Button variant="danger" size="sm" disabled={rotating}
                  onClick={() => handleRotate(k.id)}>↻</Button>
              </div>
            )}
            <div className="settings__key-meta">
              Created {new Date(k.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {/* Notifications */}
      <div className="card">
        <div className="card-header"><span className="card-title">Notifications</span></div>
        {profileLoading ? (
          <div className="text-muted text-sm">Loading…</div>
        ) : NOTIFICATION_KEYS.map((n) => (
          <div key={n.key} className="settings__notif-row">
            <span className="settings__notif-label">{n.label}</span>
            <Toggle on={!!notifs[n.key]} onChange={() => handleToggleNotif(n.key)} />
          </div>
        ))}
      </div>

      {/* Danger zone — only admin can delete */}
      {user?.role === "admin" ? (
        <div className="card">
          <div className="card-header"><span className="card-title">Danger Zone</span></div>
          <div className="settings__danger-box">
            <div className="settings__danger-title">Delete Account</div>
            <div className="text-muted text-sm">
              Permanently deletes your account and all data. Cannot be undone.
            </div>
          </div>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting…" : "Delete Account"}
          </Button>
        </div>
      ) : (
        <div className="card">
          <div className="card-header"><span className="card-title">Account</span></div>
          <div className="text-muted text-sm" style={{ padding: "8px 0" }}>
            Contact an admin to delete this account.
          </div>
          <div className="role-notice" style={{ marginTop: 8 }}>
            Your role is <strong>User</strong>. Admin actions are restricted.
          </div>
        </div>
      )}
    </div>
  );
}
