function Badge({ status }) {
  const label = status.replace(/_/g, " ");
  return <span className={`badge ${status}`}><span className="badge-dot" />{label}</span>;
}

export default Badge;