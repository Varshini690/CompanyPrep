// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",  // FIXED (must use localhost)
  headers: {
    "Content-Type": "application/json",
  },
});

// Helpers
const getAccess = () => localStorage.getItem("accessToken");
const getRefresh = () => localStorage.getItem("refreshToken");

// Attach access token
api.interceptors.request.use((config) => {
  const token = getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Refresh token logic
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (!err.response || err.response.status !== 401 || originalRequest._retry) {
      return Promise.reject(err);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = "Bearer " + token;
          return api(originalRequest);
        })
        .catch((e) => Promise.reject(e));
    }

    isRefreshing = true;

    const refreshToken = getRefresh();
    if (!refreshToken) {
      isRefreshing = false;
      return Promise.reject(err);
    }

    try {
      // IMPORTANT: full URL so axios doesn’t call frontend host
      const res = await axios.post("http://localhost:8000/api/auth/refresh/", {
        refresh: refreshToken,
      });

      const newAccess = res.data.access;
      localStorage.setItem("accessToken", newAccess);

      processQueue(null, newAccess);

      originalRequest.headers.Authorization = "Bearer " + newAccess;
      return api(originalRequest);

    } catch (refreshErr) {
      processQueue(refreshErr, null);

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      return Promise.reject(refreshErr);

    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
