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
      const res = await API.get("/cars");
      setCars(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await API.get("/bookings", { headers: { Authorization: `Bearer ${token}` } });
      setBookings(res.data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  useEffect(() => {
    fetchCars();
    fetchBookings();
  }, []);

  // --- Compute Car Availability ---
  const getCarAvailability = (carId) => !bookings.find(b => b.car?._id === carId && b.status !== "canceled");
  const getBookingForCar = (carId) => bookings.find(b => b.car?._id === carId && b.status !== "canceled");

  // --- Car Handlers ---
  const handleAddCar = async (e) => {
    e.preventDefault();
    try {
      await API.post("/cars", { ...newCar, year: Number(newCar.year), pricePerDay: Number(newCar.pricePerDay) }, { headers: { Authorization: `Bearer ${token}` } });
      setMessage("Car added ✅");
      setNewCar({ make: "", model: "", year: "", licensePlate: "", pricePerDay: "" });
      fetchCars();
    } catch (err) {
      console.error(err);
      setMessage("Failed to add car ❌");
    }
  };

  const startEditCar = (car) => {
    setEditingCarId(car._id);
    setEditingCarData({ ...car });
  };

  const handleEditCar = async (e) => {
    e.preventDefault();
    try {
      await API.patch(`/cars/${editingCarId}`, { ...editingCarData, year: Number(editingCarData.year), pricePerDay: Number(editingCarData.pricePerDay) }, { headers: { Authorization: `Bearer ${token}` } });
      setMessage("Car updated ✅");
      setEditingCarId(null);
      fetchCars();
    } catch (err) {
      console.error(err);
      setMessage("Car update failed ❌");
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
      setMessage("Delete failed ❌");
    }
  };

  // --- Booking Handlers ---
  const startEditBooking = (booking) => {
    setEditingBookingId(booking._id);
    setEditingBookingDates({ startDate: booking.startDate.slice(0, 10), endDate: booking.endDate.slice(0, 10) });
  };

  const handleEditBooking = async (e) => {
    e.preventDefault();
    try {
      const res = await API.patch(`/bookings/${editingBookingId}`, { startDate: editingBookingDates.startDate, endDate: editingBookingDates.endDate, status: "confirmed" }, { headers: { Authorization: `Bearer ${token}` } });
      const updatedBooking = res.data.booking;
      setBookings(bookings.map(b => b._id === editingBookingId ? { ...b, ...updatedBooking } : b));
      setMessage("Booking confirmed ✅");
      setEditingBookingId(null);
    } catch (err) {
      console.error(err);
      setMessage("Booking update failed ❌");
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      const res = await API.delete(`/bookings/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const canceledBooking = res.data.booking;
      setBookings(bookings.map(b => b._id === id ? { ...b, status: canceledBooking.status, canceledAt: canceledBooking.canceledAt } : b));
      setMessage(res.data.message || "Booking cancelled ✅");
    } catch (err) {
      console.error(err);
      setMessage("Cancel failed ❌");
    }
  };

  // --- Filtered Bookings ---
  const filteredBookings = bookings.filter(b => filterStatus === "all" || b.status === filterStatus);

  return (
    <div className="container">
      <h1>Admin Dashboard</h1>
      <p>{message}</p>

      {/* Cars Section */}
      <section>
        <h2>Cars</h2>
        {cars.length === 0 ? <p>No cars available</p> : (
          <ul>
            {cars.map(car => {
              const isBooked = !getCarAvailability(car._id);
              const booking = getBookingForCar(car._id);
              return (
                <li key={car._id} style={{ marginBottom: "10px", borderBottom: "1px solid #ccc", paddingBottom: "5px", backgroundColor: isBooked ? "#f8d7da" : "#d4edda", position: "relative" }}>
                  {editingCarId === car._id ? (
                    <form onSubmit={handleEditCar}>
                      <input type="text" value={editingCarData.make} onChange={(e) => setEditingCarData({ ...editingCarData, make: e.target.value })} required />
                      <input type="text" value={editingCarData.model} onChange={(e) => setEditingCarData({ ...editingCarData, model: e.target.value })} required />
                      <input type="number" value={editingCarData.year} onChange={(e) => setEditingCarData({ ...editingCarData, year: e.target.value })} required />
                      <input type="text" value={editingCarData.licensePlate} onChange={(e) => setEditingCarData({ ...editingCarData, licensePlate: e.target.value })} required />
                      <input type="number" value={editingCarData.pricePerDay} onChange={(e) => setEditingCarData({ ...editingCarData, pricePerDay: e.target.value })} required />
                      <button type="submit">Save</button>
                      <button type="button" onClick={() => setEditingCarId(null)}>Cancel</button>
                    </form>
                  ) : (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                      <span>{car.make} {car.model} | ₱{car.pricePerDay}/day {booking && (
                        <span style={{ backgroundColor: "#721c24", color: "white", padding: "2px 5px", borderRadius: "3px", fontSize: "0.8rem" }}
                          title={`Booked by ${booking.user?.name} from ${new Date(booking.startDate).toLocaleDateString()} to ${new Date(booking.endDate).toLocaleDateString()}`}>
                          Booked
                        </span>
                      )}</span>
                      <div style={{ display: "flex", gap: "5px" }}>
                        <button onClick={() => startEditCar(car)}>Edit</button>
                        <button onClick={() => handleDeleteCar(car._id)} style={{ background: "red", color: "white" }}>Delete</button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        <h3>Add New Car</h3>
        <form onSubmit={handleAddCar}>
          <input type="text" placeholder="Make" value={newCar.make} onChange={(e) => setNewCar({ ...newCar, make: e.target.value })} required />
          <input type="text" placeholder="Model" value={newCar.model} onChange={(e) => setNewCar({ ...newCar, model: e.target.value })} required />
          <input type="number" placeholder="Year" value={newCar.year} onChange={(e) => setNewCar({ ...newCar, year: e.target.value })} required />
          <input type="text" placeholder="License Plate" value={newCar.licensePlate} onChange={(e) => setNewCar({ ...newCar, licensePlate: e.target.value })} required />
          <input type="number" placeholder="Price per Day" value={newCar.pricePerDay} onChange={(e) => setNewCar({ ...newCar, pricePerDay: e.target.value })} required />
          <button type="submit">Add Car</button>
        </form>
      </section>

      {/* Bookings Section */}
      <section>
        <h2>Bookings</h2>

        {/* Filter */}
        <div style={{ marginBottom: "10px" }}>
          <label>Filter by status: </label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All</option>
            <option value="confirmed">Confirmed</option>
            <option value="canceled">Canceled</option>
          </select>
        </div>

        {filteredBookings.length === 0 ? <p>No bookings found</p> : (
          <ul>
            {filteredBookings.map(booking => {
              let bgColor = booking.status === "confirmed" ? "#d4edda" : "#f8d7da"; // green or red

              return (
                <li key={booking._id} style={{ marginBottom: "10px", borderBottom: "1px solid #ccc", paddingBottom: "5px", backgroundColor: bgColor }}>
                  {editingBookingId === booking._id ? (
                    <form onSubmit={handleEditBooking}>
                      <input type="date" value={editingBookingDates.startDate} onChange={(e) => setEditingBookingDates({ ...editingBookingDates, startDate: e.target.value })} required />
                      <input type="date" value={editingBookingDates.endDate} onChange={(e) => setEditingBookingDates({ ...editingBookingDates, endDate: e.target.value })} required />
                      <button type="submit">Save</button>
                      <button type="button" onClick={() => setEditingBookingId(null)}>Cancel</button>
                    </form>
                  ) : (
                    <>
                      <p><strong>Car:</strong> {booking.car?.make} {booking.car?.model}</p>
                      <p><strong>User:</strong> {booking.user?.name} ({booking.user?.email})</p>
                      <p><strong>From:</strong> {new Date(booking.startDate).toLocaleDateString()}</p>
                      <p><strong>To:</strong> {new Date(booking.endDate).toLocaleDateString()}</p>
                      <p><strong>Status:</strong> {booking.status}</p>
                      {booking.status === 'canceled' && booking.canceledAt && (
                        <p><strong>Cancelled on:</strong> {new Date(booking.canceledAt).toLocaleString()}</p>
                      )}
                      <div style={{ display: "flex", gap: "5px", marginTop: "5px" }}>
                        {booking.status !== 'canceled' && (
                          <button onClick={() => handleCancelBooking(booking._id)} style={{ background: "red", color: "white", border: "none", padding: "5px 10px", cursor: "pointer" }}>Cancel</button>
                        )}
                        <button onClick={() => startEditBooking(booking)} style={{ background: "blue", color: "white", border: "none", padding: "5px 10px", cursor: "pointer" }}>Edit</button>
                      </div>
                    </>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;
