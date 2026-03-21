import "./Badge.css";

export default function Badge({ status }) {
  const label = status.replace(/_/g, " ");
  return (
    <span className={`badge badge--${status}`}>
      <span className="badge__dot" />
      {label}
    </span>
  );
}
