import { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import API from "../services/api";

function Cars() {
  const { cars, role, userBookings, bookCar, fetchCars } = useContext(AppContext);
  const [bookingCarId, setBookingCarId] = useState(null);
  const [bookingDates, setBookingDates] = useState({ startDate: "", endDate: "" });
  const [message, setMessage] = useState("");
  const [reviewData, setReviewData] = useState({}); // { carId: { rating: "", comment: "" } }

  const isCarBookedByUser = (carId) =>
    userBookings.some(
      (booking) => booking.car._id === carId && booking.status !== "canceled"
    );

  const isCarAvailable = (car) => {
    if (!bookingDates.startDate || !bookingDates.endDate) return car.available;
    return !userBookings.some(
      (booking) =>
        booking.car._id === car._id &&
        booking.status !== "canceled" &&
        (new Date(bookingDates.startDate) <= new Date(booking.endDate)) &&
        (new Date(bookingDates.endDate) >= new Date(booking.startDate))
    );
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!bookingDates.startDate || !bookingDates.endDate) return;

    try {
      await bookCar(bookingCarId, bookingDates.startDate, bookingDates.endDate);
      setMessage("Booking successful ✅");
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
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">Available Cars</h2>
      {cars.length === 0 ? (
        <p className="text-center text-gray-600">No cars available</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cars
            .filter((car) => role === "admin" || isCarAvailable(car))
            .map((car) => {
              const bookedByUser = isCarBookedByUser(car._id);
              const available = isCarAvailable(car);
              const userReview = car.reviews.find(
                (r) => r.user === localStorage.getItem("userId")
              );

              return (
                <li
                  key={car._id}
                  className={`p-4 border rounded-lg shadow ${
                    available ? "border-green-400" : "border-red-400 opacity-60"
                  } ${car.averageRating === maxRating && maxRating > 0 ? "bg-yellow-50" : "bg-white"}`}
                >
                  <div className="flex flex-col gap-2">
                    <span className="font-bold text-lg">
                      {car.make} {car.model} | ₱{car.pricePerDay}/day{" "}
                      {(!available || bookedByUser) && "(Booked)"}
                    </span>

                    <div>Avg Rating: {car.averageRating.toFixed(1)} {renderStars(car.averageRating)}</div>

                    {car.reviews.length > 0 && (
                      <div className="mt-2 pl-2">
                        <strong>Reviews:</strong>
                        <ul className="list-disc pl-5">
                          {car.reviews.map((r) => (
                            <li key={r._id}>
                              {r.name} - {r.rating} {renderStars(r.rating)} {r.comment}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {role !== "admin" && available && !bookedByUser && (
                      <button
                        onClick={() => setBookingCarId(car._id)}
                        className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Book Now
                      </button>
                    )}

                    {bookingCarId === car._id && (
                      <form
                        onSubmit={handleBooking}
                        className="flex flex-col gap-2 mt-2"
                      >
                        <input
                          type="date"
                          value={bookingDates.startDate}
                          onChange={(e) =>
                            setBookingDates({ ...bookingDates, startDate: e.target.value })
                          }
                          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                        <input
                          type="date"
                          value={bookingDates.endDate}
                          onChange={(e) =>
                            setBookingDates({ ...bookingDates, endDate: e.target.value })
                          }
                          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Confirm Booking
                          </button>
                          <button
                            type="button"
                            onClick={() => { setBookingCarId(null); setBookingDates({ startDate: "", endDate: "" }); }}
                            className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}

                    {!userReview && role !== "admin" && (
                      <div className="flex flex-col gap-2 mt-2">
                        <input
                          type="number"
                          min="1"
                          max="5"
                          placeholder="Rating (1-5)"
                          value={reviewData[car._id]?.rating || ""}
                          onChange={(e) => handleReviewChange(car._id, "rating", e.target.value)}
                          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                        <input
                          type="text"
                          placeholder="Comment"
                          value={reviewData[car._id]?.comment || ""}
                          onChange={(e) => handleReviewChange(car._id, "comment", e.target.value)}
                          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                        <button
                          type="button"
                          onClick={() => submitReview(car._id)}
                          className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                        >
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
      {message && <p className={`mt-4 text-center ${message.includes("❌") ? "text-red-600" : "text-green-600"}`}>{message}</p>}
    </div>
  );
}

export default Cars;
