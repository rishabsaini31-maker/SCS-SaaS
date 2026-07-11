import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "SALESMAN";
  canOverridePrice?: boolean;
  canManageExpenses?: boolean;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface StaffMetrics {
  totalStaff: number;
  activeStaff: number;
  disabledStaff: number;
  todaysBillsByStaff: number;
}

export interface StaffPerformance {
  id: string;
  name: string;
  todaysBills: number;
  todaysSalesAmount: number;
  monthlySalesAmount: number;
}

type CreateStaffInput = {
  name: string;
  email: string;
  password: string;
  role: "OWNER" | "SALESMAN";
  canOverridePrice?: boolean;
  canPerformCashOut?: boolean;
};

type UpdateStaffInput = {
  name: string;
  email: string;
  role: "OWNER" | "SALESMAN";
  canOverridePrice?: boolean;
  canPerformCashOut?: boolean;
};

type ResetPasswordInput = {
  password: string;
};

export function useStaff() {
  const queryClient = useQueryClient();

  const listQuery = useQuery<StaffUser[]>({
    queryKey: ["staff"],
    queryFn: async () => {
      const res = await api.get<StaffUser[]>("/staff");
      return res.data;
    },
  });

  const metricsQuery = useQuery<StaffMetrics>({
    queryKey: ["staff", "metrics"],
    queryFn: async () => {
      const res = await api.get<StaffMetrics>("/staff/metrics");
      return res.data;
    },
  });

  const performanceQuery = useQuery<StaffPerformance[]>({
    queryKey: ["staff", "performance"],
    queryFn: async () => {
      const res = await api.get<StaffPerformance[]>("/staff/performance");
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateStaffInput) => {
      const res = await api.post<StaffUser>("/staff", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateStaffInput }) => {
      const res = await api.put<StaffUser>(`/staff/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await api.put<{ id: string; isActive: boolean }>(`/staff/${id}/toggle-status`, { isActive });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ResetPasswordInput }) => {
      const res = await api.post<{ success: boolean }>(`/staff/${id}/reset-password`, data);
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete<{ success: boolean }>(`/staff/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });

  return {
    staff: listQuery.data || [],
    isLoading: listQuery.isLoading,
    metrics: metricsQuery.data,
    performance: performanceQuery.data,
    createStaff: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateStaff: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    toggleStatus: toggleStatusMutation.mutateAsync,
    isToggling: toggleStatusMutation.isPending,
    resetPassword: resetPasswordMutation.mutateAsync,
    isResetting: resetPasswordMutation.isPending,
    deleteStaff: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
