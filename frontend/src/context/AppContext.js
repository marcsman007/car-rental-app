import React, { createContext, useState, useEffect, useCallback } from "react";
import API from "../services/api";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [cars, setCars] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const token = localStorage.getItem("token");

  // Decode JWT to get user info
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

  // Fetch all cars
  const fetchCars = useCallback(async () => {
    try {
      const res = await API.get("/cars");
      setCars(res.data);
    } catch (err) {
      console.error("Error fetching cars:", err);
    }
  }, []);

  // Fetch bookings
  const fetchUserBookings = useCallback(async () => {
    if (!token) return;

    try {
      let res;
      if (role === "user") {
        res = await API.get("/bookings/mybookings", {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else if (role === "admin") {
        res = await API.get("/bookings", {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setUserBookings(res.data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  }, [role, token]);

  // --- User actions ---
  const bookCar = async (carId, startDate, endDate) => {
    try {
      const res = await API.post(
        "/bookings",
        { carId, startDate, endDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newBooking = res.data;

      // Update user bookings
      setUserBookings((prev) => [...prev, newBooking]);

      // Remove booked car from available cars
      setCars((prevCars) => prevCars.filter((car) => car._id !== carId));

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

      // Update user bookings state
      setUserBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId ? { ...b, status: "canceled", canceledAt: new Date() } : b
        )
      );

      // Refetch cars to update availability
      await fetchCars();

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

  // --- Admin actions ---
  const addCar = async (carData) => {
    try {
      const res = await API.post("/cars", carData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCars((prev) => [...prev, res.data]);
      return res.data;
    } catch (err) {
      console.error("Error adding car:", err);
      throw err;
    }
  };

  const updateCar = async (carId, updatedData) => {
    try {
      const res = await API.put(`/cars/${carId}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedCar = res.data;
      setCars((prev) =>
        prev.map((c) => (c._id === carId ? { ...c, ...updatedCar } : c))
      );
      return updatedCar;
    } catch (err) {
      console.error("Error updating car:", err);
      throw err;
    }
  };

  const deleteCar = async (carId) => {
    try {
      await API.delete(`/cars/${carId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCars((prev) => prev.filter((c) => c._id !== carId));
    } catch (err) {
      console.error("Error deleting car:", err);
      throw err;
    }
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchCars();
      await fetchUserBookings();
      setLoading(false);
    };
    loadData();
  }, [fetchCars, fetchUserBookings]);

  // --- Poll user bookings every 10 seconds for live updates ---
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      fetchUserBookings();
    }, 10000); // every 10 seconds

    return () => clearInterval(interval); // cleanup on unmount
  }, [fetchUserBookings, token]);

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
        addCar,
        updateCar,
        deleteCar,
        role,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
