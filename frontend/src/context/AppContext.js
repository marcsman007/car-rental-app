import React, { createContext, useState, useEffect, useCallback } from "react";
import API from "../services/api";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [cars, setCars] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      return null;
    }
  };
  const role = parseJwt(token)?.role;

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
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const newBooking = res.data;

      // Add booking to userBookings
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

      // Update booking status to canceled in context
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
        cars,
        setCars,
        userBookings,
        setUserBookings,
        fetchCars,
        fetchUserBookings,
        bookCar,
        cancelBooking, // ✅ new function
        role,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
