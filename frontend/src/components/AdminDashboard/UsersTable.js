import React, { useEffect, useState, useMemo } from "react";
import API from "../../services/api";
import "./UsersTable.css";
import Pagination from "../Pagination";
import Notification from "./common/Notification";

function UsersTable({ users, setUsers, btnRed }) {
  const [message, setMessage] = useState("");
  const [highlighted, setHighlighted] = useState([]);
  const [removed, setRemoved] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc"); // asc or desc
  const itemsPerPage = 10;
  const token = localStorage.getItem("token");

  // --- Auto-clear message after 2 seconds ---
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 2000);
    return () => clearTimeout(timer);
  }, [message]);

  // Polling and highlighting
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get("/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const newUsers = Array.isArray(res.data) ? res.data : res.data.users || [];

        // Detect newly added or changed users
        const newIds = newUsers.map(u => u._id);
        const existingIds = users.map(u => u._id);
        const addedIds = newIds.filter(id => !existingIds.includes(id));
        const changedIds = newUsers
          .filter(newUser => {
            const oldUser = users.find(u => u._id === newUser._id);
            return oldUser && (oldUser.name !== newUser.name || oldUser.email !== newUser.email || oldUser.role !== newUser.role);
          })
          .map(u => u._id);

        if (addedIds.length || changedIds.length) {
          setHighlighted([...addedIds, ...changedIds]);
          setTimeout(() => {
            setHighlighted(prev => prev.filter(id => ![...addedIds, ...changedIds].includes(id)));
          }, 2000);
        }

        // Update users intelligently
        setUsers(prevUsers => {
          const updatedUsers = prevUsers.map(u => {
            const newUser = newUsers.find(nu => nu._id === u._id);
            return newUser ? newUser : u;
          });
          newUsers.forEach(nu => {
            if (!updatedUsers.find(u => u._id === nu._id)) updatedUsers.push(nu);
          });
          return updatedUsers;
        });
      } catch (err) {
        console.error(err);
        setMessage(err.response?.data?.message || "Failed to fetch users ❌");
      }
    };

    fetchUsers();
    const interval = setInterval(fetchUsers, 5000);
    return () => clearInterval(interval);
  }, [token, setUsers, users]);

  // Delete user with fade-out
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      setRemoved(prev => [...prev, userId]);
      setTimeout(async () => {
        await API.delete(`/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
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

  // --- Filtered users using useMemo ---
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const search = searchText.toLowerCase();
      const role = roleFilter.toLowerCase();
      const matchesSearch = u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search);
      const matchesRole = role === "all" ? true : (u.role || "user").toLowerCase() === role;
      return matchesSearch && matchesRole;
    });
  }, [users, searchText, roleFilter]);

  // --- Sorted users using useMemo ---
  const sortedUsers = useMemo(() => {
    if (!sortField) return filteredUsers;
    return [...filteredUsers].sort((a, b) => {
      const aField = (a[sortField] || "").toString().toLowerCase();
      const bField = (b[sortField] || "").toString().toLowerCase();
      if (aField < bField) return sortOrder === "asc" ? -1 : 1;
      if (aField > bField) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredUsers, sortField, sortOrder]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedUsers.slice(start, start + itemsPerPage);
  }, [sortedUsers, currentPage]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <section className="w-full mt-12">
      <h2 className="text-2xl font-semibold mb-4">Users</h2>

      <Notification
        message={message}
        type={message.includes("❌") ? "error" : "success"}
      />

      <div className="mb-4 flex flex-col sm:flex-row gap-2 sm:items-center">
        <input
          type="text"
          placeholder="Search by Name or Email"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="border px-2 py-1 rounded w-full sm:w-64"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="all">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {filteredUsers.length === 0 ? (
        <p className="text-center text-gray-600">No users found.</p>
      ) : (
        <>
          <table className="w-full border border-gray-300 rounded">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2 cursor-pointer" onClick={() => handleSort("name")}>
                  Name {sortField === "name" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                </th>
                <th className="border px-4 py-2 cursor-pointer" onClick={() => handleSort("email")}>
                  Email {sortField === "email" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                </th>
                <th className="border px-4 py-2 cursor-pointer" onClick={() => handleSort("role")}>
                  Role {sortField === "role" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                </th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map(user => (
                <tr
                  key={user._id}
                  className={`${highlighted.includes(user._id) ? "highlight" : ""} ${removed.includes(user._id) ? "fadeOut" : ""}`}
                >
                  <td className="border px-4 py-2">{user.name}</td>
                  <td className="border px-4 py-2">{user.email}</td>
                  <td className="border px-4 py-2">{user.role || "user"}</td>
                  <td className="border px-4 py-2 flex gap-2">
                    <button className={btnRed} onClick={() => handleDeleteUser(user._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination
            currentPage={currentPage}
            totalItems={filteredUsers.length}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </>
      )}
    </section>
  );
}

export default UsersTable;
