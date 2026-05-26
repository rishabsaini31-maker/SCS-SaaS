"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useSessionValidation } from "@/hooks/useSessionValidation";
import LoginPage from "@/components/LoginPage";
import { waitForAuthenticatedSession } from "@/lib/session";

type AuthStatus = "checking" | "authenticated" | "guest";

export function AuthGate({ children }: { children: ReactNode }) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");
  const pathname = usePathname();

  // PRODUCTION SECURITY: Enable periodic session validation for authenticated users
  useSessionValidation(authStatus === "authenticated");

  useEffect(() => {
    let cancelled = false;

    const bootstrapSession = async () => {
      try {
        const authenticated = await waitForAuthenticatedSession();

        if (cancelled) {
          return;
        }

        setAuthStatus(authenticated ? "authenticated" : "guest");
      } catch {
        if (!cancelled) {
          setAuthStatus("guest");
        }
      }
    };

    void bootstrapSession();

    return () => {
      cancelled = true;
    };
  }, []);

  if (authStatus === "checking") {
    return (
      <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#F8FAFC_0%,#E2E8F0_42%,#CBD5E1_100%)] text-slate-900">
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col lg:flex-row">
          <aside className="hidden w-[240px] shrink-0 border-r border-slate-200/80 bg-white/70 p-6 backdrop-blur lg:block">
            <div className="h-10 w-32 rounded-2xl bg-slate-200/80 animate-pulse" />
            <div className="mt-8 space-y-3">
              <div className="h-4 w-24 rounded-full bg-slate-200/80 animate-pulse" />
              <div className="h-4 w-28 rounded-full bg-slate-200/80 animate-pulse" />
              <div className="h-4 w-20 rounded-full bg-slate-200/80 animate-pulse" />
              <div className="h-4 w-32 rounded-full bg-slate-200/80 animate-pulse" />
            </div>
          </aside>

          <main className="flex-1 p-5 sm:p-8 lg:p-10">
            <div className="mb-6 flex items-center justify-between rounded-3xl border border-slate-200/80 bg-white/75 p-4 shadow-sm backdrop-blur">
              <div>
                <div className="h-4 w-28 rounded-full bg-slate-200/80 animate-pulse" />
                <div className="mt-2 h-6 w-56 max-w-full rounded-full bg-slate-200/80 animate-pulse" />
              </div>
              <div className="hidden h-10 w-28 rounded-xl bg-slate-200/80 animate-pulse sm:block" />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur animate-pulse">
                <div className="h-4 w-20 rounded-full bg-slate-200" />
                <div className="mt-4 h-8 w-24 rounded-full bg-slate-200" />
                <div className="mt-3 h-3 w-32 rounded-full bg-slate-100" />
              </div>
              <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur animate-pulse">
                <div className="h-4 w-24 rounded-full bg-slate-200" />
                <div className="mt-4 h-8 w-28 rounded-full bg-slate-200" />
                <div className="mt-3 h-3 w-40 rounded-full bg-slate-100" />
              </div>
              <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur animate-pulse">
                <div className="h-4 w-16 rounded-full bg-slate-200" />
                <div className="mt-4 h-8 w-20 rounded-full bg-slate-200" />
                <div className="mt-3 h-3 w-36 rounded-full bg-slate-100" />
              </div>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
              <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-40 rounded-full bg-slate-200/80 animate-pulse" />
                  <div className="h-9 w-24 rounded-xl bg-slate-200/80 animate-pulse" />
                </div>
                <div className="mt-5 space-y-3">
                  <div className="h-12 rounded-2xl bg-slate-200/70 animate-pulse" />
                  <div className="h-12 rounded-2xl bg-slate-200/70 animate-pulse" />
                  <div className="h-12 rounded-2xl bg-slate-200/70 animate-pulse" />
                  <div className="h-12 rounded-2xl bg-slate-200/70 animate-pulse" />
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur">
                <div className="h-5 w-36 rounded-full bg-slate-200/80 animate-pulse" />
                <div className="mt-5 space-y-4">
                  <div className="h-24 rounded-2xl bg-slate-200/70 animate-pulse" />
                  <div className="h-24 rounded-2xl bg-slate-200/70 animate-pulse" />
                </div>
              </section>
            </div>

            <div className="mt-6 flex items-center gap-3 text-sm text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" />
              <span>Checking session and restoring your workspace...</span>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (authStatus === "guest") {
    return <LoginPage redirectTo={pathname} />;
  }

  return <>{children}</>;
}
