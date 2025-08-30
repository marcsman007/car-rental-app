// src/components/AdminDashboard/UsersTable.js
import React, { useEffect, useState, useCallback } from "react";
import API from "../../services/api";
import "./UsersTable.css";

function UsersTable({ btnRed }) {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [highlighted, setHighlighted] = useState([]);
  const [removed, setRemoved] = useState([]);
  const token = localStorage.getItem("token");

  // Fetch users from backend
  const fetchUsers = useCallback(async () => {
    try {
      const res = await API.get("/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const newUsers = Array.isArray(res.data) ? res.data : res.data.users || [];

      // Detect newly added users
      const newIds = newUsers.map(u => u._id);
      const existingIds = users.map(u => u._id);
      const addedIds = newIds.filter(id => !existingIds.includes(id));
      if (addedIds.length) {
        setHighlighted(addedIds);
        // Remove highlight after 2s
        setTimeout(() => setHighlighted(prev => prev.filter(id => !addedIds.includes(id))), 2000);
      }

      setUsers(newUsers);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to fetch users ❌");
      setUsers([]);
      setLoading(false);
    }
  }, [token, users]);

  useEffect(() => {
    fetchUsers(); // initial fetch
    const interval = setInterval(fetchUsers, 5000); // polling every 5s
    return () => clearInterval(interval);
  }, [fetchUsers]);

  // Delete user with fade-out
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      setRemoved(prev => [...prev, userId]); // mark as removing
      // Wait for fade-out animation to finish (500ms)
      setTimeout(async () => {
        await API.delete(`/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(prev => prev.filter(u => u._id !== userId));
        setRemoved(prev => prev.filter(id => id !== userId));
        setMessage("User deleted ✅");
      }, 500);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to delete user ❌");
      setRemoved(prev => prev.filter(id => id !== userId));
    }
  };

  if (loading) return <p className="text-center text-gray-600">Loading users...</p>;
  if (!users.length) return <p className="text-center text-gray-600">No users found.</p>;

  return (
    <section className="w-full mt-12">
      <h2 className="text-2xl font-semibold mb-4">Users</h2>
      {message && (
        <p className={`mb-4 text-center ${message.includes("❌") ? "text-red-600" : "text-green-600"}`}>
          {message}
        </p>
      )}
      <table className="w-full border border-gray-300 rounded">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Role</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr
              key={user._id}
              className={`${highlighted.includes(user._id) ? "highlight" : ""} ${
                removed.includes(user._id) ? "fadeOut" : ""
              }`}
            >
              <td className="border px-4 py-2">{user.name}</td>
              <td className="border px-4 py-2">{user.email}</td>
              <td className="border px-4 py-2">{user.role || "user"}</td>
              <td className="border px-4 py-2 flex gap-2">
                <button className={btnRed} onClick={() => handleDeleteUser(user._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default UsersTable;
