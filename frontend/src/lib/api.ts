import axios from "axios";

const api = axios.create({
  baseURL: "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default api;
