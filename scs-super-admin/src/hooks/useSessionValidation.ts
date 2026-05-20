import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";

/**
 * PRODUCTION SECURITY: Periodic session validation for super-admin
 * 
 * Checks session validity every 5 minutes to catch:
 * - Revoked sessions
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
      await apiClient.getMe();
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
