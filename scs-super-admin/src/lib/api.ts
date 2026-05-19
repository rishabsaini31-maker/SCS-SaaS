import axios, { AxiosInstance } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add token to every request
    this.client.interceptors.request.use((config) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("adminToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    // Handle 401 responses (unauthorized)
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          if (typeof window !== "undefined") {
            localStorage.removeItem("adminToken");
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      },
    );
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.client.post("/scs-admin/login", {
      email,
      password,
    });
    if (response.data.token) {
      localStorage.setItem("adminToken", response.data.token);
    }
    return response.data;
  }

  async logout() {
    await this.client.post("/scs-admin/logout");
    localStorage.removeItem("adminToken");
  }

  async getMe() {
    const response = await this.client.get("/scs-admin/me");
    return response.data;
  }

  // Dashboard endpoints
  async getDashboardMetrics() {
    const response = await this.client.get("/scs-admin/dashboard");
    return response.data;
  }

  // Tenant endpoints
  async listTenants() {
    const response = await this.client.get("/scs-admin/tenants");
    return response.data;
  }

  async createTenant(data: {
    businessName: string;
    ownerName: string;
    email: string;
    password: string;
    phone?: string;
    gstNumber?: string;
    address?: string;
  }) {
    const response = await this.client.post("/scs-admin/shops", data);
    return response.data;
  }

  async updateTenantStatus(tenantId: string, status: "ACTIVE" | "SUSPENDED") {
    const response = await this.client.patch(
      `/scs-admin/tenants/${tenantId}/status`,
      { status },
    );
    return response.data;
  }

  async resetOwnerPassword(tenantId: string, password: string) {
    const response = await this.client.post(
      `/scs-admin/tenants/${tenantId}/reset-owner-password`,
      { password },
    );
    return response.data;
  }

  // Audit logs (if implemented)
  async getAuditLogs(limit: number = 50) {
    try {
      const response = await this.client.get("/scs-admin/audit-logs", {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      // Endpoint might not exist yet
      return { logs: [] };
    }
  }
}

export const apiClient = new ApiClient();
