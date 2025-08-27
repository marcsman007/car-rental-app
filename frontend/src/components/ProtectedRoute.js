import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useContext(AppContext);

  // Show loader while checking login status
  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-orange-500"></div>
      </div>
    );

  // Redirect if not logged in
  if (!user) return <Navigate to="/login" replace />;

  // Admin-only route
  if (adminOnly && user.role !== "admin") return <Navigate to="/" replace />;

  return children;
}

export default ProtectedRoute;
