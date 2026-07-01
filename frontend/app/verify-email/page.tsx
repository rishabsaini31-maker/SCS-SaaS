"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "@/lib/toast";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    const nextToken = searchParams.get("token") || "";
    setToken(nextToken);
    if (nextToken) {
      void verify(nextToken);
    }
  }, [searchParams]);

  const verify = async (nextToken: string) => {
    setStatus("verifying");
    try {
      await api.post("/auth/verify-email", { token: nextToken });
      setStatus("verified");
      toast.success("Email verified successfully.");
    } catch {
      setStatus("error");
      toast.error("Verification link is invalid or expired.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Email verification</h1>
        <p className="mt-2 text-sm text-slate-500">Confirm your email address to activate your account.</p>
        {status === "verifying" ? (
          <p className="mt-6 text-sm text-slate-600">Verifying your email...</p>
        ) : null}
        {status === "verified" ? (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            Your email has been verified. You can now sign in.
          </div>
        ) : null}
        {status === "error" ? (
          <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            The verification link is invalid or has expired.
          </div>
        ) : null}
        <div className="mt-4 text-sm text-slate-500">
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">Back to login</Link>
        </div>
      </div>
    </div>
  );
}
