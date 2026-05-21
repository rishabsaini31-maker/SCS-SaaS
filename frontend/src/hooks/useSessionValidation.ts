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
export function useSessionValidation() {
  const router = useRouter();

  useEffect(() => {
    // Initial validation on mount
    validateSession();

    // Set up periodic validation every 5 minutes (300,000ms)
    const validationInterval = setInterval(validateSession, 5 * 60 * 1000);

    return () => clearInterval(validationInterval);
  }, []);

  async function validateSession() {
    try {
      await api.get("/auth/me");
      // Session is valid, continue
    } catch (err: any) {
      // Session invalid or expired
      if (err.response?.status === 401 || err.response?.status === 403) {
        // Redirect to login (backend will also handle this via error interceptor)
        router.push("/login");
      }
    }
  }
}
