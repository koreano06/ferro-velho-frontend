import { createElement } from "react";
import { useLocation } from "wouter";
import { ROLE_HOME } from "../../config/authUsers";
import { useAuth } from "../../hooks/useAuth";

export default function ProtectedRoute({ component, allowedRoles }) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) {
    return null;
  }

  if (!allowedRoles.includes(user.role)) {
    const fallbackPath = ROLE_HOME[user.role] ?? "/";
    setTimeout(() => setLocation(fallbackPath), 0);
    return null;
  }

  return createElement(component);
}
