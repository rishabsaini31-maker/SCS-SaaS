import axios, { AxiosHeaders } from "axios";
import { getAuthToken } from "@/lib/auth";

import { frontendConfig } from "@/config/env";

const baseURL = frontendConfig.apiUrl;

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set("Authorization", `Bearer ${token}`);
    config.headers = headers;
  }

  return config;
});

export const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default api;
