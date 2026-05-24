"use client";

import { useEffect, useState } from "react";
import { useAdminProfile } from "@/lib/hooks";
import SuperAdminDashboard from "@/components/SuperAdminDashboard";
import SuperAdminLogin from "@/components/SuperAdminLogin";
import { hasStoredSuperAdminToken } from "@/lib/api";

export default function SuperAdminEntry() {
  const [isMounted, setIsMounted] = useState(false);
  const shouldValidateSession = isMounted && hasStoredSuperAdminToken();
  const { data: profile, isLoading, error } = useAdminProfile(
    shouldValidateSession,
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <SuperAdminLogin />;
  }

  if (profile?.admin?.id) {
    return <SuperAdminDashboard />;
  }

  return <SuperAdminLogin />;
}
