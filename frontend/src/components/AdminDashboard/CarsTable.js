import React from "react";

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
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Cars</h2>

      <table className="w-full border border-gray-300 rounded">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">Make</th>
            <th className="border px-4 py-2">Model</th>
            <th className="border px-4 py-2">Year</th>
            <th className="border px-4 py-2">License Plate</th>
            <th className="border px-4 py-2">Price/Day</th>
            <th className="border px-4 py-2">Active Booking</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {cars.map((car) => {
            const activeBooking = getActiveBooking(car._id);
            return (
              <tr key={car._id}>
                <td className="border px-4 py-2">{car.make}</td>
                <td className="border px-4 py-2">{car.model}</td>
                <td className="border px-4 py-2">{car.year}</td>
                <td className="border px-4 py-2">{car.licensePlate}</td>
                <td className="border px-4 py-2">{car.pricePerDay}</td>
                <td className="border px-4 py-2">
                  {activeBooking ? `${activeBooking.status} (${activeBooking.startDate.slice(0,10)} - ${activeBooking.endDate.slice(0,10)})` : "None"}
                </td>
                <td className="border px-4 py-2 flex flex-wrap gap-2">
                  <button className={btnBlue} onClick={() => startEditCar(car)}>Edit</button>
                  <button className={btnRed} onClick={() => handleDeleteCar(car._id)}>Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <form onSubmit={handleAddCar} className="mt-4 flex flex-wrap gap-2 items-end">
        <input
          type="text"
          placeholder="Make"
          value={newCar.make}
          onChange={(e) => setNewCar({ ...newCar, make: e.target.value })}
          className="border px-2 py-1 rounded"
          required
        />
        <input
          type="text"
          placeholder="Model"
          value={newCar.model}
          onChange={(e) => setNewCar({ ...newCar, model: e.target.value })}
          className="border px-2 py-1 rounded"
          required
        />
        <input
          type="number"
          placeholder="Year"
          value={newCar.year}
          onChange={(e) => setNewCar({ ...newCar, year: e.target.value })}
          className="border px-2 py-1 rounded"
          required
        />
        <input
          type="text"
          placeholder="License Plate"
          value={newCar.licensePlate}
          onChange={(e) => setNewCar({ ...newCar, licensePlate: e.target.value })}
          className="border px-2 py-1 rounded"
          required
        />
        <input
          type="number"
          placeholder="Price per Day"
          value={newCar.pricePerDay}
          onChange={(e) => setNewCar({ ...newCar, pricePerDay: e.target.value })}
          className="border px-2 py-1 rounded"
          required
        />
        <button type="submit" className={btnBlue}>Add Car</button>
      </form>
    </div>
  );
}

export default CarsTable;
