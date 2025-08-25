import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';

const Bookings = () => {
  const { userBookings, setUserBookings, loading } = useContext(AppContext);

  if (loading) return <p>Loading your bookings...</p>;
  if (userBookings.length === 0) return <p>You have no bookings yet.</p>;

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const token = localStorage.getItem('token');

      const res = await axios.delete(`/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });

      alert(res.data.message || 'Booking canceled successfully');

      // Soft cancel: update booking status and canceledAt
      const canceledBooking = res.data.booking;
      setUserBookings(
        userBookings.map(b =>
          b._id === bookingId
            ? { ...b, status: canceledBooking.status, canceledAt: canceledBooking.canceledAt }
            : b
        )
      );
    } catch (err) {
      console.error(err);
      alert('Failed to cancel booking');
    }
  };

  return (
    <div>
      <h2>My Bookings</h2>
      {userBookings.map((b) => (
        <div
          key={b._id}
          style={{
            border: '1px solid #ccc',
            margin: '10px',
            padding: '10px',
            opacity: b.status === 'canceled' ? 0.6 : 1
          }}
        >
          {b.car ? (
            <>
              <h3>{b.car.make} {b.car.model}</h3>
              <p>From: {new Date(b.startDate).toLocaleDateString()}</p>
              <p>To: {new Date(b.endDate).toLocaleDateString()}</p>
              <p>Total Price: ₱{b.totalPrice}</p>
              <p>Status: {b.status}</p>

              {/* Show canceled date if applicable */}
              {b.status === 'canceled' && b.canceledAt && (
                <p>Cancelled on: {new Date(b.canceledAt).toLocaleString()}</p>
              )}

              {/* Cancel button only if not canceled */}
              {b.status !== 'canceled' && (
                <button
                  onClick={() => handleCancelBooking(b._id)}
                  style={{ backgroundColor: 'red', color: 'white', padding: '5px 10px', marginTop: '5px' }}
                >
                  Cancel Booking
                </button>
              )}
            </>
          ) : (
            <p>Car info not available</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default Bookings;
