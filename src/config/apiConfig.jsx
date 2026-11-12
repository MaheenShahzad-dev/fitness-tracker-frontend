import axios from "axios";

const apiConfig = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 10000,

});

// ============ REQUEST INTERCEPTOR ============
apiConfig.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else if (!config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ============ RESPONSE INTERCEPTOR ============
apiConfig.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      // Token expired / invalid
      localStorage.removeItem("token");
      // Redirect to login (route ke hisaab se adjust karo)
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    if (status === 403) {
      console.warn("Access denied (403)");
    }

    if (status >= 500) {
      console.error("Server error:", error.response?.data?.message || "Something went wrong");
    }

    return Promise.reject(error);
  }
);

export default apiConfig;