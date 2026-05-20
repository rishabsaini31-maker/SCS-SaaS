import axios, { AxiosInstance } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    // PRODUCTION SECURITY: HttpOnly Cookie-based Authentication
    this.client = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true, // Send cookies with every request
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Handle 401 responses (unauthorized - token expired or revoked)
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          // Token expired or invalid, cookie will be cleared by backend
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      },
    );
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.client.post("/scs-auth/login", {
      email,
      password,
    });
    // Token is set in HttpOnly cookie by backend, no need to store manually
    return response.data;
  }

  async logout() {
    await this.client.post("/scs-auth/logout");
    // Cookie is cleared by backend on logout
  }

  async getMe() {
    const response = await this.client.get("/scs-auth/me");
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
