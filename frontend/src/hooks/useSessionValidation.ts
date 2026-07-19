import { useEffect, useRef } from "react";
import api from "@/lib/api";

/**
 * PRODUCTION SECURITY: Periodic session validation
 *
 * Silently checks session validity every 10 minutes.
 * If the access token has expired, the axios interceptor will
 * automatically refresh it using the refresh-token cookie.
 *
 * Only forces logout when the refresh token itself has expired
 * (i.e. the user has been inactive for 30+ days) or the session
 * was explicitly revoked by an admin.
 */
export function useSessionValidation(enabled = true) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    async function validateSession() {
      try {
        // This call goes through the axios interceptor, which will
        // automatically refresh the access token if it has expired.
        // We don't need to redirect on failure — the interceptor
        // handles everything. If even the refresh fails, the
        // interceptor rejects and the user will see the login page
        // via the AuthGate on the next navigation.
        await api.get("/auth/me");
      } catch {
        // Silently ignore — do NOT redirect to /login here.
        // The AuthGate component already handles the guest state.
      }
    }

    // Initial validation
    void validateSession();

    // Periodic validation every 10 minutes (keeps session alive)
    intervalRef.current = setInterval(() => {
      void validateSession();
    }, 10 * 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled]);
}
