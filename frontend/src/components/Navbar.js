import { Link } from "react-router-dom";

function Navbar() {
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // Decode JWT to get user role
  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      return null;
    }
  };
  const user = parseJwt(token);
  const role = user?.role;

  return (
    <nav style={{ padding: "10px", background: "#333", color: "white" }}>
      <h2>Car Rental App 🚗</h2>
      <div style={{ marginTop: "10px" }}>
        <Link to="/" style={{ marginRight: "10px", color: "white" }}>Home</Link>

        {token ? (
          <>
            <Link to="/cars" style={{ marginRight: "10px", color: "white" }}>Cars</Link>
            <Link to="/bookings" style={{ marginRight: "10px", color: "white" }}>Bookings</Link>

            {role === "admin" && (
              <Link to="/admin" style={{ marginRight: "10px", color: "white" }}>Admin Dashboard</Link>
            )}

            <button 
              onClick={handleLogout} 
              style={{ color: "white", background: "red", border: "none", padding: "5px" }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ marginRight: "10px", color: "white" }}>Login</Link>
            <Link to="/register" style={{ marginRight: "10px", color: "white" }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
