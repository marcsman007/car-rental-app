// Home.js
import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import HeroSection from "../components/Home/HeroSection";
import SearchBar from "../components/Home/SearchBar";

function Home() {
  const { cars, role, loading, fetchCars } = useContext(AppContext);
  const token = localStorage.getItem("token");

  const [filteredCars, setFilteredCars] = useState([]);
  const [featuredCar, setFeaturedCar] = useState(null);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  useEffect(() => {
    setFilteredCars(cars);
    setFeaturedCar(cars.length > 0 ? cars[0] : null);
  }, [cars]);

  const handleSearch = (query) => {
    const filtered = cars.filter(
      (car) =>
        car.make.toLowerCase().includes(query.toLowerCase()) ||
        car.model.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCars(filtered);
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return (
      <>
        {"⭐".repeat(fullStars)}
        {halfStar ? "✩" : ""}
        {"☆".repeat(emptyStars)}
      </>
    );
  };

  if (loading) return <p className="text-center text-gray-600 mt-6">Loading cars...</p>;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <HeroSection token={token} />

      {/* Search Bar */}
      <SearchBar onSearch={handleSearch} />

      {/* Featured Car */}
      {featuredCar && (
        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Featured Car</h2>
          <Link to={`/cars/${featuredCar._id}`}>
            <div className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-500 p-6 rounded-3xl shadow-lg flex flex-col md:flex-row items-center gap-6 text-white relative hover:shadow-2xl transition cursor-pointer">
              <div className="relative w-full md:w-1/3">
                <img
                  src={`/images/${featuredCar.make.toLowerCase().replace(/\s+/g, "-")}-${featuredCar.model.toLowerCase().replace(/\s+/g, "-")}.jpg`}
                  alt={`${featuredCar.make} ${featuredCar.model}`}
                  className="w-full h-48 object-cover rounded-2xl border-4 border-white"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/images/default.jpg";
                  }}
                />
                <span className="absolute top-2 left-2 bg-yellow-400 text-gray-900 font-bold text-xs px-3 py-1 rounded-full shadow-md">
                  Featured
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl md:text-3xl font-bold">
                  {featuredCar.make} {featuredCar.model}
                </h3>
                <p className="text-lg">Price: ₱{featuredCar.pricePerDay}/day</p>
                <p className="text-lg">
                  Avg Rating: {featuredCar.averageRating?.toFixed(1)}{" "}
                  {renderStars(featuredCar.averageRating)}
                </p>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Available Cars */}
      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Available Cars</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCars.length > 0 ? (
            filteredCars
              .filter((car) => car._id !== featuredCar?._id)
              .map((car) => {
                const imageName = `${car.make.toLowerCase().replace(/\s+/g, "-")}-${car.model.toLowerCase().replace(/\s+/g, "-")}.jpg`;
                return (
                  <Link key={car._id} to={`/cars/${car._id}`}>
                    <li className="p-4 rounded-xl shadow border w-full flex flex-col gap-3 bg-white hover:shadow-lg transition cursor-pointer">
                      <div className="relative">
                        <img
                          src={`/images/${imageName}`}
                          alt={`${car.make} ${car.model}`}
                          className="w-full h-40 object-cover rounded-xl"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/images/default.jpg";
                          }}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-lg text-gray-800">
                          {car.make} {car.model} | ₱{car.pricePerDay}/day
                        </span>
                        <span className="text-gray-600">
                          Avg Rating: {car.averageRating?.toFixed(1)} {renderStars(car.averageRating)}
                        </span>
                      </div>
                    </li>
                  </Link>
                );
              })
          ) : (
            <p className="text-center text-gray-600 col-span-full">No cars match your search.</p>
          )}
        </ul>
      </div>
    </div>
  );
}

export default Home;
