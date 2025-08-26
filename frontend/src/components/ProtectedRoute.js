import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, role, loading } = useContext(AppContext);

  // Show nothing or loader while checking login
  if (loading) return <div>Loading...</div>;

  // Not logged in
  if (!user) return <Navigate to="/login" replace />;

  // Admin-only route
  if (adminOnly && role !== "admin") return <Navigate to="/" replace />;

  return children;
}

export default ProtectedRoute;
