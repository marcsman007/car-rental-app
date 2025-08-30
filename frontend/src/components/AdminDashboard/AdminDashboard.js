// src/components/AdminDashboard/AdminDashboard.js
import { useEffect, useState, useCallback } from "react";
import API from "../../services/api";
import CarsTable from "./CarsTable";
import BookingsTable from "./BookingsTable";
import ReviewsSection from "./ReviewsSection";
import UsersTable from "./UsersTable";

function AdminDashboard() {
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [newCar, setNewCar] = useState({ make: "", model: "", year: "", licensePlate: "", pricePerDay: "" });
  const [editingCarId, setEditingCarId] = useState(null);
  const [editingCarData, setEditingCarData] = useState({});
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [editingBookingDates, setEditingBookingDates] = useState({ startDate: "", endDate: "" });

  const token = localStorage.getItem("token");

  // --- Fetch Functions ---
  const fetchCars = useCallback(async () => {
    try {
      const res = await API.get("/cars", { headers: { Authorization: `Bearer ${token}` } });
      setCars(res.data);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to fetch cars ❌");
    }
  }, [token]);

  const fetchBookings = useCallback(async () => {
    try {
      const res = await API.get("/bookings", { headers: { Authorization: `Bearer ${token}` } });
      setBookings(res.data);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to fetch bookings ❌");
    }
  }, [token]);

  // --- Initial fetch & interval ---
  useEffect(() => {
    fetchCars();
    fetchBookings();
    const interval = setInterval(() => {
      fetchCars();
      fetchBookings();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchCars, fetchBookings]);

  // --- Booking logic ---
  const getActiveBooking = (carId) => {
    const now = new Date();
    const related = bookings.filter(
      (b) => b.car?._id === carId && (b.status === "pending" || b.status === "confirmed")
    );

    const current = related.find(
      (b) => new Date(b.startDate) <= now && new Date(b.endDate) >= now && b.status === "confirmed"
    );
    if (current) return current;

    const upcoming = related
      .filter((b) => new Date(b.startDate) > now)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    return upcoming[0] || null;
  };

  // --- Car Handlers ---
  const handleAddCar = async (e) => {
    e.preventDefault();
    try {
      await API.post(
        "/cars",
        { ...newCar, year: Number(newCar.year), pricePerDay: Number(newCar.pricePerDay) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Car added ✅");
      setNewCar({ make: "", model: "", year: "", licensePlate: "", pricePerDay: "" });
      fetchCars();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to add car ❌");
    }
  };

  const startEditCar = (car) => {
    setEditingCarId(car._id);
    setEditingCarData({ ...car });
  };

  const handleEditCar = async (e) => {
    e.preventDefault();
    try {
      await API.patch(
        `/cars/${editingCarId}`,
        { ...editingCarData, year: Number(editingCarData.year), pricePerDay: Number(editingCarData.pricePerDay) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Car updated ✅");
      setEditingCarId(null);
      fetchCars();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Car update failed ❌");
    }
  };

  const handleDeleteCar = async (id) => {
    if (!window.confirm("Delete this car?")) return;
    try {
      await API.delete(`/cars/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setMessage("Car deleted ✅");
      fetchCars();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Delete failed ❌");
    }
  };

  // --- Booking Handlers ---
  const startEditBooking = (booking) => {
    setEditingBookingId(booking._id);
    setEditingBookingDates({
      startDate: booking.startDate.slice(0, 10),
      endDate: booking.endDate.slice(0, 10),
    });
  };

  const handleEditBooking = async (e) => {
    e.preventDefault();
    try {
      const res = await API.patch(
        `/bookings/${editingBookingId}`,
        { startDate: editingBookingDates.startDate, endDate: editingBookingDates.endDate, status: "confirmed" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedBooking = res.data.booking || res.data;
      setBookings((prev) =>
        prev.map((b) => (b._id === editingBookingId ? { ...b, ...updatedBooking } : b))
      );
      setMessage("Booking confirmed ✅");
      setEditingBookingId(null);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Booking update failed ❌");
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      const res = await API.delete(`/bookings/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const canceledBooking = res.data.booking;
      setBookings((prev) => prev.map((b) => (b._id === id ? { ...b, ...canceledBooking } : b)));
      setMessage(res.data.message || "Booking cancelled ✅");
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Cancel failed ❌");
    }
  };

  const handleFulfillBooking = async (id) => {
    if (!window.confirm("Mark this booking as fulfilled?")) return;
    try {
      const res = await API.patch(`/bookings/${id}/fulfill`, {}, { headers: { Authorization: `Bearer ${token}` } });
      const fulfilledBooking = res.data.booking || res.data;
      setBookings((prev) => prev.map((b) => (b._id === id ? { ...b, ...fulfilledBooking } : b)));
      setMessage("Booking fulfilled ✅");
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to fulfill booking ❌");
    }
  };

  // --- Button Classes ---
  const btnBase = "px-3 py-1 rounded text-white font-semibold transition-colors duration-200";
  const btnBlue = `${btnBase} bg-blue-600 hover:bg-blue-700`;
  const btnRed = `${btnBase} bg-red-600 hover:bg-red-700`;
  const btnGray = `${btnBase} bg-gray-400 hover:bg-gray-500`;

  return (
    <div className="w-full max-w-[1600px] mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Dashboard</h1>
      {message && (
        <p className={`mb-4 text-center ${message.includes('❌') ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}

      {/* Cars Section */}
      <CarsTable
        cars={cars}
        editingCarId={editingCarId}
        setEditingCarId={setEditingCarId}
        editingCarData={editingCarData}
        setEditingCarData={setEditingCarData}
        startEditCar={startEditCar}
        handleEditCar={handleEditCar}
        handleDeleteCar={handleDeleteCar}
        getActiveBooking={getActiveBooking}
        newCar={newCar}
        setNewCar={setNewCar}
        handleAddCar={handleAddCar}
        btnBlue={btnBlue}
        btnRed={btnRed}
        btnGray={btnGray}
      />

      {/* Bookings Section */}
      <BookingsTable
        bookings={bookings}
        editingBookingId={editingBookingId}
        setEditingBookingId={setEditingBookingId}
        editingBookingDates={editingBookingDates}
        setEditingBookingDates={setEditingBookingDates}
        startEditBooking={startEditBooking}
        handleEditBooking={handleEditBooking}
        handleCancelBooking={handleCancelBooking}
        handleFulfillBooking={handleFulfillBooking}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        btnBlue={btnBlue}
        btnRed={btnRed}
        btnGray={btnGray}
      />

      {/* Reviews Section */}
      <ReviewsSection />

      {/* Users Section */}
      <UsersTable
        btnBlue={btnBlue}
        btnRed={btnRed}
        btnGray={btnGray}
      />
    </div>
  );
}

export default AdminDashboard;
