const DUMMY_USER = {
    id: "usr_01",
    name: "Arjun Jaiswal",
    email: "arjun@flowpay.io",
    role: "Admin",
    avatar: "AJ",
};

const DUMMY_STATS = {
    mrr: 48320,
    mrrChange: 12.4,
    activeSubscriptions: 1284,
    subChange: 8.1,
    successRate: 97.3,
    rateChange: 0.6,
    failedPayments: 34,
    failedChange: -5.2,
};

const DUMMY_SUBSCRIPTIONS = [
    { id: "sub_001", customer: "Nexus Corp", plan: "Enterprise", status: "active", amount: 4999, nextBilling: "2026-04-01", created: "2025-01-15" },
    { id: "sub_002", customer: "ByteLoop Inc", plan: "Pro", status: "active", amount: 999, nextBilling: "2026-04-05", created: "2025-03-10" },
    { id: "sub_003", customer: "CloudMesh", plan: "Starter", status: "trialing", amount: 199, nextBilling: "2026-03-28", created: "2026-03-14" },
    { id: "sub_004", customer: "DataSync Ltd", plan: "Enterprise", status: "active", amount: 4999, nextBilling: "2026-04-12", created: "2024-12-01" },
    { id: "sub_005", customer: "PixelFlow", plan: "Pro", status: "past_due", amount: 999, nextBilling: "2026-03-20", created: "2025-06-18" },
    { id: "sub_006", customer: "Quanta AI", plan: "Starter", status: "canceled", amount: 199, nextBilling: "—", created: "2025-09-22" },
    { id: "sub_007", customer: "Synapse Labs", plan: "Enterprise", status: "active", amount: 4999, nextBilling: "2026-04-18", created: "2025-02-07" },
    { id: "sub_008", customer: "VectorBase", plan: "Pro", status: "active", amount: 999, nextBilling: "2026-04-22", created: "2025-11-03" },
];

const DUMMY_PAYMENTS = [
    { id: "pay_001", customer: "Nexus Corp", amount: 4999, status: "succeeded", method: "card_visa", date: "2026-03-01", retries: 0 },
    { id: "pay_002", customer: "ByteLoop Inc", amount: 999, status: "succeeded", method: "card_mc", date: "2026-03-05", retries: 0 },
    { id: "pay_003", customer: "PixelFlow", amount: 999, status: "failed", method: "card_visa", date: "2026-03-20", retries: 2 },
    { id: "pay_004", customer: "CloudMesh", amount: 199, status: "processing", method: "card_amex", date: "2026-03-20", retries: 0 },
    { id: "pay_005", customer: "DataSync Ltd", amount: 4999, status: "succeeded", method: "bank_transfer", date: "2026-03-12", retries: 0 },
    { id: "pay_006", customer: "Synapse Labs", amount: 4999, status: "succeeded", method: "card_visa", date: "2026-03-18", retries: 0 },
    { id: "pay_007", customer: "Quanta AI", amount: 199, status: "refunded", method: "card_mc", date: "2026-03-08", retries: 0 },
    { id: "pay_008", customer: "VectorBase", amount: 999, status: "failed", method: "card_visa", date: "2026-03-19", retries: 3 },
];

const DUMMY_EVENTS = [
    { id: "evt_001", type: "subscription.created", service: "billing-service", payload: '{"sub_id":"sub_008","plan":"pro"}', timestamp: "2026-03-20T14:32:11Z", status: "delivered" },
    { id: "evt_002", type: "payment.failed", service: "payment-simulator", payload: '{"pay_id":"pay_008","reason":"insufficient_funds"}', timestamp: "2026-03-20T13:15:44Z", status: "delivered" },
    { id: "evt_003", type: "payment.retry_scheduled", service: "billing-service", payload: '{"pay_id":"pay_008","retry_at":"2026-03-21T13:15:44Z"}', timestamp: "2026-03-20T13:15:50Z", status: "delivered" },
    { id: "evt_004", type: "subscription.canceled", service: "account-service", payload: '{"sub_id":"sub_006","reason":"user_request"}', timestamp: "2026-03-19T09:04:22Z", status: "delivered" },
    { id: "evt_005", type: "payment.succeeded", service: "payment-simulator", payload: '{"pay_id":"pay_006","amount":4999}', timestamp: "2026-03-18T16:55:01Z", status: "delivered" },
    { id: "evt_006", type: "webhook.failed", service: "event-service", payload: '{"url":"https://nexus.corp/hook","attempt":3}', timestamp: "2026-03-18T10:22:33Z", status: "failed" },
    { id: "evt_007", type: "subscription.trial_ending", service: "billing-service", payload: '{"sub_id":"sub_003","ends_in":"8d"}', timestamp: "2026-03-17T08:00:00Z", status: "delivered" },
];

