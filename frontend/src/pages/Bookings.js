import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";

function Bookings() {
  const { userBookings, cancelBooking, loading, fetchUserBookings } = useContext(AppContext);
  const [bookings, setBookings] = useState([]);

  // Keep local state in sync with AppContext bookings
  useEffect(() => {
    setBookings(userBookings);
  }, [userBookings]);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await cancelBooking(id);
      // Refetch latest bookings to ensure up-to-date info
      await fetchUserBookings();
      alert("Booking cancelled ✅");
    } catch (err) {
      console.error(err);
      alert("Failed to cancel booking ❌");
    }
  };

  // Only calculate bookings if loading is false and bookings exist
  let activeBookings = [];
  let pastBookings = [];
  if (!loading && bookings !== null) {
    activeBookings = bookings.filter(
      (b) => b.status !== "canceled" && b.status !== "fulfilled"
    );
    pastBookings = bookings.filter(
      (b) => b.status === "canceled" || b.status === "fulfilled"
    );
  }

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

  // Render skeleton placeholders to prevent flash
  if (loading || bookings === null) {
    return (
      <div className="min-h-screen px-4 py-6 bg-gray-100 w-full max-w-[1600px] mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">My Bookings</h2>
        <p className="text-center text-gray-600 mt-6">Loading your bookings...</p>

        {/* Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mt-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-4 border rounded-lg bg-gray-200 animate-pulse h-48 flex flex-col gap-2">
              <div className="h-6 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/3"></div>
              <div className="h-6 bg-gray-300 rounded w-full mt-auto"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show bookings only after loading is done
  const showNoBookingsMessage = !loading && bookings && bookings.length === 0;

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

      {showNoBookingsMessage && (
        <p className="text-center text-gray-600 mt-6">You have no bookings yet.</p>
      )}
    </div>
  );
}

export default Bookings;
