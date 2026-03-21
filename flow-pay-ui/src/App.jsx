import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import Sidebar  from "./components/layout/Sidebar/Sidebar";
import Topbar   from "./components/layout/Topbar/Topbar";
import Toast    from "./components/common/Toast/Toast";
import Login    from "./pages/Login/Login";
import Dashboard        from "./pages/Dashboard/Dashboard";
import Subscriptions    from "./pages/Subscriptions/Subscriptions";
import Payments         from "./pages/Payments/Payments";
import Plans            from "./pages/Plans/Plans";
import Events           from "./pages/Events/Events";
import Webhooks         from "./pages/Webhooks/Webhooks";
import PaymentSimulator from "./pages/PaymentSimulator/PaymentSimulator";
import Settings         from "./pages/Settings/Settings";
import { PAGE_TITLES }  from "./data/dummyData";
import "./styles/global.css";

function useToast() {
  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };
  const dismiss = (id) => setToasts((t) => t.filter((x) => x.id !== id));
  return { toasts, addToast, dismiss };
}

function renderPage(page, addToast) {
  const p = { addToast };
  switch (page) {
    case "dashboard":     return <Dashboard {...p} />;
    case "subscriptions": return <Subscriptions {...p} />;
    case "payments":      return <Payments {...p} />;
    case "plans":         return <Plans {...p} />;
    case "events":        return <Events {...p} />;
    case "webhooks":      return <Webhooks {...p} />;
    case "simulator":     return <PaymentSimulator {...p} />;
    case "settings":      return <Settings {...p} />;
    default:              return <Dashboard {...p} />;
  }
}

export default function App() {
  const { user, loading, logout } = useAuth();
  const [page, setPage]           = useState("dashboard");
  const { toasts, addToast, dismiss } = useToast();

  useEffect(() => { if (user) setPage("dashboard"); }, [user]);

  if (loading) {
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
                    height:"100vh", background:"var(--bg)", color:"var(--text3)",
                    fontFamily:"var(--font-head)", fontSize:14 }}>
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Login />
        <Toast toasts={toasts} dismiss={dismiss} />
      </>
    );
  }

  const handleLogout = async () => { try { await logout(); } catch {} };

  return (
    <div className="app">
      <Sidebar page={page} setPage={setPage} onSignOut={handleLogout} />
      <main className="main">
        <Topbar
          title={PAGE_TITLES[page] || "FlowPay"}
          onNotification={() => addToast("No new notifications", "info")}
          onHelp={() => addToast("Docs: docs.flowpay.io", "info")}
        />
        <div className="content">{renderPage(page, addToast)}</div>
      </main>
      <Toast toasts={toasts} dismiss={dismiss} />
    </div>
  );
}
