import "./Sidebar.css";
import { NAV_ITEMS, DUMMY_USER } from "../../../data/dummyData";

export default function Sidebar({ page, setPage, onSignOut }) {
  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <div className="sidebar__logo-mark">F</div>
        <div className="sidebar__logo-text">
          Flow<span>Pay</span>
        </div>
      </div>

      <div className="sidebar__section">
        <div className="sidebar__label">Main</div>
        {NAV_ITEMS.map((n) => (
          <div
            key={n.id}
            className={`nav-item ${page === n.id ? "nav-item--active" : ""}`}
            onClick={() => setPage(n.id)}
          >
            <span className="nav-item__icon">{n.icon}</span>
            {n.label}
            {n.badge && <span className="nav-item__badge">{n.badge}</span>}
          </div>
        ))}
      </div>

      <div className="sidebar__section">
        <div className="sidebar__label">Account</div>
        <div
          className={`nav-item ${page === "settings" ? "nav-item--active" : ""}`}
          onClick={() => setPage("settings")}
        >
          <span className="nav-item__icon">⚙</span>
          Settings
        </div>
        <div className="nav-item" onClick={onSignOut}>
          <span className="nav-item__icon">↩</span>
          Sign Out
        </div>
      </div>

      <div className="sidebar__footer">
        <div className="sidebar__user-card">
          <div className="sidebar__user-avatar">{DUMMY_USER.avatar}</div>
          <div>
            <div className="sidebar__user-name">{DUMMY_USER.name}</div>
            <div className="sidebar__user-role">{DUMMY_USER.role}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
