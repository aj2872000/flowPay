import { useState } from "react";
import { DUMMY_USER, NAV, PAGE_TITLES } from "./data";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Subscriptions from "./pages/Subscriptions";
import Payments from "./pages/Payments";
import Plans from "./pages/Plans";
import Events from "./pages/Events";
import Webhooks from "./pages/Webhooks";
import PaymentSimulator from "./pages/PaymentSimulator";
import Settings from "./pages/Settings";
import Toast from "./components/Toast";
import  "./App.css";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "info") => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };

  const dismissToast = (id) => setToasts(t => t.filter(x => x.id !== id));

  if (!loggedIn) return (
    <>
      <Login onLogin={() => setLoggedIn(true)} />
    </>
  );

  const renderPage = () => {
    const props = { addToast };
    switch (page) {
      case "dashboard": return <Dashboard />;
      case "subscriptions": return <Subscriptions {...props} />;
      case "payments": return <Payments {...props} />;
      case "plans": return <Plans {...props} />;
      case "events": return <Events />;
      case "webhooks": return <Webhooks {...props} />;
      case "simulator": return <PaymentSimulator {...props} />;
      case "settings": return <Settings {...props} />;
      default: return <Dashboard />;
    }
  };

  return (
    <>
      <div className="app">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-mark">F</div>
            <div className="logo-text">Flow<span>Pay</span></div>
          </div>
          <div className="sidebar-section">
            <div className="sidebar-label">Main</div>
            {NAV.map(n => (
              <div key={n.id} className={`nav-item ${page === n.id ? "active" : ""}`} onClick={() => setPage(n.id)}>
                <span className="nav-icon">{n.icon}</span>
                {n.label}
                {n.badge && <span className="nav-badge">{n.badge}</span>}
              </div>
            ))}
          </div>
          <div className="sidebar-section">
            <div className="sidebar-label">Account</div>
            <div className={`nav-item ${page === "settings" ? "active" : ""}`} onClick={() => setPage("settings")}>
              <span className="nav-icon">⚙</span> Settings
            </div>
            <div className="nav-item" onClick={() => setLoggedIn(false)}>
              <span className="nav-icon">↩</span> Sign Out
            </div>
          </div>
          <div className="sidebar-footer">
            <div className="user-card">
              <div className="user-avatar">{DUMMY_USER.avatar}</div>
              <div>
                <div className="user-name">{DUMMY_USER.name}</div>
                <div className="user-role">{DUMMY_USER.role}</div>
              </div>
            </div>
          </div>
        </aside>

        <main className="main">
          <div className="topbar">
            <div className="page-title">{PAGE_TITLES[page]}</div>
            <div className="topbar-right">
              <div className="topbar-btn" title="Notifications" onClick={() => addToast("No new notifications", "info")}>🔔</div>
              <div className="topbar-btn" title="Help" onClick={() => addToast("Docs coming soon", "info")}>?</div>
            </div>
          </div>
          <div className="content">{renderPage()}</div>
        </main>
      </div>

      <Toast toasts={toasts} dismiss={dismissToast} />
    </>
  );
}