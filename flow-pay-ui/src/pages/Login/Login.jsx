import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/common/Button/Button";
import "./Login.css";

export default function Login() {
  const { login } = useAuth();
  const [form,    setForm]    = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handle = async () => {
    if (!form.email || !form.password) { setError("Please fill in all fields"); return; }
    setLoading(true);
    setError("");
    try {
      await login(form.email, form.password);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => { if (e.key === "Enter") handle(); };

  return (
    <div className="login">
      <div className="login__glow" />
      <div className="login__card">
        <div className="login__brand">
          <div className="login__logo">F</div>
          <div className="login__brand-name">Welcome to <span>FlowPay</span></div>
          <div className="login__brand-sub">Sign in to your dashboard</div>
        </div>

        {error && <div className="login__error">{error}</div>}

        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" placeholder="you@company.com"
            value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            onKeyDown={onKey} />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" placeholder="••••••••"
            value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            onKeyDown={onKey} />
        </div>

        <Button variant="primary" fullWidth size="lg" onClick={handle} disabled={loading}>
          {loading ? <><span className="login__pulse">●</span> Signing in…</> : "Sign In →"}
        </Button>
      </div>
    </div>
  );
}
