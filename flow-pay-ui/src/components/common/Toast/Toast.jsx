import "./Toast.css";

export default function Toast({ toasts, dismiss }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast--${t.type}`}
          onClick={() => dismiss(t.id)}
        >
          <span className="toast__icon">
            {t.type === "success" ? "✓" : t.type === "error" ? "✗" : "ℹ"}
          </span>
          <span className="toast__message">{t.message}</span>
        </div>
      ))}
    </div>
  );
}
