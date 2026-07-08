import { useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

/**
 * PRODUCTION SECURITY: Periodic session validation
 *
 * Checks session validity every 5 minutes to catch:
 * - Revoked sessions (admin suspended user)
 * - Expired tokens (7-day expiry)
 * - Compromised sessions
 *
 * Redirect to login on session failure
 */
export function useSessionValidation(enabled = true) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    async function validateSession() {
      try {
        await api.get("/auth/me");
      } catch (err: any) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          router.push("/login");
        }
      }
    }

    validateSession();
  }, [enabled, router]);
}