const DUMMY_WEBHOOKS = [
    { id: "wh_001", url: "https://nexus.corp/webhooks/flowpay", events: ["payment.succeeded", "payment.failed"], status: "active", lastDelivery: "2026-03-20T14:32:11Z", successRate: 98.2 },
    { id: "wh_002", url: "https://byteloop.io/hooks/billing", events: ["subscription.created", "subscription.canceled"], status: "active", lastDelivery: "2026-03-19T09:04:22Z", successRate: 100 },
    { id: "wh_003", url: "https://cloudmesh.net/pay-hook", events: ["payment.succeeded"], status: "failing", lastDelivery: "2026-03-18T10:22:33Z", successRate: 62.5 },
    { id: "wh_004", url: "https://pixelflow.app/callbacks", events: ["payment.failed", "payment.retry_scheduled"], status: "disabled", lastDelivery: "2026-03-10T12:00:00Z", successRate: 88.0 },
];

const DUMMY_PLANS = [
    { id: "plan_starter", name: "Starter", price: 199, interval: "month", features: ["5 seats", "10K API calls/mo", "Email support", "Basic analytics"], subscribers: 312, color: "#38bdf8" },
    { id: "plan_pro", name: "Pro", price: 999, interval: "month", features: ["25 seats", "100K API calls/mo", "Priority support", "Advanced analytics", "Webhooks"], subscribers: 748, color: "#818cf8" },
    { id: "plan_enterprise", name: "Enterprise", price: 4999, interval: "month", features: ["Unlimited seats", "Unlimited API calls", "24/7 dedicated support", "Custom analytics", "SLA 99.99%", "Custom integrations"], subscribers: 224, color: "#f59e0b" },
];

const MRR_CHART_DATA = [
    { month: "Oct", value: 31200 },
    { month: "Nov", value: 34800 },
    { month: "Dec", value: 38100 },
    { month: "Jan", value: 41500 },
    { month: "Feb", value: 43200 },
    { month: "Mar", value: 48320 },
];

const NAV = [
    { id: "dashboard", label: "Dashboard", icon: "⊞" },
    { id: "subscriptions", label: "Subscriptions", icon: "📦" },
    { id: "payments", label: "Payments", icon: "💳", badge: 2 },
    { id: "plans", label: "Plans", icon: "🏷" },
    { id: "events", label: "Events", icon: "⚡" },
    { id: "webhooks", label: "Webhooks", icon: "🔗" },
    { id: "simulator", label: "Simulator", icon: "🧪" },
];

const PAGE_TITLES = { dashboard: "Dashboard", subscriptions: "Subscriptions", payments: "Payments", plans: "Billing Plans", events: "Event Log", webhooks: "Webhooks", simulator: "Payment Simulator", settings: "Settings" };

const NOTIFICATION_DEFAULTS = [
    { label: "Payment failures", enabled: true },
    { label: "New subscriptions", enabled: true },
    { label: "Trial endings", enabled: true },
    { label: "Webhook errors", enabled: false },
    { label: "Monthly reports", enabled: true },
];

export {
    DUMMY_USER,
    DUMMY_STATS,
    DUMMY_SUBSCRIPTIONS,
    DUMMY_PAYMENTS,
    DUMMY_EVENTS,
    DUMMY_WEBHOOKS,
    DUMMY_PLANS,
    MRR_CHART_DATA,
    NAV,
    PAGE_TITLES,
    NOTIFICATION_DEFAULTS,
};