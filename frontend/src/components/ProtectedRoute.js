import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem("token");

  if (!token) {
    // Not logged in
    return <Navigate to="/login" replace />;
  }

  // Decode JWT to get user role
  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      return null;
    }
  };

  const user = parseJwt(token);

  if (adminOnly && user?.role !== "admin") {
    // Not an admin
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
