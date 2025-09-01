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
  const [adminReplies, setAdminReplies] = useState({});
  const [expandedRows, setExpandedRows] = useState([]);

  const itemsPerPage = 10;
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 2000);
    return () => clearTimeout(timer);
  }, [message]);

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
            note: review.note || "",
            adminReply: review.adminReply || "", // fixed
          };
        })
      );

      setReviews(allReviews);

      const initialNotes = {};
      const initialReplies = {};
      allReviews.forEach(r => {
        initialNotes[r._id] = r.note || "";
        initialReplies[r._id] = r.adminReply || "";
      });
      setNotes(initialNotes);
      setAdminReplies(initialReplies);

    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to fetch reviews ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [token, reviewAdded]);

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

  const handleReplyChange = (reviewId, value) => {
    setAdminReplies(prev => ({ ...prev, [reviewId]: value }));
  };

  const saveNote = async (reviewId, carId) => {
    try {
      const noteValue = notes[reviewId] || "";
      await API.put(`/cars/${carId}/reviews/${reviewId}/note`, { note: noteValue }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(prev => ({ ...prev, [reviewId]: noteValue }));
      setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, note: noteValue } : r));
      setMessage("Note saved ✅");
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to save note ❌");
    }
  };

  const saveReply = async (reviewId, carId) => {
    try {
      const replyValue = adminReplies[reviewId] || "";
      await API.put(`/cars/${carId}/reviews/${reviewId}/reply`, { adminReply: replyValue }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdminReplies(prev => ({ ...prev, [reviewId]: replyValue }));
      setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, adminReply: replyValue } : r));
      setMessage("Reply saved ✅");
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to save reply ❌");
    }
  };

  if (loading) return <p className="text-center text-gray-600">Loading reviews...</p>;

  return (
    <section className="w-full mt-12">
      <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
      <Notification message={message} type={message.includes("❌") ? "error" : "success"} />

      {/* Filters */}
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
        />
        <input
          type="date"
          value={filterEndDate}
          onChange={e => setFilterEndDate(e.target.value)}
          className="border px-2 py-1 rounded"
        />
      </div>

      {/* Table */}
      {filteredReviews.length === 0 ? (
        <p className="text-center text-gray-600">No reviews found.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 rounded min-w-[700px]">
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
                      <td className="border px-4 py-2 whitespace-nowrap">
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
                          {expandedRows.includes(r._id) ? "Hide Details" : "Add Note / Reply"}
                        </button>
                      </td>
                    </tr>
                    {expandedRows.includes(r._id) && (
                      <tr>
                        <td colSpan={6} className="border px-4 py-2 bg-gray-50 space-y-2">
                          <textarea
                            placeholder="Enter internal notes..."
                            value={notes[r._id] || ""}
                            onChange={e => handleNoteChange(r._id, e.target.value)}
                            className="w-full border rounded px-2 py-1"
                          />
                          <button
                            className="mt-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                            onClick={() => saveNote(r._id, r.carId)}
                          >
                            Save Note
                          </button>

                          <textarea
                            placeholder="Enter admin reply to customer..."
                            value={adminReplies[r._id] || ""}
                            onChange={e => handleReplyChange(r._id, e.target.value)}
                            className="w-full border rounded px-2 py-1 mt-2"
                          />
                          <button
                            className="mt-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded"
                            onClick={() => saveReply(r._id, r.carId)}
                          >
                            Save Reply
                          </button>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

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
