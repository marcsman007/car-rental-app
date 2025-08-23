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

  // ✅ fetchCars wrapped in useCallback
  const fetchCars = useCallback(async () => {
    try {
      const res = await API.get("/cars");
      setCars(res.data);
    } catch (err) {
      console.error("Error fetching cars:", err);
    }
  }, []);

  // ✅ fetchUserBookings wrapped in useCallback
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

  // ✅ New function to handle booking and update context
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

      // remove car from available cars
      setCars((prevCars) => prevCars.filter((c) => c._id !== carId));

      // add booking to userBookings
      setUserBookings((prevBookings) => [...prevBookings, newBooking]);

      return newBooking;
    } catch (err) {
      console.error("Error creating booking:", err);
      throw err;
    }
  };

  // ✅ include dependencies in useEffect
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
        role,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
