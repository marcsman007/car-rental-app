import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";

function Navbar() {
  const { user, setUser } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="bg-black text-orange-500 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
      {/* Logo / Title */}
      <h2 className="flex items-center text-4xl font-bold">
        <span className="align-middle translate-y-3">CARUMA</span>
        <span className="ml-2 flex text-[7rem] leading-none">
          <span className="inline-block -mr-1">›</span>
          <span className="inline-block -mr-1">›</span>
          <span className="inline-block">›</span>
        </span>
      </h2>

      {/* Navigation Links */}
      <div className="mt-3 sm:mt-0 flex flex-wrap items-center gap-4">
        <Link to="/" className="hover:text-white transition">Home</Link>

        {!user && (
          <>
            <Link to="/login" className="hover:text-white transition">Login</Link>
            <Link to="/register" className="hover:text-white transition">Register</Link>
          </>
        )}

        {user && user.role === "user" && (
          <>
            <Link to="/cars" className="hover:text-white transition">Cars</Link>
            <Link to="/bookings" className="hover:text-white transition">Bookings</Link>
            <button 
              onClick={handleLogout} 
              className="text-black bg-orange-500 px-3 py-1 rounded hover:bg-orange-600 transition"
            >
              Logout
            </button>
          </>
        )}

        {user && user.role === "admin" && (
          <>
            <Link to="/admin" className="hover:text-white transition">Admin Dashboard</Link>
            <button 
              onClick={handleLogout} 
              className="text-black bg-orange-500 px-3 py-1 rounded hover:bg-orange-600 transition"
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
