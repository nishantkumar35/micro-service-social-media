import axios from "axios";

const axiosInstance = axios.create({
  // baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:3000",
  baseURL:"http://localhost:3000",
});

// Request interceptor to add the token to the headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Backend returns 429 for invalid tokens (non-standard)
    if (error.response && (error.response.status === 401 || error.response.status === 429)) {
      console.warn("Auth error detected, clearing session...");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Only redirect if we're not already on the login page
      if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
