import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { RiDashboardLine }      from "react-icons/ri";
import { FiUsers, FiLogOut, FiMenu, FiX, FiCalendar, FiBarChart2, FiSettings } from "react-icons/fi";
import logoImg from "../assets/Logo04.PNG";

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/admin/login");
  };

  const activeNavItems = [
    { to: "/admin/dashboard", icon: RiDashboardLine, label: "Dashboard" },
    { to: "/admin/doctors",   icon: FiUsers,         label: "Doctors"   },
  ];

  const comingSoonItems = [
    { icon: FiCalendar,  label: "Appointments" },
    { icon: FiBarChart2, label: "Reports"       },
    { icon: FiSettings,  label: "Settings"      },
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
        <div>
          {/* Logo + close */}
          <div className="px-6 py-6 flex items-center justify-between">
            <img src={logoImg} alt="MediCare Logo" className="h-10" />
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <FiX className="text-xl" />
            </button>
          </div>

          {/* Active nav */}
          <nav className="mt-2 flex flex-col gap-1 px-3">
            {activeNavItems.map((item) => (
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

            {/* Divider */}
            <div className="my-2 border-t border-gray-100" />

            {/* Coming soon */}
            {comingSoonItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 cursor-not-allowed select-none"
              >
                <item.icon className="text-lg" />
                <span>{item.label}</span>
                <span className="ml-auto text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded font-medium">
                  Soon
                </span>
              </div>
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

      {/* Main content */}
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