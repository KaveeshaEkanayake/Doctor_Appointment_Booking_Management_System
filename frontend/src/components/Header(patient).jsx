import React from "react";
import { FaBars, FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Header({ title, setIsSidebarOpen, notificationsCount }) {
  const navigate = useNavigate();

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user")) || {}; }
    catch { return {}; }
  })();

  const displayName = user.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : "Patient";

  const initial = user.firstName?.[0] ?? "P";

  return (
    <div className="flex justify-between items-center mb-6">

      {/* Left */}
      <div className="flex items-center gap-4">
        <FaBars
          className="text-xl cursor-pointer md:hidden"
          onClick={() => setIsSidebarOpen(prev => !prev)}
        />
        <div>
          <p className="text-sm text-gray-500">Hi, {user.firstName ?? "Patient"}!</p>
          <h2 className="text-2xl font-semibold">{title}</h2>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center space-x-4">
        <div className="relative cursor-pointer" onClick={() => navigate("/notifications")}>
          <FaBell className="text-lg" />
          {notificationsCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
              {notificationsCount}
            </span>
          )}
        </div>

        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => navigate("/patient/profile")}
        >
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
            {initial}
          </div>
          <span className="text-sm">{displayName}</span>
        </div>
      </div>
    </div>
  );
}