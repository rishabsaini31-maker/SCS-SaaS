"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "@/lib/toast";

type LoginResponse = {
  token: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isChecking, setIsChecking] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Check if already authenticated via cookie
    api
      .get("/auth/me")
      .then(() => {
        router.replace("/dashboard");
      })
      .catch(() => {
        setIsChecking(false);
      });
  }, [router]);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      setErrorMessage("");
      const response = await api.post<LoginResponse>("/auth/login", {
        email,
        password,
      });
      // Token is set in HttpOnly cookie by backend, no need to store manually
      toast.success("Logged in successfully");
      router.replace("/dashboard");
    } catch {
      setErrorMessage("Invalid email or password");
      toast.error("Invalid email or password");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_#F1F5F9,_#E2E8F0_45%,_#CBD5E1_100%)]">
        <div className="text-slate-600 text-sm font-medium">
          Checking session...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.16),_transparent_34%),linear-gradient(180deg,_#F8FAFC_0%,_#E2E8F0_100%)]">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/95 shadow-2xl backdrop-blur-sm p-8">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-blue-600">
            Owner Login
          </p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">
            Sign in to your tenant
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            One tenant, one owner account. Use the owner email and password.
          </p>
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
            <input
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              required
              type="password"
              value={password}
            />
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