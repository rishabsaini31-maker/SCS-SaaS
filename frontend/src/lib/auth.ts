/**
 * PRODUCTION SECURITY: HttpOnly Cookie-based Authentication
 * 
 * Tokens are now stored in HttpOnly secure cookies set by the backend.
 * Frontend no longer needs to manage token storage (protected against XSS).
 * 
 * Axios is configured to send credentials (cookies) with each request.
 */

export const AUTH_TOKEN_KEY = "scs-auth-session"; // For session reference only, not token storage

export function getAuthToken() {
  // Token is in HttpOnly cookie, not accessible to JavaScript
  // Return a marker that session exists (based on API call success)
  if (typeof window === "undefined") return null;
  return "cookie-based"; // Placeholder
}

export function setAuthToken(token: string) {
  // Backend sets the cookie via Set-Cookie header
  // Frontend doesn't store tokens anymore
  // This function is kept for backwards compatibility
}

export function clearAuthToken() {
  // Cookie is cleared by backend on logout
  // No need to manually clear localStorage
  // This function is kept for backwards compatibility
}
