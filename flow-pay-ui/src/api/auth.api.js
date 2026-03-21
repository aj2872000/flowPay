import api from "./client";

export const authApi = {
  register: (data) =>
    api.post("/api/auth/register", data).then((r) => r.data.data),

  login: async (email, password) => {
    const { data } = await api.post("/api/auth/login", { email, password });
    const { accessToken, refreshToken, user } = data.data;
    localStorage.setItem("accessToken",  accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    return user;
  },

  logout: async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    try {
      await api.post("/api/auth/logout", { refreshToken });
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  },

  me: () => api.get("/api/auth/me").then((r) => r.data.data),
};
