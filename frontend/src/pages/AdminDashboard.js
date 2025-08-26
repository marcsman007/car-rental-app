import { useEffect, useState } from "react";
import API from "../services/api";

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
  const fetchCars = async () => {
    try {
      const res = await API.get("/cars", { headers: { Authorization: `Bearer ${token}` } });
      setCars(res.data);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to fetch cars ❌");
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await API.get("/bookings", { headers: { Authorization: `Bearer ${token}` } });
      setBookings(res.data);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to fetch bookings ❌");
    }
  };

  useEffect(() => {
    fetchCars();
    fetchBookings();
  }, []);

  const getCarAvailability = (carId) =>
    !bookings.find((b) => b.car?._id === carId && b.status !== "canceled");

  const getBookingForCar = (carId) =>
    bookings.find((b) => b.car?._id === carId && b.status !== "canceled");

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
      const updatedBooking = res.data;
      setBookings(bookings.map((b) => b._id === editingBookingId ? { ...b, ...updatedBooking } : b));
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
      setBookings(bookings.map((b) => b._id === id ? { ...b, ...canceledBooking } : b));
      setMessage(res.data.message || "Booking cancelled ✅");
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Cancel failed ❌");
    }
  };

  const filteredBookings = bookings.filter((b) => filterStatus === "all" || b.status === filterStatus);

  // --- Button Classes ---
  const btnBase = "px-3 py-1 rounded text-white font-semibold transition-colors duration-200";
  const btnBlue = `${btnBase} bg-blue-600 hover:bg-blue-700`;
  const btnRed = `${btnBase} bg-red-600 hover:bg-red-700`;
  const btnGray = `${btnBase} bg-gray-400 hover:bg-gray-500`;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Dashboard</h1>
      {message && <p className={`mb-4 text-center ${message.includes('❌') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}

      {/* Cars Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Cars</h2>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Cars List */}
          <ul className="grid grid-cols-1 gap-4 md:w-2/3">
            {cars.length === 0 ? <p>No cars available</p> : (
              cars.map((car) => {
                const isBooked = !getCarAvailability(car._id);
                const booking = getBookingForCar(car._id);
                return (
                  <li key={car._id} className={`p-4 rounded shadow ${isBooked ? "bg-red-100" : "bg-green-100"}`}>
                    {editingCarId === car._id ? (
                      <form className="flex flex-col gap-2" onSubmit={handleEditCar}>
                        {["make","model","year","licensePlate","pricePerDay"].map((field) => (
                          <input
                            key={field}
                            type={field === "year" || field === "pricePerDay" ? "number" : "text"}
                            value={editingCarData[field]}
                            onChange={(e) => setEditingCarData({ ...editingCarData, [field]: e.target.value })}
                            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        ))}
                        <div className="flex gap-2 mt-2">
                          <button type="submit" className={btnBlue}>Save</button>
                          <button type="button" onClick={() => setEditingCarId(null)} className={btnGray}>Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                        <span>{car.make} {car.model} | ₱{car.pricePerDay}/day
                          {booking && <span className="ml-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded uppercase font-bold" title={`Booked by ${booking.user?.name}`}>Booked</span>}
                        </span>
                        <div className="flex gap-2 mt-2 md:mt-0">
                          <button onClick={() => startEditCar(car)} className={btnBlue}>Edit</button>
                          <button onClick={() => handleDeleteCar(car._id)} className={btnRed}>Delete</button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })
            )}
          </ul>

          {/* Add / Edit Car Form */}
          <div className="md:w-1/3 p-4 border rounded shadow bg-white">
            <h3 className="text-xl font-semibold mb-3">{editingCarId ? "Edit Car" : "Add New Car"}</h3>
            <form className="flex flex-col gap-2" onSubmit={editingCarId ? handleEditCar : handleAddCar}>
              {["make","model","year","licensePlate","pricePerDay"].map((field) => (
                <input
                  key={field}
                  type={field === "year" || field === "pricePerDay" ? "number" : "text"}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={editingCarId ? editingCarData[field] : newCar[field]}
                  onChange={(e) => editingCarId
                    ? setEditingCarData({ ...editingCarData, [field]: e.target.value })
                    : setNewCar({ ...newCar, [field]: e.target.value })}
                  className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              ))}
              <button type="submit" className={`${btnGray} mt-2`}>{editingCarId ? "Save Car" : "Add Car"}</button>
              {editingCarId && <button type="button" onClick={() => setEditingCarId(null)} className={`${btnGray} mt-2`}>Cancel Edit</button>}
            </form>
          </div>
        </div>
      </section>

      {/* Bookings Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Bookings</h2>
        <div className="flex flex-col gap-6">
          <div className="mb-4">
            <label className="mr-2 font-semibold">Filter by status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="confirmed">Confirmed</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>

          {filteredBookings.length === 0 ? (
            <p>No bookings found</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBookings.map((booking) => {
                const bgColor = booking.status === "confirmed" ? "bg-green-100" : "bg-red-100";
                return (
                  <li key={booking._id} className={`p-4 rounded shadow ${bgColor}`}>
                    {editingBookingId === booking._id ? (
                      <form className="flex flex-col gap-2" onSubmit={handleEditBooking}>
                        <input type="date" value={editingBookingDates.startDate} onChange={(e) => setEditingBookingDates({ ...editingBookingDates, startDate: e.target.value })} className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                        <input type="date" value={editingBookingDates.endDate} onChange={(e) => setEditingBookingDates({ ...editingBookingDates, endDate: e.target.value })} className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                        <div className="flex gap-2 mt-2">
                          <button type="submit" className={btnBlue}>Save</button>
                          <button type="button" onClick={() => setEditingBookingId(null)} className={btnGray}>Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <p><strong>Car:</strong> {booking.car?.make} {booking.car?.model}</p>
                        <p><strong>User:</strong> {booking.user?.name} ({booking.user?.email})</p>
                        <p><strong>From:</strong> {new Date(booking.startDate).toLocaleDateString()}</p>
                        <p><strong>To:</strong> {new Date(booking.endDate).toLocaleDateString()}</p>
                        <p><strong>Status:</strong> {booking.status}</p>
                        {booking.status === 'canceled' && booking.canceledAt && (
                          <p><strong>Cancelled on:</strong> {new Date(booking.canceledAt).toLocaleString()}</p>
                        )}
                        <div className="flex gap-2 mt-2">
                          {booking.status !== 'canceled' && <button onClick={() => handleCancelBooking(booking._id)} className={btnRed}>Cancel</button>}
                          <button onClick={() => startEditBooking(booking)} className={btnBlue}>Edit</button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;
