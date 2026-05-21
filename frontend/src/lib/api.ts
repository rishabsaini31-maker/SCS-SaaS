import axios, { AxiosHeaders } from "axios";
import { frontendConfig } from "@/config/env";

const baseURL = frontendConfig.apiUrl;

// PRODUCTION SECURITY: HttpOnly Cookie-based Authentication
// Axios automatically sends cookies with 'credentials: include'
const api = axios.create({
  baseURL,
  withCredentials: true, // Send cookies with every request
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expired or revoked, clear session and redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default api;
