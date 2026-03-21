export const fmt = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

export const fmtNum = (n) => new Intl.NumberFormat("en-US").format(n);

export const fmtDate = (d) =>
  d === "—"
    ? "—"
    : new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

export const methodLabel = (m) =>
  ({
    card_visa:     "Visa ····4242",
    card_mc:       "MC ····5353",
    card_amex:     "Amex ····0005",
    bank_transfer: "Bank Transfer",
  }[m] || m);

export const EVENT_ICON_MAP = {
  "payment.succeeded":         { bg: "var(--green-bg)",   color: "var(--green)",  icon: "✓" },
  "payment.failed":            { bg: "var(--red-bg)",     color: "var(--red)",    icon: "✗" },
  "subscription.created":      { bg: "var(--accent-glow)",color: "var(--accent)", icon: "+" },
  "subscription.canceled":     { bg: "var(--surface2)",   color: "var(--text3)",  icon: "−" },
  "webhook.failed":            { bg: "var(--red-bg)",     color: "var(--red)",    icon: "⚠" },
  "payment.retry_scheduled":   { bg: "var(--yellow-bg)",  color: "var(--yellow)", icon: "↻" },
  "subscription.trial_ending": { bg: "var(--yellow-bg)",  color: "var(--yellow)", icon: "⏰" },
};
