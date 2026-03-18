import React from "react";
import { FaBars, FaBell } from "react-icons/fa";
import profile_pic from "../assets/profile_pic.png";
import { useNavigate } from "react-router-dom";

export default function Header({
  title,
  setIsSidebarOpen,
  notificationsCount
}) {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center mb-6">
      
      {/* LEFT SIDE */}
      <div className="flex items-center gap-4">
        <FaBars
          className="text-xl cursor-pointer md:hidden"
          onClick={() => setIsSidebarOpen(prev => !prev)}
        />
        <h2 className="text-2xl font-semibold">{title}</h2>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center space-x-4">
        
        {/* 🔔 Notifications */}
        <div
          className="relative cursor-pointer"
          onClick={() => navigate("/notifications")}
        >
          <FaBell className="text-lg" />
          {notificationsCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
              {notificationsCount}
            </span>
          )}
        </div>

        {/* 👤 Profile */}
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => navigate("/profile")}
        >
          <img src={profile_pic} className="w-9 h-9 rounded-full" />
          <span className="text-sm">Shane Doe</span>
        </div>

      </div>
    </div>
  );
}