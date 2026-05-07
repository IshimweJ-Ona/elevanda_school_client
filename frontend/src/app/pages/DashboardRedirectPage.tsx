import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function DashboardRedirectPage() {
  const { user, authenticated } = useAuth();

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === "PARENT") {
    return <Navigate to="/app/parent" replace />;
  }

  return <Navigate to="/app/parent" replace />;
}
