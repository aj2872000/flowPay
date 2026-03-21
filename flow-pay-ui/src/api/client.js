import axios from "axios";

// Use relative URLs in development — requests go through Vite's proxy to :8080.
// This means the browser talks to localhost:3000 (same origin) and CORS is
// never triggered. Set VITE_API_URL only for production deployments.
const BASE_URL = import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
  // withCredentials only needed when BASE_URL is a different origin (production)
  withCredentials: !!import.meta.env.VITE_API_URL,
});

// ── Attach access token to every request ──────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auto-refresh on 401 ───────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue  = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    const status   = err.response?.status;

    if (status === 401 && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) =>
          failedQueue.push({ resolve, reject })
        )
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return api(original);
          })
          .catch(Promise.reject.bind(Promise));
      }

      isRefreshing = true;
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        isRefreshing = false;
        window.dispatchEvent(new Event("auth:logout"));
        return Promise.reject(err);
      }

      try {
        const { data } = await axios.post(
          `${BASE_URL}/api/auth/refresh`,
          { refreshToken }
        );
        const newAccess  = data.data.accessToken;
        const newRefresh = data.data.refreshToken;

        localStorage.setItem("accessToken",  newAccess);
        localStorage.setItem("refreshToken", newRefresh);
        api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
        original.headers.Authorization            = `Bearer ${newAccess}`;

        processQueue(null, newAccess);
        return api(original);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.dispatchEvent(new Event("auth:logout"));
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // Enrich generic axios errors with the server's actual message
    if (err.response?.data?.error?.message) {
      err.message = err.response.data.error.message;
    } else if (err.response?.data?.message) {
      err.message = err.response.data.message;
    }

    return Promise.reject(err);
  }
);

export default api;
