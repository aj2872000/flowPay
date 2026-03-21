import "./Button.css";

export default function Button({
  children,
  variant = "ghost",
  size = "md",
  onClick,
  disabled = false,
  className = "",
  fullWidth = false,
  type = "button",
}) {
  const cls = [
    "btn",
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth ? "btn--full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
