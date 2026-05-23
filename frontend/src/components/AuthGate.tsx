"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import api from "@/lib/api";
import { useSessionValidation } from "@/hooks/useSessionValidation";
import LoginPage from "@/components/LoginPage";

type AuthStatus = "checking" | "authenticated" | "guest";

export function AuthGate({ children }: { children: ReactNode }) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");

  // PRODUCTION SECURITY: Enable periodic session validation for authenticated users
  useSessionValidation(authStatus === "authenticated");

  useEffect(() => {
    // Check authentication via cookie
    api
      .get("/auth/me")
      .then(() => setAuthStatus("authenticated"))
      .catch(() => {
        setAuthStatus("guest");
      });
  }, []);

  if (authStatus === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,#F1F5F9,#E2E8F0_45%,#CBD5E1_100%)]">
        <div className="text-slate-600 text-sm font-medium">
          Checking session...
        </div>
      </div>
    );
  }

  if (authStatus === "guest") {
    return <LoginPage />;
  }

  return <>{children}</>;
}
