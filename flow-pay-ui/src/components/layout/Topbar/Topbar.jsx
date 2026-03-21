import "./Topbar.css";

export default function Topbar({ title, onNotification, onHelp }) {
  return (
    <div className="topbar">
      <div className="topbar__title">{title}</div>
      <div className="topbar__right">
        <button className="topbar__btn" title="Notifications" onClick={onNotification}>🔔</button>
        <button className="topbar__btn" title="Help" onClick={onHelp}>?</button>
      </div>
    </div>
  );
}
