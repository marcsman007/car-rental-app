import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";

function Navbar() {
  const { user, setUser } = useContext(AppContext);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="bg-black text-orange-500 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between flex-wrap relative">
      {/* Logo / Title */}
      <h2 className="flex items-center flex-wrap sm:flex-nowrap text-4xl font-bold mb-3 sm:mb-0">
        <span className="align-middle translate-y-4 whitespace-nowrap">Grace Car Rental</span>
        <span className="ml-2 flex text-[3rem] sm:text-[7rem] leading-none">
          <span className="inline-block -mr-1">›</span>
          <span className="inline-block -mr-1">›</span>
          <span className="inline-block">›</span>
        </span>
      </h2>

      {/* Hamburger Button */}
      <button
        className="sm:hidden absolute top-4 right-6 text-orange-500 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
      </button>

      {/* Navigation Links */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center sm:gap-2 gap-0 mt-3 sm:mt-0 flex-wrap w-full sm:w-auto ${
          isOpen ? "block" : "hidden"
        } sm:flex`}
      >
        <Link to="/" className="hover:text-white transition px-2 py-1 whitespace-nowrap">Home</Link>

        {!user && (
          <>
            <Link to="/login" className="hover:text-white transition px-2 py-1 whitespace-nowrap">Login</Link>
            <Link to="/register" className="hover:text-white transition px-2 py-1 whitespace-nowrap">Register</Link>
          </>
        )}

        {user && user.role === "user" && (
          <>
            <Link to="/cars" className="hover:text-white transition px-2 py-1 whitespace-nowrap">Cars</Link>
            <Link to="/bookings" className="hover:text-white transition px-2 py-1 whitespace-nowrap">Bookings</Link>
            <button
              onClick={handleLogout}
              className="text-black bg-orange-500 px-2 py-1 rounded hover:bg-orange-600 transition whitespace-nowrap"
            >
              Logout
            </button>
          </>
        )}

        {user && user.role === "admin" && (
          <>
            <Link to="/admin" className="hover:text-white transition px-2 py-1 whitespace-nowrap">Admin Dashboard</Link>
            <button
              onClick={handleLogout}
              className="text-black bg-orange-500 px-2 py-1 rounded hover:bg-orange-600 transition whitespace-nowrap"
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
