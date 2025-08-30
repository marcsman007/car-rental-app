// src/components/AdminDashboard/ReviewsSection.js
import React, { useEffect, useState } from "react";
import API from "../../services/api";

function ReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await API.get("/cars", { headers: { Authorization: `Bearer ${token}` } });
        const allReviews = res.data.flatMap(car =>
          (car.reviews || []).map(review => ({
            ...review,
            carMake: car.make,
            carModel: car.model,
            carId: car._id
          }))
        );
        setReviews(allReviews);
      } catch (err) {
        console.error(err);
        setMessage(err.response?.data?.message || "Failed to fetch reviews ❌");
      }
    };

    fetchReviews();
  }, [token]);

  const handleDeleteReview = async (carId, reviewId) => {
    if (!window.confirm("Delete this review?")) return;

    try {
      await API.delete(`/cars/${carId}/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setReviews(prev => prev.filter(r => r._id !== reviewId));
      setMessage("Review deleted ✅");
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to delete review ❌");
    }
  };

  // Function to get badge color based on rating
  const getRatingColor = (rating) => {
    switch (rating) {
      case 5: return "bg-green-500";
      case 4: return "bg-lime-500";
      case 3: return "bg-yellow-400 text-black";
      case 2: return "bg-orange-500";
      case 1: return "bg-red-600";
      default: return "bg-gray-400";
    }
  };

  return (
    <section className="w-full mt-12">
      <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
      {message && (
        <p className={`mb-4 text-center ${message.includes('❌') ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}

      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        <table className="w-full border border-gray-300 rounded">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">Car</th>
              <th className="border px-4 py-2">User</th>
              <th className="border px-4 py-2">Rating</th>
              <th className="border px-4 py-2">Comment</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(r => (
              <tr key={r._id}>
                <td className="border px-4 py-2">{r.carMake} {r.carModel}</td>
                <td className="border px-4 py-2">{r.user?.name}</td>
                <td className="border px-4 py-2">
                  <span className={`px-2 py-1 rounded text-white ${getRatingColor(r.rating)}`}>
                    {r.rating} ⭐
                  </span>
                </td>
                <td className="border px-4 py-2">{r.comment}</td>
                <td className="border px-4 py-2">
                  <button
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    onClick={() => handleDeleteReview(r.carId, r._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default ReviewsSection;
