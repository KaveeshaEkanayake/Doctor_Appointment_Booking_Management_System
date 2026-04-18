import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logoImg from "../assets/Logo04.PNG";
import { FaHome, FaCalendarAlt, FaUser, FaSignOutAlt, FaCreditCard, FaHistory } from "react-icons/fa";

export default function Sidebar({ activeMenu, setActiveMenu }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 ${
      isActive ? "text-blue-600 font-semibold" : "text-gray-600 hover:text-blue-600"
    }`;

  return (
    <div className="h-full w-64 bg-blue-50 p-6">
      <div className="flex items-center mb-10">
        <img src={logoImg} className="h-10 mr-2" alt="MediCare" />
      </div>

      <div className="space-y-6">
        <NavLink to="/patient/dashboard" className={linkClass}>
          <FaHome /> Dashboard
        </NavLink>

        <NavLink to="/my-appointments" className={linkClass}>
          <FaCalendarAlt /> Appointment
        </NavLink>

        {activeMenu && setActiveMenu && (
          <div className="ml-6 mt-2 text-sm space-y-2">
            <p
              onClick={() => setActiveMenu("upcoming")}
              className={`cursor-pointer ${
                activeMenu === "upcoming"
                  ? "bg-blue-100 text-blue-600 px-2 py-1 rounded"
                  : "text-gray-500"
              }`}
            >
              Upcoming Appointment
            </p>
            <p
              onClick={() => setActiveMenu("past")}
              className={`cursor-pointer ${
                activeMenu === "past"
                  ? "bg-blue-100 text-blue-600 px-2 py-1 rounded"
                  : "text-gray-500"
              }`}
            >
              Past Appointment
            </p>
          </div>
        )}

        <NavLink to="/patient/appointment-history" className={linkClass}>
          <FaHistory /> History
        </NavLink>

        <NavLink to="/patient/profile" className={linkClass}>
          <FaUser /> Profile
        </NavLink>

        <NavLink to="/patient/billing" className={linkClass}>
          <FaCreditCard /> Billing
        </NavLink>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 w-full"
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </div>
  );
}