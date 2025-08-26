import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";

const Bookings = () => {
  const { userBookings, setUserBookings, loading } = useContext(AppContext);

  if (loading)
    return <p className="text-center text-gray-600">Loading your bookings...</p>;
  if (userBookings.length === 0)
    return <p className="text-center text-gray-600">You have no bookings yet.</p>;

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const token = localStorage.getItem("token");

      const res = await axios.delete(`/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      alert(res.data.message || "Booking canceled successfully");

      const canceledBooking = res.data.booking;
      setUserBookings(
        userBookings.map((b) =>
          b._id === bookingId
            ? { ...b, status: canceledBooking.status, canceledAt: canceledBooking.canceledAt }
            : b
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to cancel booking");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">My Bookings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {userBookings.map((b) => (
          <div
            key={b._id}
            className={`p-4 border rounded-lg shadow ${
              b.status === "canceled" ? "opacity-60 border-red-400" : "border-gray-300"
            }`}
          >
            {b.car ? (
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-semibold">
                  {b.car.make} {b.car.model}
                </h3>
                <p>
                  <strong>From:</strong> {new Date(b.startDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>To:</strong> {new Date(b.endDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>Total Price:</strong> ₱{b.totalPrice}
                </p>
                <p>
                  <strong>Status:</strong> {b.status}
                </p>

                {b.status === "canceled" && b.canceledAt && (
                  <p>
                    <strong>Cancelled on:</strong> {new Date(b.canceledAt).toLocaleString()}
                  </p>
                )}

                {b.status !== "canceled" && (
                  <button
                    onClick={() => handleCancelBooking(b._id)}
                    className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            ) : (
              <p className="text-gray-600">Car info not available</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Bookings;
