import React, { createContext, useState, useEffect, useCallback } from "react";
import API from "../services/api";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [cars, setCars] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null); // ✅ track logged-in user

  const token = localStorage.getItem("token");

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      return null;
    }
  };

  // Update user on mount if token exists
  useEffect(() => {
    if (token) {
      const decodedUser = parseJwt(token);
      if (decodedUser) setUser(decodedUser);
    }
  }, [token]);

  const role = user?.role || null;

  // Fetch cars
  const fetchCars = useCallback(async () => {
    try {
      const res = await API.get("/cars");
      setCars(res.data);
    } catch (err) {
      console.error("Error fetching cars:", err);
    }
  }, []);

  // Fetch user bookings (including canceled for history)
  const fetchUserBookings = useCallback(async () => {
    if (role === "user" && token) {
      try {
        const res = await API.get("/bookings/mybookings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserBookings(res.data);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      }
    }
  }, [role, token]);

  // Book a car
  const bookCar = async (carId, startDate, endDate) => {
    try {
      const res = await API.post(
        "/bookings",
        { carId, startDate, endDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newBooking = res.data;
      setUserBookings((prevBookings) => [...prevBookings, newBooking]);
      return newBooking;
    } catch (err) {
      console.error("Error creating booking:", err);
      throw err;
    }
  };

  // Cancel (soft cancel) a booking
  const cancelBooking = async (bookingId) => {
    try {
      const res = await API.delete(`/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUserBookings((prevBookings) =>
        prevBookings.map((b) =>
          b._id === bookingId ? { ...b, status: "canceled", canceledAt: new Date() } : b
        )
      );

      return res.data;
    } catch (err) {
      console.error("Error canceling booking:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchCars();
    fetchUserBookings();
    setLoading(false);
  }, [fetchCars, fetchUserBookings]);

  return (
    <AppContext.Provider
      value={{
        user, // ✅ expose user state
        setUser, // ✅ expose setUser for Login.js
        cars,
        setCars,
        userBookings,
        setUserBookings,
        fetchCars,
        fetchUserBookings,
        bookCar,
        cancelBooking,
        role,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
