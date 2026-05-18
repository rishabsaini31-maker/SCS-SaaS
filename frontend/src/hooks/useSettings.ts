import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export type TenantSettings = {
  id: string;
  tenantId: string;
  businessName: string | null;
  gstNumber: string | null;
  invoicePrefix: string;
  lowStockThreshold: number;
  createdAt: string;
  updatedAt: string;
};

export type UpdateSettingsInput = {
  businessName?: string;
  gstNumber?: string;
  invoicePrefix?: string;
  lowStockThreshold?: number;
};

export const useSettings = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["tenant-settings"],
    queryFn: async () => {
      const res = await api.get<TenantSettings>("/settings");
      return res.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateSettingsInput) => {
      const res = await api.patch<TenantSettings>("/settings", data);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["tenant-settings"], data);
    },
  });

  return {
    settings: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    updateSettings: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
  };
};

export const useBusinessProfile = () => {
  return useQuery({
    queryKey: ["business-profile"],
    queryFn: async () => {
      const res = await api.get<{
        businessName: string | null;
        gstNumber: string | null;
        invoicePrefix: string;
        lowStockThreshold: number;
      }>("/settings/business-profile");
      return res.data;
    },
  });
};
