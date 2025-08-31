// src/components/AdminDashboard/DashboardStats.js
import React, { useMemo } from "react";

function DashboardStats({ cars = [], bookings = [], users = [] }) {
  // Calculate stats using useMemo for performance
  const stats = useMemo(() => {
    let totalBookings = bookings.length;
    let activeBookings = bookings.filter(b => b.status === "pending" || b.status === "confirmed").length;

    let totalRating = 0;
    let ratingCount = 0;
    cars.forEach(car => {
      const carReviews = car.reviews || [];
      carReviews.forEach(r => {
        totalRating += r.rating;
        ratingCount += 1;
      });
    });

    const avgRating = ratingCount ? (totalRating / ratingCount).toFixed(1) : 0;

    return {
      totalCars: cars.length,
      totalUsers: users.length,
      totalBookings,
      activeBookings,
      averageRating: avgRating,
    };
  }, [cars, bookings, users]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
      <div className="p-4 bg-blue-100 rounded text-center">
        <h3 className="font-semibold text-gray-700">Cars</h3>
        <p className="text-2xl font-bold">{stats.totalCars}</p>
      </div>
      <div className="p-4 bg-green-100 rounded text-center">
        <h3 className="font-semibold text-gray-700">Users</h3>
        <p className="text-2xl font-bold">{stats.totalUsers}</p>
      </div>
      <div className="p-4 bg-yellow-100 rounded text-center">
        <h3 className="font-semibold text-gray-700">Bookings</h3>
        <p className="text-2xl font-bold">{stats.totalBookings}</p>
      </div>
      <div className="p-4 bg-purple-100 rounded text-center">
        <h3 className="font-semibold text-gray-700">Active Bookings</h3>
        <p className="text-2xl font-bold">{stats.activeBookings}</p>
      </div>
      <div className="p-4 bg-red-100 rounded text-center">
        <h3 className="font-semibold text-gray-700">Avg Rating</h3>
        <p className="text-2xl font-bold">{stats.averageRating} ⭐</p>
      </div>
    </div>
  );
}

export default DashboardStats;
