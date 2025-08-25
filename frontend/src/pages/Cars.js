import { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";

function Cars() {
  const { cars, role, userBookings, bookCar } = useContext(AppContext);
  const [bookingCarId, setBookingCarId] = useState(null);
  const [bookingDates, setBookingDates] = useState({ startDate: "", endDate: "" });
  const [message, setMessage] = useState("");

  // Check if a car is booked by the user in an active booking (ignore canceled)
  const isCarBookedByUser = (carId) => {
    return userBookings.some(
      booking => booking.car._id === carId && booking.status !== "canceled"
    );
  };

  // Check if a car is available in the selected date range
  const isCarAvailable = (car) => {
    if (!bookingDates.startDate || !bookingDates.endDate) return car.available;
    return !userBookings.some(
      booking =>
        booking.car._id === car._id &&
        booking.status !== "canceled" && // ✅ ignore canceled bookings
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

  return (
    <div className="container">
      <h2>Available Cars</h2>
      {cars.length === 0 ? (
        <p>No cars available</p>
      ) : (
        <ul>
          {cars
            .filter(car => role === "admin" || isCarAvailable(car)) // ✅ use availability logic
            .map(car => {
              const bookedByUser = isCarBookedByUser(car._id);
              const available = isCarAvailable(car);

              return (
                <li key={car._id} style={{ marginBottom: "10px", borderBottom: "1px solid #ccc", paddingBottom: "5px", opacity: available ? 1 : 0.6 }}>
                  <span>
                    {car.make} {car.model} | ₱{car.pricePerDay}/day {(!available || bookedByUser) && "(Booked)"}
                  </span>

                  {role !== "admin" && available && !bookedByUser && (
                    <button onClick={() => setBookingCarId(car._id)}>Book Now</button>
                  )}

                  {bookingCarId === car._id && (
                    <form onSubmit={handleBooking}>
                      <input
                        type="date"
                        value={bookingDates.startDate}
                        onChange={(e) => setBookingDates({ ...bookingDates, startDate: e.target.value })}
                        required
                      />
                      <input
                        type="date"
                        value={bookingDates.endDate}
                        onChange={(e) => setBookingDates({ ...bookingDates, endDate: e.target.value })}
                        required
                      />
                      <button type="submit">Confirm Booking</button>
                      <button
                        type="button"
                        onClick={() => { setBookingCarId(null); setBookingDates({ startDate: "", endDate: "" }); }}
                      >
                        Cancel
                      </button>
                    </form>
                  )}
                </li>
              );
            })}
        </ul>
      )}
      <p>{message}</p>
    </div>
  );
}

export default Cars;
