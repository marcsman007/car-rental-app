import { Link } from "react-router-dom";

function Home() {
  const token = localStorage.getItem("token");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-xl w-full text-center">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">
          Welcome to Car Rental App 🚗
        </h1>
        <p className="text-gray-600 mb-6">
          Select a car and book easily. Manage your bookings with ease.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          {token ? (
            <>
              <Link to="/cars">
                <button className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition">
                  View Cars
                </button>
              </Link>
              <Link to="/bookings">
                <button className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition">
                  My Bookings
                </button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login">
                <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                  Login
                </button>
              </Link>
              <Link to="/register">
                <button className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
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

export default Home;
