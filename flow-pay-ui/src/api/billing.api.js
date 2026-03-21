import api from "./client";

export const billingApi = {
  // Stats
  getStats: () => api.get("/api/billing/stats").then((r) => r.data.data),

  // Plans
  listPlans:  ()       => api.get("/api/billing/plans").then((r) => r.data.data.plans),
  createPlan: (data)   => api.post("/api/billing/plans", data).then((r) => r.data.data),
  updatePlan: (id, data) => api.patch(`/api/billing/plans/${id}`, data).then((r) => r.data.data),
  archivePlan:(id)     => api.delete(`/api/billing/plans/${id}`).then((r) => r.data.data),

  // Subscriptions
  listSubscriptions: (params = {}) =>
    api.get("/api/billing/subscriptions", { params }).then((r) => r.data.data),
  getSubscription: (id) =>
    api.get(`/api/billing/subscriptions/${id}`).then((r) => r.data.data),
  createSubscription: (data) =>
    api.post("/api/billing/subscriptions", data).then((r) => r.data.data),
  cancelSubscription: (id, data) =>
    api.delete(`/api/billing/subscriptions/${id}`, { data }).then((r) => r.data.data),

  // Payments
  listPayments: (params = {}) =>
    api.get("/api/billing/payments", { params }).then((r) => r.data.data),
  getPayment: (id) =>
    api.get(`/api/billing/payments/${id}`).then((r) => r.data.data),
  retryPayment: (id) =>
    api.post(`/api/billing/payments/${id}/retry`).then((r) => r.data.data),
};
