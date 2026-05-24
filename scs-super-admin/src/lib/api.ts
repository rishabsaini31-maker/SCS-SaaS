import axios, { AxiosHeaders, AxiosInstance } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
const SUPER_ADMIN_TOKEN_KEY = "scs-super-admin-token";

function getStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(SUPER_ADMIN_TOKEN_KEY);
}

export function hasStoredSuperAdminToken() {
  return getStoredToken() !== null;
}

function setStoredToken(token: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SUPER_ADMIN_TOKEN_KEY, token);
}

function clearStoredToken() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(SUPER_ADMIN_TOKEN_KEY);
}

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

    this.client.interceptors.request.use((config) => {
      const token = getStoredToken();
      if (token) {
        if (config.headers instanceof AxiosHeaders) {
          config.headers.set("Authorization", `Bearer ${token}`);
        } else {
          config.headers = AxiosHeaders.from(config.headers);
          config.headers.set("Authorization", `Bearer ${token}`);
        }
      }

      return config;
    });

    // Handle 401 responses (unauthorized - token expired or revoked)
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Let callers handle auth errors so super-admin actions like shop creation
        // can show a local error instead of forcing navigation.
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
    if (response.data?.token) {
      setStoredToken(response.data.token);
    }
    return response.data;
  }

  async logout() {
    await this.client.post("/scs-admin/logout");
    clearStoredToken();
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
