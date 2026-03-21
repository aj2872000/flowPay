import "./StatCard.css";

export default function StatCard({ label, value, change, icon, color }) {
  const up = change >= 0;
  return (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-card__icon">{icon}</div>
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value">{value}</div>
      <div className={`stat-card__change stat-card__change--${up ? "up" : "down"}`}>
        {up ? "↑" : "↓"} {Math.abs(change)}%{" "}
        <span className="stat-card__change-label">vs last month</span>
      </div>
    </div>
  );
}
