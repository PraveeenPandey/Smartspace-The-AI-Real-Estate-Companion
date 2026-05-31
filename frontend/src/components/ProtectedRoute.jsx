import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

function ProtectedRoute({ allowedRoles, children }) {
  const { session } = useAuth();
  const location = useLocation();

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!allowedRoles.includes(session.role)) {
    return <Navigate to={session.role === "admin" ? "/admin" : "/app"} replace />;
  }

  return children;
}

export default ProtectedRoute;
