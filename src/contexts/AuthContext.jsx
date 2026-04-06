import { useMemo, useState } from "react";
import { AUTH_USERS, ROLE_HOME } from "../config/authUsers";
import AuthContext from "./auth-context";

const STORAGE_KEY = "ferro-velho-session";

function readStoredSession() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.username) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredSession());

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),
    login(username, pin) {
      const normalizedUser = String(username).trim().toLowerCase();
      const found = AUTH_USERS.find(
        (item) => item.username.toLowerCase() === normalizedUser && item.pin === String(pin)
      );

      if (!found) {
        throw new Error("Usuario ou PIN invalido.");
      }

      const session = {
        username: found.username,
        role: found.role,
        name: found.name,
      };

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      setUser(session);
      return ROLE_HOME[found.role] ?? "/";
    },
    logout() {
      window.localStorage.removeItem(STORAGE_KEY);
      setUser(null);
    },
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
