import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';

const Bookings = () => {
  const { userBookings, loading } = useContext(AppContext);

  if (loading) return <p>Loading your bookings...</p>;
  if (userBookings.length === 0) return <p>You have no bookings yet.</p>;

  return (
    <div>
      <h2>My Bookings</h2>
      {userBookings.map((b) => (
        <div key={b._id}>
          {b.car ? (
            <>
              <h3>{b.car.make} {b.car.model}</h3>
              <p>From: {new Date(b.startDate).toLocaleDateString()}</p>
              <p>To: {new Date(b.endDate).toLocaleDateString()}</p>
              <p>Total Price: ₱{b.totalPrice}</p>
              <p>Status: {b.status}</p>
            </>
          ) : <p>Car info not available</p>}
        </div>
      ))}
    </div>
  );
};

export default Bookings;
