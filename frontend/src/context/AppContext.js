import React, { createContext, useState, useEffect, useCallback } from "react";
import API from "../services/api";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [cars, setCars] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const token = localStorage.getItem("token");

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    if (token) {
      const decodedUser = parseJwt(token);
      if (decodedUser) setUser(decodedUser);
    }
  }, [token]);

  const role = user?.role || null;

  const fetchCars = useCallback(async () => {
    try {
      const res = await API.get("/cars");
      setCars(res.data);
    } catch (err) {
      console.error("Error fetching cars:", err);
    }
  }, []);

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

  const bookCar = async (carId, startDate, endDate) => {
    try {
      const res = await API.post(
        "/bookings",
        { carId, startDate, endDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newBooking = res.data;
      setUserBookings((prev) => [...prev, newBooking]);
      return newBooking;
    } catch (err) {
      console.error("Error creating booking:", err);
      throw err;
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      const res = await API.delete(`/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUserBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId ? { ...b, status: "canceled", canceledAt: new Date() } : b
        )
      );

      return res.data;
    } catch (err) {
      console.error("Error canceling booking:", err);
      throw err;
    }
  };

  const updateBooking = (updatedBooking) => {
    setUserBookings((prev) => {
      const exists = prev.some((b) => b._id === updatedBooking._id);
      if (exists) {
        return prev.map((b) => (b._id === updatedBooking._id ? { ...b, ...updatedBooking } : b));
      } else {
        return [...prev, updatedBooking];
      }
    });
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchCars();
      await fetchUserBookings();
      setLoading(false);
    };
    loadData();
  }, [fetchCars, fetchUserBookings]);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        cars,
        setCars,
        userBookings,
        setUserBookings,
        fetchCars,
        fetchUserBookings,
        bookCar,
        cancelBooking,
        updateBooking,
        role,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
