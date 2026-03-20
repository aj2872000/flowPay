function StatCard({ label, value, change, icon, color }) {
  const up = change >= 0;
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className={`stat-change ${up ? "up" : "down"}`}>
        {up ? "↑" : "↓"} {Math.abs(change)}% <span style={{ color: "var(--text3)", fontWeight: 400 }}>vs last month</span>
      </div>
    </div>
  );
}

export default StatCard;