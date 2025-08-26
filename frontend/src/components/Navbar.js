import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";

function Navbar() {
  const { user, setUser } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null); // ✅ update context
    navigate("/login");
  };

  return (
    <nav style={{ padding: "10px", background: "#333", color: "white" }}>
      <h2>Car Rental App 🚗</h2>
      <div style={{ marginTop: "10px" }}>
        <Link to="/" style={{ marginRight: "10px", color: "white" }}>Home</Link>

        {!user && (
          <>
            <Link to="/login" style={{ marginRight: "10px", color: "white" }}>Login</Link>
            <Link to="/register" style={{ marginRight: "10px", color: "white" }}>Register</Link>
          </>
        )}

        {user && user.role === "user" && (
          <>
            <Link to="/cars" style={{ marginRight: "10px", color: "white" }}>Cars</Link>
            <Link to="/bookings" style={{ marginRight: "10px", color: "white" }}>Bookings</Link>
            <button 
              onClick={handleLogout} 
              style={{ color: "white", background: "red", border: "none", padding: "5px" }}
            >
              Logout
            </button>
          </>
        )}

        {user && user.role === "admin" && (
          <>
            <Link to="/admin" style={{ marginRight: "10px", color: "white" }}>Admin Dashboard</Link>
            <button 
              onClick={handleLogout} 
              style={{ color: "white", background: "red", border: "none", padding: "5px" }}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
