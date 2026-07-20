"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAdminProfile, useLogin } from "@/lib/hooks";

export default function SuperAdminLogin() {
  const router = useRouter();
  const login = useLogin();
  const { data: profile, isLoading } = useAdminProfile();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);

  useEffect(() => {
    if (profile?.admin?.id) {
      router.replace("/");
    }
  }, [profile, router]);

  const formatRetryAfter = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0 && secs > 0) return `${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m`;
    return `${secs}s`;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMessage("");
    setRetryAfter(null);

    if (attemptsRemaining <= 0) {
      setErrorMessage("Too many login attempts. Please wait before trying again.");
      return;
    }

    setAttemptsRemaining((current) => current - 1);

    try {
      await login.mutateAsync({ email, password });
      setAttemptsRemaining(5);
      window.location.href = "/";
    } catch (error: any) {
      if (error?.response?.status === 429) {
        const retryAfterSeconds = error.response.data?.retryAfter;
        setRetryAfter(retryAfterSeconds || null);
        setErrorMessage(
          retryAfterSeconds
            ? `Too many login attempts. Please try again in ${formatRetryAfter(retryAfterSeconds)}.`
            : "Too many login attempts. Please try again in 15 minutes.",
        );
      } else if (error?.response?.status === 401 || error?.response?.status === 403) {
        setErrorMessage("Invalid super-admin credentials");
      } else {
        setErrorMessage(error?.message || "Unable to sign in");
      }
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_26%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] text-on-surface">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-8 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="relative overflow-hidden rounded-4xl border border-white/60 bg-slate-950 px-8 py-10 text-white shadow-[0_30px_80px_rgba(15,23,42,0.28)] lg:px-12 lg:py-14">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(59,130,246,0.25),transparent_35%),linear-gradient(225deg,rgba(14,165,233,0.18),transparent_30%)]" />
            <div className="absolute -right-16 top-8 h-52 w-52 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />

            <div className="relative z-10 flex h-full flex-col justify-between gap-10">
              <div>
                <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-100">
                  SCS Super Admin
                </p>
                <h1 className="mt-6 max-w-xl text-4xl font-black leading-[1.05] tracking-tight text-white md:text-6xl">
                  Control every shop from one secure command center.
                </h1>
                <p className="mt-5 max-w-xl text-base leading-7 text-slate-200 md:text-lg">
                  Sign in to onboard tenants, review live activity, manage
                  billing, and keep the whole SaaS platform under one admin
                  workspace.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  ["Tenant onboarding", "Create new shops in seconds"],
                  ["Live metrics", "Monitor active sessions and usage"],
                  ["Secure access", "JWT + session checks enabled"],
                ].map(([title, description]) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur"
                  >
                    <div className="text-sm font-semibold text-white">
                      {title}
                    </div>
                    <div className="mt-1 text-xs leading-5 text-slate-300">
                      {description}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-white">Single sign-in flow</div>
                  <div className="mt-1 leading-6">
                    Login once, then work across dashboard, tenants, reports,
                    and settings.
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-white">Built for super-admins</div>
                  <div className="mt-1 leading-6">
                    This page is only for platform administrators, not shop
                    owners.
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="flex items-center">
            <div className="w-full rounded-4xl border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl md:p-8">
              <div className="mb-8">
                <p className="text-xs font-bold uppercase tracking-[0.32em] text-primary">
                  Super Admin Access
                </p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-on-surface">
                  Sign in to SCS Admin
                </h2>
                <p className="mt-2 text-sm leading-6 text-secondary">
                  Use the super-admin email and password configured on the
                  server.
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                {errorMessage ? (
                  <div className={`rounded-2xl px-4 py-3 text-sm ${
                    retryAfter
                      ? "border border-amber-200 bg-amber-50 text-amber-700"
                      : "border border-rose-200 bg-rose-50 text-rose-700"
                  }`}>
                    {errorMessage}
                    {retryAfter && (
                      <span className="mt-1 block text-xs">
                        Try again in {formatRetryAfter(retryAfter)}
                      </span>
                    )}
                  </div>
                ) : null}

                {attemptsRemaining > 0 && !retryAfter ? (
                  <p className="text-xs text-slate-500">
                    {attemptsRemaining} attempt{attemptsRemaining !== 1 ? "s" : ""} remaining
                  </p>
                ) : null}

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-secondary">
                    Email
                  </label>
                  <input
                    className="w-full rounded-2xl border border-outline-variant bg-surface-container-low px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@company.com"
                    required
                    type="email"
                    value={email}
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-secondary">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      className="w-full rounded-2xl border border-outline-variant bg-surface-container-low px-4 py-3 pr-20 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
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
                      className="absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-primary hover:text-primary/80"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <button
                  className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-on-primary transition hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={login.isPending}
                  type="submit"
                >
                  {login.isPending ? "Signing in..." : "Sign in"}
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
