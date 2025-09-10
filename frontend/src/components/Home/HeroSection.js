// HeroSection.js
import { Link } from "react-router-dom";

function HeroSection({ token }) {
  return (
    <div className="w-full max-w-7xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-500 text-white py-20 px-6 sm:px-12 lg:px-16 rounded-3xl shadow-md flex flex-col items-center text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          Welcome to Caruma 🚗
        </h1>
        <p className="text-lg sm:text-xl mb-6">
          Browse our cars and book your next adventure with ease.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          {token ? (
            <>
              <Link to="/cars">
                <button className="px-6 py-3 bg-white text-orange-500 font-semibold rounded-lg hover:bg-gray-100 transition">
                  View Cars
                </button>
              </Link>
              <Link to="/bookings">
                <button className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition">
                  My Bookings
                </button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login">
                <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                  Login
                </button>
              </Link>
              <Link to="/register">
                <button className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
                  Register
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
