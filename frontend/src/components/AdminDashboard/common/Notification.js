// src/components/AdminDashboard/common/Notification.js
import React from "react";

function Notification({ message, type }) {
  if (!message) return null;

  const baseClasses = "mb-4 text-center px-4 py-2 rounded font-medium";
  const typeClasses = type === "error" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600";

  return <p className={`${baseClasses} ${typeClasses}`}>{message}</p>;
}

export default Notification;
