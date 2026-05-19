import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./api";

// Dashboard hooks
export function useDashboardMetrics() {
  return useQuery({
    queryKey: ["dashboard", "metrics"],
    queryFn: () => apiClient.getDashboardMetrics(),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every 60 seconds
  });
}

// Tenant hooks
export function useTenants() {
  return useQuery({
    queryKey: ["tenants"],
    queryFn: () => apiClient.listTenants(),
    staleTime: 30000,
  });
}

export function useCreateTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      businessName: string;
      ownerName: string;
      email: string;
      password: string;
      phone?: string;
      gstNumber?: string;
      address?: string;
    }) => apiClient.createTenant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "metrics"] });
    },
  });
}

export function useUpdateTenantStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { tenantId: string; status: "ACTIVE" | "SUSPENDED" }) =>
      apiClient.updateTenantStatus(data.tenantId, data.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "metrics"] });
    },
  });
}

export function useResetOwnerPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { tenantId: string; password: string }) =>
      apiClient.resetOwnerPassword(data.tenantId, data.password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
  });
}

// Auth hooks
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      apiClient.login(data.email, data.password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "me"] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function useAdminProfile() {
  return useQuery({
    queryKey: ["admin", "me"],
    queryFn: () => apiClient.getMe(),
    staleTime: Infinity,
  });
}

// Audit logs hooks
export function useAuditLogs(limit: number = 50) {
  return useQuery({
    queryKey: ["audit", "logs", limit],
    queryFn: () => apiClient.getAuditLogs(limit),
    staleTime: 10000,
  });
}
