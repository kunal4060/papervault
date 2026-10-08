/**
 * PaperVault — Admin auth (mock).
 * Credentials: user `admin`, password `admin`.
 * Session persists in sessionStorage (cleared when tab closes).
 *
 * TODO: firebase — replace with real role check (users/{uid}.role === "admin").
 */

const KEY = "papervault:admin-auth";

export function isAdminLoggedIn() {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function adminLogin(user, pass) {
  if (user === "admin" && pass === "admin") {
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {}
    return true;
  }
  return false;
}

export function adminLogout() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {}
}
