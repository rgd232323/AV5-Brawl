export const AUTH_CHANGE_EVENT = "auth-change";

export function updateAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }

  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}
