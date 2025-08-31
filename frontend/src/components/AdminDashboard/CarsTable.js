import React, { useState, useEffect } from "react";
import Pagination from "../Pagination";
import Notification from "./common/Notification";

function CarsTable({
  cars,
  editingCarId,
  setEditingCarId,
  editingCarData,
  setEditingCarData,
  startEditCar,
  handleEditCar,
  handleDeleteCar,
  getActiveBooking,
  newCar,
  setNewCar,
  handleAddCar,
  btnBlue,
  btnRed,
  btnGray
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [message, setMessage] = useState("");
  const [filterText, setFilterText] = useState(""); // <-- Filter
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" }); // <-- Sort
  const itemsPerPage = 10;

  // --- Auto-clear message after 2 seconds ---
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 2000);
    return () => clearTimeout(timer);
  }, [message]);

  // --- Wrap handlers to set messages ---
  const wrappedHandleAddCar = async (e) => {
    try {
      await handleAddCar(e);
      setMessage("Car added ✅");
    } catch (err) {
      setMessage("Failed to add car ❌");
    }
  };

  const wrappedHandleEditCar = async (e) => {
    try {
      await handleEditCar(e);
      setMessage("Car updated ✅");
    } catch (err) {
      setMessage("Car update failed ❌");
    }
  };

  const wrappedHandleDeleteCar = async (carId) => {
    try {
      await handleDeleteCar(carId);
      setMessage("Car deleted ✅");
    } catch (err) {
      setMessage("Delete failed ❌");
    }
  };

  // --- Filter cars ---
  const filteredCars = cars.filter(car => {
    const text = filterText.toLowerCase();
    return (
      car.make.toLowerCase().includes(text) ||
      car.model.toLowerCase().includes(text) ||
      car.year.toString().includes(text) ||
      car.licensePlate.toLowerCase().includes(text)
    );
  });

  // --- Sort cars ---
  const sortedCars = [...filteredCars].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let aVal = a[sortConfig.key];
    let bVal = b[sortConfig.key];

    // Convert to string if needed
    if (typeof aVal === "string") aVal = aVal.toLowerCase();
    if (typeof bVal === "string") bVal = bVal.toLowerCase();

    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // --- Paginate cars ---
  const paginatedCars = sortedCars.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // --- Handle column sort ---
  const handleSort = (key) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      } else {
        return { key, direction: "asc" };
      }
    });
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Cars</h2>

      {/* --- Notifications --- */}
      <Notification
        message={message}
        type={message.includes("❌") ? "error" : "success"}
      />

      {/* --- Filter Input --- */}
      <div className="mb-2">
        <input
          type="text"
          placeholder="Filter by Make, Model, Year, License Plate"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="border px-2 py-1 rounded w-full sm:w-1/2 min-w-[250px]"
        />
      </div>

      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 cursor-pointer"
                  onClick={() => handleSort("make")}>Make {sortConfig.key === "make" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 cursor-pointer"
                  onClick={() => handleSort("model")}>Model {sortConfig.key === "model" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 cursor-pointer"
                  onClick={() => handleSort("year")}>Year {sortConfig.key === "year" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">License Plate</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 cursor-pointer"
                  onClick={() => handleSort("pricePerDay")}>Price/Day {sortConfig.key === "pricePerDay" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Active Booking</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedCars.map((car) => {
              const activeBooking = getActiveBooking(car._id);
              return (
                <tr key={car._id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition-colors">
                  <td className="px-4 py-2">{car.make}</td>
                  <td className="px-4 py-2">{car.model}</td>
                  <td className="px-4 py-2">{car.year}</td>
                  <td className="px-4 py-2">{car.licensePlate}</td>
                  <td className="px-4 py-2">{car.pricePerDay}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {activeBooking ? `${activeBooking.status} (${activeBooking.startDate.slice(0,10)} - ${activeBooking.endDate.slice(0,10)})` : "None"}
                  </td>
                  <td className="px-4 py-2 flex flex-wrap gap-2">
                    <button className={btnBlue} onClick={() => startEditCar(car)}>Edit</button>
                    <button className={btnRed} onClick={() => wrappedHandleDeleteCar(car._id)}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={sortedCars.length}
        itemsPerPage={itemsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* --- Add Car Form --- */}
      <form onSubmit={wrappedHandleAddCar} className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 items-end bg-gray-50 p-4 rounded-lg shadow-inner">
        <input
          type="text"
          placeholder="Make"
          value={newCar.make}
          onChange={(e) => setNewCar({ ...newCar, make: e.target.value })}
          className="border px-2 py-1 rounded w-full"
          required
        />
        <input
          type="text"
          placeholder="Model"
          value={newCar.model}
          onChange={(e) => setNewCar({ ...newCar, model: e.target.value })}
          className="border px-2 py-1 rounded w-full"
          required
        />
        <input
          type="number"
          placeholder="Year"
          value={newCar.year}
          onChange={(e) => setNewCar({ ...newCar, year: e.target.value })}
          className="border px-2 py-1 rounded w-full"
          required
        />
        <input
          type="text"
          placeholder="License Plate"
          value={newCar.licensePlate}
          onChange={(e) => setNewCar({ ...newCar, licensePlate: e.target.value })}
          className="border px-2 py-1 rounded w-full"
          required
        />
        <input
          type="number"
          placeholder="Price per Day"
          value={newCar.pricePerDay}
          onChange={(e) => setNewCar({ ...newCar, pricePerDay: e.target.value })}
          className="border px-2 py-1 rounded w-full"
          required
        />
        <button type="submit" className={btnBlue}>Add Car</button>
      </form>
    </div>
  );
}

export default CarsTable;
