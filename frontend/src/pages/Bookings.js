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
      const token = localStorage.getItem('token'); // adjust if you store JWT elsewhere
      await axios.delete(`/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove canceled booking from local state
      setUserBookings(userBookings.filter(b => b._id !== bookingId));
      alert('Booking canceled successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to cancel booking');
    }
  };

  return (
    <div>
      <h2>My Bookings</h2>
      {userBookings.map((b) => (
        <div key={b._id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
          {b.car ? (
            <>
              <h3>{b.car.make} {b.car.model}</h3>
              <p>From: {new Date(b.startDate).toLocaleDateString()}</p>
              <p>To: {new Date(b.endDate).toLocaleDateString()}</p>
              <p>Total Price: ₱{b.totalPrice}</p>
              <p>Status: {b.status}</p>
              {/* Cancel button */}
              {b.status !== 'canceled' && (
                <button
                  onClick={() => handleCancelBooking(b._id)}
                  style={{ backgroundColor: 'red', color: 'white', padding: '5px 10px', marginTop: '5px' }}
                >
                  Cancel Booking
                </button>
              )}
            </>
          ) : <p>Car info not available</p>}
        </div>
      ))}
    </div>
  );
};

export default Bookings;
