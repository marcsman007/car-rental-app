import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";

function Bookings() {
  const { userBookings, cancelBooking, loading } = useContext(AppContext);

  if (loading)
    return <p className="text-center text-gray-600 mt-6">Loading your bookings...</p>;
  if (userBookings.length === 0)
    return <p className="text-center text-gray-600 mt-6">You have no bookings yet.</p>;

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await cancelBooking(id);
      alert("Booking cancelled ✅");
    } catch (err) {
      console.error(err);
      alert("Failed to cancel booking ❌");
    }
  };

  // Separate active and fulfilled/canceled bookings
  const activeBookings = userBookings.filter(
    (b) => b.status !== "canceled" && b.status !== "fulfilled"
  );
  const pastBookings = userBookings.filter(
    (b) => b.status === "canceled" || b.status === "fulfilled"
  );

  const renderBookingCard = (b, showCancel = true) => (
    <div
      key={b._id}
      className={`p-4 rounded-lg shadow border w-full flex flex-col gap-3 ${
        b.status === "canceled"
          ? "opacity-60 border-red-400 bg-red-50"
          : b.status === "fulfilled"
          ? "opacity-60 border-green-400 bg-green-50"
          : "border-gray-300 bg-white"
      }`}
    >
      {b.car ? (
        <div className="flex flex-col gap-2 w-full">
          <h3 className="text-xl font-semibold text-gray-800">
            {b.car.make} {b.car.model}
          </h3>
          <p className="text-gray-700">
            <strong>From:</strong> {new Date(b.startDate).toLocaleDateString()}
          </p>
          <p className="text-gray-700">
            <strong>To:</strong> {new Date(b.endDate).toLocaleDateString()}
          </p>
          <p className="text-gray-700">
            <strong>Total Price:</strong> ₱{b.totalPrice}
          </p>
          <p className="text-gray-700">
            <strong>Status:</strong> {b.status}
          </p>
          {b.status === "canceled" && b.canceledAt && (
            <p className="text-gray-700">
              <strong>Cancelled on:</strong> {new Date(b.canceledAt).toLocaleString()}
            </p>
          )}
          {showCancel && b.status !== "canceled" && b.status !== "fulfilled" && (
            <button
              onClick={() => handleCancel(b._id)}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition w-full md:w-auto"
            >
              Cancel Booking
            </button>
          )}
        </div>
      ) : (
        <p className="text-gray-600">Car info not available</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen px-4 py-6 bg-gray-100 w-full max-w-[1600px] mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">My Bookings</h2>

      {activeBookings.length > 0 && (
        <>
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">Active Bookings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {activeBookings.map((b) => renderBookingCard(b))}
          </div>
        </>
      )}

      {pastBookings.length > 0 && (
        <>
          <h3 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">Booking History</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {pastBookings.map((b) => renderBookingCard(b, false))}
          </div>
        </>
      )}

      {activeBookings.length === 0 && pastBookings.length === 0 && (
        <p className="text-center text-gray-600 mt-6">You have no bookings yet.</p>
      )}
    </div>
  );
}

export default Bookings;
