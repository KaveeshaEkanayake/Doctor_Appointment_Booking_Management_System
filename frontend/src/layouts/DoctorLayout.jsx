import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { RiDashboardLine } from "react-icons/ri";
import { FiCalendar, FiClock, FiUser, FiLogOut, FiMenu, FiX } from "react-icons/fi";
import logoImg from "../assets/Logo04.PNG";

export default function DoctorLayout({ children }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const navItems = [
    { to: "/doctor/dashboard", icon: RiDashboardLine, label: "Dashboard" },
    { to: "/doctor/appointments", icon: FiCalendar, label: "My Appointments" },
    { to: "/doctor/availability", icon: FiClock, label: "My Availability" },
    { to: "/doctor/profile", icon: FiUser, label: "Profile" },
  ];

  return (
    <div className="flex h-screen bg-[#F6FAFF]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-56 bg-white border-r border-gray-200 flex flex-col justify-between transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo + close button */}
        <div>
          <div className="px-6 py-6 flex items-center justify-between">
            <img src={logoImg} alt="MediCare Logo" className="h-10" />
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <FiX className="text-xl" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="mt-4 flex flex-col gap-1 px-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`
                }
              >
                <item.icon className="text-lg" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Logout */}
        <div className="px-3 pb-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 w-full transition"
          >
            <FiLogOut className="text-lg" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-800"
          >
            <FiMenu className="text-2xl" />
          </button>
          <img src={logoImg} alt="MediCare Logo" className="h-8" />
          <div className="w-8" />
        </div>
        {children}
      </main>
    </div>
  );
}