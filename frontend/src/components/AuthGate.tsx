"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import api from "@/lib/api";
import { clearAuthToken, getAuthToken } from "@/lib/auth";
import LoginPage from "@/components/LoginPage";

type AuthStatus = "checking" | "authenticated" | "guest";

export function AuthGate({ children }: { children: ReactNode }) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");

  useEffect(() => {
    const token = getAuthToken();

    if (!token) {
      setAuthStatus("guest");
      return;
    }

    api
      .get("/auth/me")
      .then(() => setAuthStatus("authenticated"))
      .catch(() => {
        clearAuthToken();
        setAuthStatus("guest");
      });
  }, []);

  if (authStatus === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_#F1F5F9,_#E2E8F0_45%,_#CBD5E1_100%)]">
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
