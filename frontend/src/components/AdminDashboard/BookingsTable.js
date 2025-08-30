import React from "react";

function BookingsTable({
  bookings,
  editingBookingId,
  setEditingBookingId,
  editingBookingDates,
  setEditingBookingDates,
  startEditBooking,
  handleEditBooking,
  handleCancelBooking,
  handleFulfillBooking,
  filterStatus,
  setFilterStatus,
  btnBlue,
  btnRed,
  btnGray
}) {
  const getStatusBadge = (status) => {
    switch (status) {
      case "fulfilled":
        return (
          <span className="bg-green-100 text-green-800 font-semibold px-2 py-1 rounded-full uppercase text-sm">
            {status}
          </span>
        );
      case "confirmed":
        return (
          <span className="bg-blue-100 text-blue-800 font-semibold px-2 py-1 rounded-full uppercase text-sm">
            {status}
          </span>
        );
      case "pending":
        return (
          <span className="bg-yellow-100 text-yellow-800 font-semibold px-2 py-1 rounded-full uppercase text-sm">
            {status}
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Bookings</h2>

      <div className="mb-2">
        <label>
          Filter Status:{" "}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="fulfilled">Fulfilled</option>
          </select>
        </label>
      </div>

      <table className="w-full border border-gray-300 rounded">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">Car</th>
            <th className="border px-4 py-2">User</th>
            <th className="border px-4 py-2">Start Date</th>
            <th className="border px-4 py-2">End Date</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings
            .filter((b) => filterStatus === "all" || b.status === filterStatus)
            .map((b) => (
              <tr key={b._id}>
                <td className="border px-4 py-2">{b.car?.make} {b.car?.model}</td>
                <td className="border px-4 py-2">{b.user?.name}</td>
                <td className="border px-4 py-2">{b.startDate.slice(0, 10)}</td>
                <td className="border px-4 py-2">{b.endDate.slice(0, 10)}</td>
                <td className="border px-4 py-2">{getStatusBadge(b.status)}</td>
                <td className="border px-4 py-2">
                  {b.status !== "fulfilled" && (
                    <div className="flex flex-wrap gap-2">
                      <button className={btnBlue} onClick={() => startEditBooking(b)}>Edit</button>
                      <button className={btnRed} onClick={() => handleCancelBooking(b._id)}>Cancel</button>
                      <button className={btnGray} onClick={() => handleFulfillBooking(b._id)}>Fulfill</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* Only show edit form for pending/confirmed bookings */}
      {editingBookingId && bookings.find(b => b._id === editingBookingId)?.status !== "fulfilled" && (
        <form onSubmit={handleEditBooking} className="mt-4 flex flex-wrap gap-2 items-end">
          <input
            type="date"
            value={editingBookingDates.startDate}
            onChange={(e) => setEditingBookingDates({ ...editingBookingDates, startDate: e.target.value })}
            className="border px-2 py-1 rounded"
            required
          />
          <input
            type="date"
            value={editingBookingDates.endDate}
            onChange={(e) => setEditingBookingDates({ ...editingBookingDates, endDate: e.target.value })}
            className="border px-2 py-1 rounded"
            required
          />
          <button type="submit" className={btnBlue}>Confirm Booking</button>
        </form>
      )}
    </div>
  );
}

export default BookingsTable;
