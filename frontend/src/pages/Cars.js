// Cars.js
import { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import API from "../services/api";

function Cars() {
  const {
    cars,
    role,
    userBookings,
    bookCar,
    fetchCars,
    loading,
    updateBooking,
  } = useContext(AppContext);

  const { id } = useParams(); // for single car view
  const navigate = useNavigate();

  const [bookingCarId, setBookingCarId] = useState(null);
  const [bookingDates, setBookingDates] = useState({ startDate: "", endDate: "" });
  const [message, setMessage] = useState("");
  const [reviewData, setReviewData] = useState({});

  useEffect(() => {
    fetchCars();
    const interval = setInterval(fetchCars, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p className="text-center text-gray-600 mt-6">Loading cars...</p>;
  if (cars.length === 0) return <p className="text-center text-gray-600 mt-6">No cars available</p>;

  const singleCar = id ? cars.find((c) => c._id === id) : null;
  const displayCars = singleCar ? [singleCar] : cars;

  const isCarBookedByUser = (carId) =>
    userBookings.some((booking) => booking.car._id === carId && booking.status === "confirmed");

  const isCarAvailable = (car) => {
    if (!bookingDates.startDate || !bookingDates.endDate) return car.available;
    return !userBookings.some(
      (booking) =>
        booking.car._id === car._id &&
        booking.status === "confirmed" &&
        new Date(bookingDates.startDate) <= new Date(booking.endDate) &&
        new Date(bookingDates.endDate) >= new Date(booking.startDate)
    );
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!bookingDates.startDate || !bookingDates.endDate) return;

    try {
      const newBooking = await bookCar(
        bookingCarId,
        bookingDates.startDate,
        bookingDates.endDate
      );
      setMessage("Booking successful ✅");
      updateBooking(newBooking);
      setBookingCarId(null);
      setBookingDates({ startDate: "", endDate: "" });
    } catch (err) {
      setMessage(err.response?.data?.message || "Booking failed ❌");
    }
  };

  const handleReviewChange = (carId, field, value) => {
    setReviewData({
      ...reviewData,
      [carId]: { ...reviewData[carId], [field]: value },
    });
  };

  const submitReview = async (carId) => {
    try {
      const { rating, comment } = reviewData[carId];
      if (!rating || !comment) return alert("Please provide both rating and comment");

      await API.post(
        `/cars/${carId}/reviews`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert("Review submitted ✅");
      setReviewData({ ...reviewData, [carId]: { rating: "", comment: "" } });
      fetchCars();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error submitting review ❌");
    }
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

  const maxRating = Math.max(...cars.map((c) => c.averageRating), 0);

  return (
    <div className="min-h-screen px-4 py-6 bg-gray-100 w-full max-w-[1600px] mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        {singleCar ? "Car Details" : "Available Cars"}
      </h2>

      {singleCar ? (
        // --- Single Car View ---
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg flex flex-col md:flex-row gap-6">
          <img
            src={`/images/${singleCar.make.toLowerCase().replace(/\s+/g, "-")}-${singleCar.model.toLowerCase().replace(/\s+/g, "-")}.jpg`}
            alt={`${singleCar.make} ${singleCar.model}`}
            className="w-full md:w-1/2 h-80 object-cover rounded-xl border"
            onError={(e) => { e.currentTarget.src = "/images/default.jpg"; }}
          />
          <div className="flex flex-col gap-3 md:w-1/2">
            <h2 className="text-3xl font-bold">{singleCar.make} {singleCar.model}</h2>
            <p className="text-xl text-gray-700">Price: ₱{singleCar.pricePerDay}/day</p>
            <p className="text-lg text-gray-600">
              Avg Rating: {singleCar.averageRating?.toFixed(1)} {renderStars(singleCar.averageRating)}
            </p>

            <p className="text-gray-700">{singleCar.description || "No description available."}</p>

            {singleCar.descriptionPoints?.length > 0 && (
              <ul className="list-disc pl-5 text-gray-700 mt-2">
                {singleCar.descriptionPoints.map((point, index) => (
                  <li key={index} className="mb-1">{point}</li>
                ))}
              </ul>
            )}

            {role !== "admin" && (
              <button
                onClick={() => setBookingCarId(singleCar._id)}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Book This Car
              </button>
            )}

            {bookingCarId === singleCar._id && (
              <form onSubmit={handleBooking} className="flex flex-col gap-2 mt-2 w-full">
                <input
                  type="date"
                  value={bookingDates.startDate}
                  onChange={(e) => setBookingDates({ ...bookingDates, startDate: e.target.value })}
                  className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  required
                />
                <input
                  type="date"
                  value={bookingDates.endDate}
                  onChange={(e) => setBookingDates({ ...bookingDates, endDate: e.target.value })}
                  className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  required
                />
                <div className="flex gap-2 flex-wrap mt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition w-full md:w-auto"
                  >
                    Confirm Booking
                  </button>
                  <button
                    type="button"
                    onClick={() => { setBookingCarId(null); setBookingDates({ startDate: "", endDate: "" }); }}
                    className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition w-full md:w-auto"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {singleCar.reviews?.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Reviews:</h3>
                <ul className="list-disc pl-5">
                  {singleCar.reviews.map((r) => (
                    <li key={r._id} className="mb-2">{r.name} - {r.rating} {renderStars(r.rating)}: {r.comment}</li>
                  ))}
                </ul>
              </div>
            )}

            {!singleCar.reviews?.some(r => r.user.toString() === localStorage.getItem("userId")) && role !== "admin" && (
              <div className="flex flex-col gap-2 mt-2 w-full">
                <input
                  type="number"
                  min="1"
                  max="5"
                  placeholder="Rating (1-5)"
                  value={reviewData[singleCar._id]?.rating || ""}
                  onChange={(e) => handleReviewChange(singleCar._id, "rating", e.target.value)}
                  className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-500 w-full"
                />
                <input
                  type="text"
                  placeholder="Comment"
                  value={reviewData[singleCar._id]?.comment || ""}
                  onChange={(e) => handleReviewChange(singleCar._id, "comment", e.target.value)}
                  className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-500 w-full"
                />
                <button
                  type="button"
                  onClick={() => submitReview(singleCar._id)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition w-full"
                >
                  Submit Review
                </button>
              </div>
            )}

            <button
              className="mt-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              onClick={() => navigate("/cars")}
            >
              Back to all cars
            </button>
          </div>
        </div>
      ) : (
        // --- List View ---
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {displayCars
            .filter((car) => role === "admin" || isCarAvailable(car))
            .map((car) => {
              const bookedByUser = isCarBookedByUser(car._id);
              const available = isCarAvailable(car);
              const userReview = car.reviews?.find(r => r.user.toString() === localStorage.getItem("userId"));
              const imageName = `${car.make.toLowerCase().replace(/\s+/g, "-")}-${car.model.toLowerCase().replace(/\s+/g, "-")}.jpg`;

              return (
                <li
                  key={car._id}
                  className={`p-4 rounded-lg shadow border w-full flex flex-col gap-3 ${available ? "border-green-400" : "border-red-400 opacity-60"} ${car.averageRating === maxRating && maxRating > 0 ? "bg-yellow-50" : "bg-white"}`}
                >
                  <img
                    src={`/images/${imageName}`}
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-40 object-cover rounded cursor-pointer"
                    onClick={() => navigate(`/cars/${car._id}`)}
                    onError={(e) => { e.currentTarget.src = "/images/default.jpg"; }}
                  />

                  <div className="flex flex-col gap-3 w-full">
                    <span className="font-bold text-lg text-gray-800">
                      {car.make} {car.model} | ₱{car.pricePerDay}/day {(!available || bookedByUser) && "(Booked)"}
                    </span>

                    <div className="text-gray-600">
                      Avg Rating: {car.averageRating?.toFixed(1)} {renderStars(car.averageRating)}
                    </div>

                    {car.reviews?.length > 0 && (
                      <div className="mt-2 pl-2 text-gray-700">
                        <strong>Reviews:</strong>
                        <ul className="list-disc pl-5">
                          {car.reviews.slice(-3).reverse().map((r) => (
                            <li key={r._id} className="mb-2">{r.name} - {r.rating} {renderStars(r.rating)} {r.comment}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {car.descriptionPoints?.length > 0 && (
                      <ul className="list-disc pl-5 text-gray-700 mt-1">
                        {car.descriptionPoints.map((point, index) => (
                          <li key={index} className="mb-1">{point}</li>
                        ))}
                      </ul>
                    )}

                    {role !== "admin" && available && !bookedByUser && (
                      <button
                        onClick={() => setBookingCarId(car._id)}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition w-full"
                      >
                        Book Now
                      </button>
                    )}

                    {bookingCarId === car._id && (
                      <form onSubmit={handleBooking} className="flex flex-col gap-2 mt-2 w-full">
                        <input
                          type="date"
                          value={bookingDates.startDate}
                          onChange={(e) => setBookingDates({ ...bookingDates, startDate: e.target.value })}
                          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                          required
                        />
                        <input
                          type="date"
                          value={bookingDates.endDate}
                          onChange={(e) => setBookingDates({ ...bookingDates, endDate: e.target.value })}
                          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                          required
                        />
                        <div className="flex gap-2 flex-wrap mt-2">
                          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition w-full md:w-auto">
                            Confirm Booking
                          </button>
                          <button type="button" onClick={() => { setBookingCarId(null); setBookingDates({ startDate: "", endDate: "" }); }} className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition w-full md:w-auto">
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}

                    {!userReview && role !== "admin" && (
                      <div className="flex flex-col gap-2 mt-2 w-full">
                        <input type="number" min="1" max="5" placeholder="Rating (1-5)" value={reviewData[car._id]?.rating || ""} onChange={(e) => handleReviewChange(car._id, "rating", e.target.value)} className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-500 w-full" />
                        <input type="text" placeholder="Comment" value={reviewData[car._id]?.comment || ""} onChange={(e) => handleReviewChange(car._id, "comment", e.target.value)} className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-500 w-full" />
                        <button type="button" onClick={() => submitReview(car._id)} className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition w-full">
                          Submit Review
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
        </ul>
      )}

      {message && (
        <p className={`mt-4 text-center font-medium w-full ${message.includes("❌") ? "text-red-600" : "text-green-600"}`}>
          {message}
        </p>
      )}
    </div>
  );
}

export default Cars;
