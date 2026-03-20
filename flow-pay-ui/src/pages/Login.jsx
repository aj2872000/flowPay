import React, { useState } from "react";

function Login({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handle = () => {
    if (!form.email || !form.password) { setErr("Please fill in all fields"); return; }
    setLoading(true); setErr("");
    setTimeout(() => { setLoading(false); onLogin(); }, 1200);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(79,142,247,0.08) 0%, transparent 70%)" }} />
      <div style={{ width: 400, padding: "40px", background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: 16, boxShadow: "0 24px 80px rgba(0,0,0,0.6)", position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, background: "var(--accent)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 24, color: "#fff", margin: "0 auto 16px", boxShadow: "0 0 30px var(--accent-glow)" }}>F</div>
          <div style={{ fontFamily: "var(--font-head)", fontSize: 22, fontWeight: 800 }}>Welcome to <span style={{ color: "var(--accent)" }}>FlowPay</span></div>
          <div className="text-muted text-sm" style={{ marginTop: 4 }}>Sign in to your dashboard</div>
        </div>
        {err && <div style={{ background: "var(--red-bg)", color: "var(--red)", border: "1px solid rgba(245,101,101,0.2)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13 }}>{err}</div>}
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" placeholder="you@company.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} onKeyDown={e => e.key === "Enter" && handle()} />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} onKeyDown={e => e.key === "Enter" && handle()} />
        </div>
        <button className="btn btn-primary w-full" style={{ justifyContent: "center", padding: "11px", fontSize: 14, marginTop: 4, opacity: loading ? 0.7 : 1 }} onClick={handle} disabled={loading}>
          {loading ? <><span className="pulse">●</span> Signing in…</> : "Sign In →"}
        </button>
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <span className="text-muted text-sm">Demo: use any email + password</span>
        </div>
      </div>
    </div>
  );
}

export default Login;