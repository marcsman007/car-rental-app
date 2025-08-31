// src/components/AdminDashboard/ReviewsSection.js
import React, { useEffect, useState, useMemo } from "react";
import API from "../../services/api";
import Pagination from "../Pagination";
import Notification from "./common/Notification";

function ReviewsSection({ reviewAdded, onReviewAdded }) {
  const [reviews, setReviews] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [filterCar, setFilterCar] = useState("all");
  const [filterRating, setFilterRating] = useState("all");
  const [filterVerified, setFilterVerified] = useState("all");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [highlighted, setHighlighted] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState({});
  const [expandedRows, setExpandedRows] = useState([]);
  const [newReview, setNewReview] = useState({ carId: "", userId: "", rating: 5, comment: "" });

  const itemsPerPage = 10;
  const token = localStorage.getItem("token");

  // Auto-clear messages
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 2000);
    return () => clearTimeout(timer);
  }, [message]);

  // Fetch reviews whenever reviewAdded toggles
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const carsRes = await API.get("/cars", { headers: { Authorization: `Bearer ${token}` } });
        const usersRes = await API.get("/users", { headers: { Authorization: `Bearer ${token}` } });
        const allUsers = Array.isArray(usersRes.data) ? usersRes.data : usersRes.data.users || [];
        setUsers(allUsers);

        const allReviews = carsRes.data.flatMap(car =>
          (car.reviews || []).map(review => {
            const user = allUsers.find(u => u._id === review.user);
            return {
              ...review,
              carMake: car.make,
              carModel: car.model,
              carId: car._id,
              user: user || { name: "Unknown", verified: false },
            };
          })
        );

        // Highlight new reviews
        const newIds = allReviews.map(r => r._id);
        setHighlighted(newIds);
        setTimeout(() => setHighlighted([]), 2000);

        setReviews(allReviews);

        // Notify parent refresh happened
        if (onReviewAdded) onReviewAdded();
      } catch (err) {
        console.error(err);
        setMessage(err.response?.data?.message || "Failed to fetch reviews ❌");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [token, reviewAdded, onReviewAdded]);

  const handleDeleteReview = async (carId, reviewId) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      setReviews(prev => prev.filter(r => r._id !== reviewId));
      await API.delete(`/cars/${carId}/reviews/${reviewId}`, { headers: { Authorization: `Bearer ${token}` } });
      setMessage("Review deleted ✅");
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to delete review ❌");
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!newReview.carId || !newReview.userId || !newReview.comment) {
      setMessage("All fields are required ❌");
      return;
    }
    try {
      await API.post(
        `/cars/${newReview.carId}/reviews`,
        { user: newReview.userId, rating: Number(newReview.rating), comment: newReview.comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Review added ✅");
      setNewReview({ carId: "", userId: "", rating: 5, comment: "" });
      if (onReviewAdded) onReviewAdded(); // trigger refresh
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to add review ❌");
    }
  };

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

  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      const matchesSearch = r.user?.name.toLowerCase().includes(searchText.toLowerCase());
      const matchesCar = filterCar === "all" ? true : `${r.carMake} ${r.carModel}`.toLowerCase() === filterCar.toLowerCase();
      const matchesRating = filterRating === "all" ? true : r.rating === Number(filterRating);
      const matchesVerified = filterVerified === "all" ? true :
        filterVerified === "verified" ? r.user?.verified : !r.user?.verified;
      const matchesStartDate = filterStartDate ? new Date(r.createdAt) >= new Date(filterStartDate) : true;
      const matchesEndDate = filterEndDate ? new Date(r.createdAt) <= new Date(filterEndDate) : true;
      return matchesSearch && matchesCar && matchesRating && matchesVerified && matchesStartDate && matchesEndDate;
    });
  }, [reviews, searchText, filterCar, filterRating, filterVerified, filterStartDate, filterEndDate]);

  const sortedReviews = useMemo(() => {
    if (!sortField) return filteredReviews;
    return [...filteredReviews].sort((a, b) => {
      let aVal, bVal;
      if (sortField === "user.name") {
        aVal = a.user?.name.toLowerCase() || "";
        bVal = b.user?.name.toLowerCase() || "";
      } else if (sortField === "createdAt") {
        aVal = new Date(a.createdAt);
        bVal = new Date(b.createdAt);
      } else {
        aVal = (a[sortField] || "").toString().toLowerCase();
        bVal = (b[sortField] || "").toString().toLowerCase();
      }
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredReviews, sortField, sortOrder]);

  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedReviews.slice(start, start + itemsPerPage);
  }, [sortedReviews, currentPage]);

  const handleSort = (field) => {
    if (sortField === field) setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const toggleRow = (reviewId) => {
    setExpandedRows(prev =>
      prev.includes(reviewId)
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  const handleNoteChange = (reviewId, value) => {
    setNotes(prev => ({ ...prev, [reviewId]: value }));
  };

  if (loading) return <p className="text-center text-gray-600">Loading reviews...</p>;

  return (
    <section className="w-full mt-12">
      <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
      <Notification message={message} type={message.includes("❌") ? "error" : "success"} />

      {/* --- Add Review --- */}
      <form className="mb-4 flex flex-col sm:flex-row gap-2 flex-wrap items-center" onSubmit={handleAddReview}>
        <select
          value={newReview.carId}
          onChange={e => setNewReview(prev => ({ ...prev, carId: e.target.value }))}
          className="border px-2 py-1 rounded"
        >
          <option value="">Select Car</option>
          {[...new Set(reviews.map(r => ({ id: r.carId, label: `${r.carMake} ${r.carModel}` })))]
            .map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
        <select
          value={newReview.userId}
          onChange={e => setNewReview(prev => ({ ...prev, userId: e.target.value }))}
          className="border px-2 py-1 rounded"
        >
          <option value="">Select User</option>
          {users.map(u => (
            <option key={u._id} value={u._id}>{u.name}</option>
          ))}
        </select>
        <select
          value={newReview.rating}
          onChange={e => setNewReview(prev => ({ ...prev, rating: e.target.value }))}
          className="border px-2 py-1 rounded"
        >
          {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} ⭐</option>)}
        </select>
        <input
          type="text"
          placeholder="Comment"
          value={newReview.comment}
          onChange={e => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
          className="border px-2 py-1 rounded flex-1"
        />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">Add Review</button>
      </form>

      {/* --- Filters --- */}
      <div className="mb-4 flex flex-col sm:flex-row gap-2 sm:items-center flex-wrap">
        <input
          type="text"
          placeholder="Search by User"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          className="border px-2 py-1 rounded w-full sm:w-64"
        />
        <select
          value={filterCar}
          onChange={e => setFilterCar(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="all">All Cars</option>
          {[...new Set(reviews.map(r => `${r.carMake} ${r.carModel}`))].map(car => (
            <option key={car} value={car}>{car}</option>
          ))}
        </select>
        <select
          value={filterRating}
          onChange={e => setFilterRating(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="all">All Ratings</option>
          {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} ⭐</option>)}
        </select>
        <select
          value={filterVerified}
          onChange={e => setFilterVerified(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="all">All Users</option>
          <option value="verified">Verified</option>
          <option value="guest">Guest</option>
        </select>
        <input
          type="date"
          value={filterStartDate}
          onChange={e => setFilterStartDate(e.target.value)}
          className="border px-2 py-1 rounded"
          placeholder="Start Date"
        />
        <input
          type="date"
          value={filterEndDate}
          onChange={e => setFilterEndDate(e.target.value)}
          className="border px-2 py-1 rounded"
          placeholder="End Date"
        />
      </div>

      {filteredReviews.length === 0 ? (
        <p className="text-center text-gray-600">No reviews found.</p>
      ) : (
        <>
          <table className="w-full border border-gray-300 rounded">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2 cursor-pointer" onClick={() => handleSort("carMake")}>
                  Car {sortField === "carMake" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                </th>
                <th className="border px-4 py-2 cursor-pointer" onClick={() => handleSort("user.name")}>
                  User {sortField === "user.name" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                </th>
                <th className="border px-4 py-2 cursor-pointer" onClick={() => handleSort("rating")}>
                  Rating {sortField === "rating" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                </th>
                <th className="border px-4 py-2 cursor-pointer" onClick={() => handleSort("comment")}>
                  Comment {sortField === "comment" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                </th>
                <th className="border px-4 py-2 cursor-pointer" onClick={() => handleSort("createdAt")}>
                  Date {sortField === "createdAt" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                </th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedReviews.map(r => (
                <React.Fragment key={r._id}>
                  <tr className={highlighted.includes(r._id) ? "highlight" : ""}>
                    <td className="border px-4 py-2">{r.carMake} {r.carModel}</td>
                    <td className="border px-4 py-2">{r.user?.name}</td>
                    <td className="border px-4 py-2">
                      <span className={`px-2 py-1 rounded text-white ${getRatingColor(r.rating)}`}>
                        {r.rating} ⭐
                      </span>
                    </td>
                    <td className="border px-4 py-2">{r.comment}</td>
                    <td className="border px-4 py-2">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="border px-4 py-2">
                      <button
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded mr-2"
                        onClick={() => handleDeleteReview(r.carId, r._id)}
                      >
                        Delete
                      </button>
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                        onClick={() => toggleRow(r._id)}
                      >
                        {expandedRows.includes(r._id) ? "Hide Notes" : "Add Note"}
                      </button>
                    </td>
                  </tr>
                  {expandedRows.includes(r._id) && (
                    <tr>
                      <td colSpan={6} className="border px-4 py-2 bg-gray-50">
                        <textarea
                          placeholder="Enter internal notes..."
                          value={notes[r._id] || ""}
                          onChange={e => handleNoteChange(r._id, e.target.value)}
                          className="w-full border rounded px-2 py-1"
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          <Pagination
            currentPage={currentPage}
            totalItems={filteredReviews.length}
            itemsPerPage={itemsPerPage}
            onPageChange={page => setCurrentPage(page)}
          />
        </>
      )}
    </section>
  );
}

export default ReviewsSection;
