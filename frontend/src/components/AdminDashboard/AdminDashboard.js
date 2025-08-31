import { useEffect, useState, useCallback } from "react";
import API from "../../services/api";
import DashboardStats from "./DashboardStats"; 
import CarsTable from "./CarsTable";
import BookingsTable from "./BookingsTable";
import ReviewsSection from "./ReviewsSection";
import UsersTable from "./UsersTable";
import Notification from "./common/Notification";

function AdminDashboard() {
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [newCar, setNewCar] = useState({ make: "", model: "", year: "", licensePlate: "", pricePerDay: "" });
  const [editingCarId, setEditingCarId] = useState(null);
  const [editingCarData, setEditingCarData] = useState({});
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [editingBookingDates, setEditingBookingDates] = useState({ startDate: "", endDate: "" });

  // For triggering ReviewsSection refresh
  const [reviewAdded, setReviewAdded] = useState(false);

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

  const fetchUsers = useCallback(async () => {
    try {
      const res = await API.get("/users", { headers: { Authorization: `Bearer ${token}` } });
      setUsers(Array.isArray(res.data) ? res.data : res.data.users || []);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to fetch users ❌");
    }
  }, [token]);

  // --- Trigger ReviewsSection Refresh ---
  const triggerReviewRefresh = () => {
    setReviewAdded(prev => !prev);
  };

  // --- Initial fetch & interval ---
  useEffect(() => {
    fetchCars();
    fetchBookings();
    fetchUsers();

    const interval = setInterval(() => {
      fetchCars();
      fetchBookings();
      fetchUsers();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchCars, fetchBookings, fetchUsers]);

  // --- Auto-clear message after 2 seconds ---
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 2000);
    return () => clearTimeout(timer);
  }, [message]);

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
  const btnBase = "px-3 py-1 rounded text-white font-semibold transition-colors duration-200 flex items-center gap-1";
  const btnBlue = `${btnBase} bg-blue-600 hover:bg-blue-700`;
  const btnRed = `${btnBase} bg-red-600 hover:bg-red-700`;
  const btnGray = `${btnBase} bg-gray-400 hover:bg-gray-500`;

  return (
    <div className="w-full max-w-[1600px] mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Dashboard</h1>

      {/* --- Notifications --- */}
      <Notification
        message={message}
        type={message.includes("❌") ? "error" : "success"}
      />

      {/* --- Dashboard Stats --- */}
      <DashboardStats
        cars={cars}
        bookings={bookings}
        users={users}
      />

      {/* --- Cars Section --- */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-2xl font-bold mb-4">Cars Management</h2>
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
      </div>

      {/* --- Bookings Section --- */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-2xl font-bold mb-4">Bookings Management</h2>
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
      </div>

      {/* --- Users Section --- */}
      <div className="bg-white shadow rounded-lg p-4">
        <UsersTable users={users} setUsers={setUsers} btnRed={btnRed} />
      </div>

      {/* --- Reviews Section --- */}
      <div className="bg-white shadow rounded-lg p-4">
        <ReviewsSection reviewAdded={reviewAdded} onReviewAdded={triggerReviewRefresh} />
      </div>
    </div>
  );
}

export default AdminDashboard;
