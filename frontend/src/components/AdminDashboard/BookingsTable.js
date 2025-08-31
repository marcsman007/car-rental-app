import React, { useEffect, useState } from "react";
import "./BookingsTable.css";
import Pagination from "../Pagination";
import Notification from "./common/Notification"; // <-- Added

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
  const [highlightedBookingIds, setHighlightedBookingIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [message, setMessage] = useState(""); // <-- Added
  const [searchText, setSearchText] = useState(""); // <-- Added Search
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" }); // <-- Added
  const itemsPerPage = 10;

  // Highlight new or updated bookings for 2 seconds
  useEffect(() => {
    if (!bookings) return;

    const newIds = bookings
      .filter(b => !highlightedBookingIds.includes(b._id))
      .map(b => b._id);

    if (newIds.length > 0) {
      setHighlightedBookingIds(prev => [...prev, ...newIds]);
      const timer = setTimeout(() => {
        setHighlightedBookingIds(prev => prev.filter(id => !newIds.includes(id)));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [bookings, highlightedBookingIds]);

  // --- Auto-clear notifications after 2 seconds ---
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 2000);
    return () => clearTimeout(timer);
  }, [message]);

  const getStatusBadge = (status) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
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
      case "cancelled":
      case "canceled":
        return (
          <span className="bg-red-100 text-red-800 font-semibold px-2 py-1 rounded-full uppercase text-sm">
            {status}
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  // --- Sorting handler ---
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  // Wrap handlers to show messages
  const wrappedHandleEditBooking = async (e) => {
    try {
      await handleEditBooking(e);
      setMessage("Booking confirmed ✅");
    } catch {
      setMessage("Booking update failed ❌");
    }
  };

  const wrappedHandleCancelBooking = async (id) => {
    try {
      await handleCancelBooking(id);
      setMessage("Booking cancelled ✅");
    } catch {
      setMessage("Cancel failed ❌");
    }
  };

  const wrappedHandleFulfillBooking = async (id) => {
    try {
      await handleFulfillBooking(id);
      setMessage("Booking fulfilled ✅");
    } catch {
      setMessage("Failed to fulfill booking ❌");
    }
  };

  // --- Filter by status ---
  const statusFiltered = bookings.filter((b) => {
    const status = b.status.toLowerCase();
    const filter = filterStatus.toLowerCase();
    if (filter === "all") return true;
    if (filter === "cancelled") return status === "cancelled" || status === "canceled";
    return status === filter;
  });

  // --- Search by car name or user name ---
  const searchedBookings = statusFiltered.filter((b) => {
    const text = searchText.toLowerCase();
    return (
      b.car?.make?.toLowerCase().includes(text) ||
      b.car?.model?.toLowerCase().includes(text) ||
      b.user?.name?.toLowerCase().includes(text)
    );
  });

  // --- Sort ---
  const sortedBookings = [...searchedBookings].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aVal, bVal;
    switch (sortConfig.key) {
      case "car":
        aVal = `${a.car?.make} ${a.car?.model}`.toLowerCase();
        bVal = `${b.car?.make} ${b.car?.model}`.toLowerCase();
        break;
      case "user":
        aVal = a.user?.name?.toLowerCase();
        bVal = b.user?.name?.toLowerCase();
        break;
      case "startDate":
        aVal = new Date(a.startDate);
        bVal = new Date(b.startDate);
        break;
      case "endDate":
        aVal = new Date(a.endDate);
        bVal = new Date(b.endDate);
        break;
      case "status":
        aVal = a.status.toLowerCase();
        bVal = b.status.toLowerCase();
        break;
      default:
        return 0;
    }

    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // --- Paginate ---
  const paginatedBookings = sortedBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Bookings</h2>

      {/* --- Notifications --- */}
      <Notification
        message={message}
        type={message.includes("❌") ? "error" : "success"}
      />

      <div className="mb-2 flex flex-col sm:flex-row gap-2 sm:items-center">
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
            <option value="cancelled">Cancelled</option>
          </select>
        </label>

        {/* --- Search Bar --- */}
        <input
          type="text"
          placeholder="Search by Car or User"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="border px-2 py-1 rounded w-full sm:w-64"
        />
      </div>

      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th onClick={() => handleSort("car")} className="px-4 py-2 text-left text-sm font-medium text-gray-700 cursor-pointer">
                Car {sortConfig.key === "car" && (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th onClick={() => handleSort("user")} className="px-4 py-2 text-left text-sm font-medium text-gray-700 cursor-pointer">
                User {sortConfig.key === "user" && (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th onClick={() => handleSort("startDate")} className="px-4 py-2 text-left text-sm font-medium text-gray-700 cursor-pointer">
                Start Date {sortConfig.key === "startDate" && (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th onClick={() => handleSort("endDate")} className="px-4 py-2 text-left text-sm font-medium text-gray-700 cursor-pointer">
                End Date {sortConfig.key === "endDate" && (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th onClick={() => handleSort("status")} className="px-4 py-2 text-left text-sm font-medium text-gray-700 cursor-pointer">
                Status {sortConfig.key === "status" && (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedBookings.map((b) => {
              const normalizedStatus = b.status.toLowerCase();
              const isHighlighted = highlightedBookingIds.includes(b._id);

              return (
                <tr
                  key={b._id}
                  className={`${normalizedStatus === "cancelled" || normalizedStatus === "canceled" ? "row-cancelled" : ""} ${isHighlighted ? "highlight" : ""} odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition-colors`}
                >
                  <td className="px-4 py-2">{b.car?.make} {b.car?.model}</td>
                  <td className="px-4 py-2">{b.user?.name}</td>
                  <td className="px-4 py-2">{b.startDate.slice(0, 10)}</td>
                  <td className="px-4 py-2">{b.endDate.slice(0, 10)}</td>
                  <td className="px-4 py-2">{getStatusBadge(b.status)}</td>
                  <td className="px-4 py-2">
                    {normalizedStatus !== "fulfilled" && normalizedStatus !== "cancelled" && normalizedStatus !== "canceled" ? (
                      <div className="flex flex-wrap gap-2">
                        <button className={btnBlue} onClick={() => startEditBooking(b)}>Edit</button>
                        <button className={btnRed} onClick={() => wrappedHandleCancelBooking(b._id)}>Cancel</button>
                        <button className={btnGray} onClick={() => wrappedHandleFulfillBooking(b._id)}>Fulfill</button>
                      </div>
                    ) : (normalizedStatus === "cancelled" || normalizedStatus === "canceled") ? (
                      <div className="text-gray-500 italic">No actions available</div>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={sortedBookings.length}
        itemsPerPage={itemsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {editingBookingId &&
        bookings.find(b => b._id === editingBookingId)?.status.toLowerCase() !== "fulfilled" &&
        bookings.find(b => b._id === editingBookingId)?.status.toLowerCase() !== "cancelled" &&
        bookings.find(b => b._id === editingBookingId)?.status.toLowerCase() !== "canceled" && (
          <form onSubmit={wrappedHandleEditBooking} className="mt-4 flex flex-wrap gap-2 items-end bg-gray-50 p-4 rounded-lg shadow-inner">
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
