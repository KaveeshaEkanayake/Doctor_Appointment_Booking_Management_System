import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role");

  if (!token || role !== allowedRole) {
    // Redirect to the right login page based on which role was expected
    if (allowedRole === "admin") {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
}