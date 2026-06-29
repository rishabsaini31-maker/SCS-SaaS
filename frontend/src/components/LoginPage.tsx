"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { toast } from "@/lib/toast";
import {
  getLoginRedirectTarget,
  waitForAuthenticatedSession,
} from "@/lib/session";

type LoginResponse = {
  user?: {
    role?: string;
  };
};

type LoginPageProps = {
  redirectTo?: string;
};

export default function LoginPage({ redirectTo }: LoginPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const redirectTarget = getLoginRedirectTarget(
    redirectTo ?? searchParams.get("redirectTo"),
  );
  const redirectLabel =
    redirectTarget === "/dashboard"
      ? "Dashboard"
      : redirectTarget
          .replace(/^\//, "")
          .split("/")
          .filter(Boolean)
          .map((segment) => segment.replace(/-/g, " "))
          .join(" / ");

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        const authenticated = await waitForAuthenticatedSession();

        if (cancelled) {
          return;
        }

        if (authenticated) {
          router.replace(redirectTarget);
          return;
        }

        setIsChecking(false);
      } catch {
        if (!cancelled) {
          setIsChecking(false);
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [redirectTarget, router]);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      setErrorMessage("");
      const res = await api.post<LoginResponse>("/auth/login", {
        email,
        password,
      });

      const authenticated = await waitForAuthenticatedSession();

      if (!authenticated) {
        throw new Error("Session was not ready after login");
      }

      toast.success("Logged in successfully");
      const userRole = res.data?.user?.role;
      const finalRedirect = userRole === "SALESMAN" ? "/mobile/dashboard" : redirectTarget;
      
      // Force a full browser reload to clear any Next.js router cache and ensure all auth providers update
      window.location.href = finalRedirect;
    } catch {
      setErrorMessage("Invalid email or password");
      toast.error("Invalid email or password");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,#F1F5F9,#E2E8F0_45%,#CBD5E1_100%)]">
        <div className="text-slate-600 text-sm font-medium">
          Checking session...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.16),transparent_34%),linear-gradient(180deg,#F8FAFC_0%,#E2E8F0_100%)]">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/95 shadow-2xl backdrop-blur-sm p-8">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-blue-600">
            Owner & Staff Login
          </p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">
            Sign in to your account
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Owners and staff members can log in here.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            Returning to {redirectLabel}
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>
          {errorMessage ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </div>
          ) : null}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Email
            </label>
            <input
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="owner@business.com"
              required
              type="email"
              value={email}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Password
            </label>
            <div className="relative">
              <input
                className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-20 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                required
                type={showPassword ? "text" : "password"}
                value={password}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-blue-600 hover:text-blue-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <button
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
