import api from "./client";

export const accountApi = {
  getProfile:   ()     => api.get("/api/accounts/profile").then((r) => r.data.data),
  updateProfile:(data) => api.patch("/api/accounts/profile", data).then((r) => r.data.data),
  getApiKeys:   ()     => api.get("/api/accounts/api-keys").then((r) => r.data.data.keys),
  rotateApiKey: (keyId)=> api.post("/api/accounts/api-keys/rotate", { keyId }).then((r) => r.data.data),
  updateNotifications: (prefs) =>
    api.patch("/api/accounts/notifications", prefs).then((r) => r.data.data),
  deleteAccount: () => api.delete("/api/accounts/account").then((r) => r.data.data),
};
