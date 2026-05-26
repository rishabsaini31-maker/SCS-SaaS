import api from "@/lib/api";

const AUTH_CHECK_RETRY_DELAY_MS = 200;
const AUTH_CHECK_RETRY_ATTEMPTS = 5;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function waitForAuthenticatedSession(
  attempts = AUTH_CHECK_RETRY_ATTEMPTS,
  delayMs = AUTH_CHECK_RETRY_DELAY_MS,
) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      await api.get("/auth/me");
      return true;
    } catch (error) {
      const responseStatus = (error as { response?: { status?: number } })
        .response?.status;

      if (responseStatus !== 401 && responseStatus !== 403) {
        throw error;
      }

      if (attempt < attempts - 1) {
        await sleep(delayMs);
      }
    }
  }

  return false;
}

export function getLoginRedirectTarget(pathname?: string | null) {
  if (!pathname || pathname === "/login") {
    return "/dashboard";
  }

  return pathname;
}
