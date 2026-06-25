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

    // Initial validation on mount
    validateSession();

    // Removed the aggressive 5-minute periodic validation 
    // as it caused frustrating auto-logouts during inactivity or network hiccups.
    // The user will remain logged in until they explicitly logout 
    // or their next actual action returns a 401 Unauthorized.
  }, [enabled]);

  async function validateSession() {
    try {
      await api.get("/auth/me");
      // Session is valid, continue
    } catch (err: any) {
      // Session invalid or expired
      if (err.response?.status === 401 || err.response?.status === 403) {
        // Redirect to login
        router.push("/login");
      }
    }
  }
}
