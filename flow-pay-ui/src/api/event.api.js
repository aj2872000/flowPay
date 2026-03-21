import api from "./client";

export const eventApi = {
  listEvents: (params = {}) =>
    api.get("/api/events/events", { params }).then((r) => r.data.data),
  getEvent: (id) =>
    api.get(`/api/events/events/${id}`).then((r) => r.data.data),

  listWebhooks: () =>
    api.get("/api/events/webhooks").then((r) => r.data.data.webhooks),
  createWebhook: (data) =>
    api.post("/api/events/webhooks", data).then((r) => r.data.data),
  updateWebhook: (id, data) =>
    api.patch(`/api/events/webhooks/${id}`, data).then((r) => r.data.data),
  deleteWebhook: (id) =>
    api.delete(`/api/events/webhooks/${id}`).then((r) => r.data.data),
  testWebhook: (id) =>
    api.post(`/api/events/webhooks/${id}/test`).then((r) => r.data.data),
};
