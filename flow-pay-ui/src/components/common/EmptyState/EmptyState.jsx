import "./EmptyState.css";

export default function EmptyState({ icon = "📭", text = "No data found" }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">{icon}</div>
      <div className="empty-state__text">{text}</div>
    </div>
  );
}
