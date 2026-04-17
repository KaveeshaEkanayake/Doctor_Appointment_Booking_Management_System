import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import logoImg from "../assets/Logo04.PNG";
import { FiMenu, FiX } from "react-icons/fi";
import { FaUser, FaEdit, FaSignOutAlt } from "react-icons/fa";

export default function Navbar() {
  const navigate               = useNavigate();
  const [open, setOpen]        = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const dropdownRef            = useRef(null);

  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role");
  const user  = (() => {
    try { return JSON.parse(localStorage.getItem("user")) || {}; }
    catch { return {}; }
  })();

  const isPatient = token && role === "patient";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { label: "Home",       to: "/"        },
    { label: "Doctors",    to: "/doctors" },
    { label: "About",      to: "/about"   },
    { label: "Contact Us", to: "/contact" },
  ];

  const displayName = user.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : "Patient";

  const initial = user.firstName?.[0]?.toUpperCase() ?? "P";

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link to="/">
          <img src={logoImg} alt="MediCare" className="h-10 w-auto" />
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium transition ${
                  isActive ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          {isPatient && (
            <NavLink
              to="/patient/dashboard"
              className={({ isActive }) =>
                `text-sm font-medium transition ${
                  isActive ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
                }`
              }
            >
              Dashboard
            </NavLink>
          )}
        </div>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-3">
          {isPatient ? (

            /* ── Avatar button + dropdown ── */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdown(!dropdown)}
                className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm hover:bg-blue-700 transition shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              >
                {initial}
              </button>

              {/* Dropdown */}
              {dropdown && (
                <div className="absolute right-0 top-13 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">

                  {/* Profile header */}
                  <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-white border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm flex-shrink-0">
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{displayName}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-2">
                    <button
                      onClick={() => { navigate("/patient/profile"); setDropdown(false); }}
                      className="w-full flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition">
                        <FaUser className="text-xs text-gray-500 group-hover:text-blue-600" />
                      </div>
                      <span>My Profile</span>
                    </button>

                    <button
                      onClick={() => { navigate("/patient/profile"); setDropdown(false); }}
                      className="w-full flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition">
                        <FaEdit className="text-xs text-gray-500 group-hover:text-blue-600" />
                      </div>
                      <span>Edit Profile</span>
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-100 py-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-500 hover:bg-red-50 transition group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition">
                        <FaSignOutAlt className="text-xs text-red-400" />
                      </div>
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          ) : (
            <>
              <Link
                to="/register"
                className="flex items-center gap-2 border border-blue-600 text-blue-600 text-sm font-medium px-4 py-2 rounded-full hover:bg-blue-50 transition"
              >
                ✦ Register
              </Link>
              <Link
                to="/login"
                className="flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-blue-700 transition"
              >
                ⊙ Log in
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-gray-600">
          {open ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? "text-blue-600" : "text-gray-600"}`
              }
            >
              {link.label}
            </NavLink>
          ))}

          {isPatient && (
            <>
            
              <button
                onClick={() => { navigate("/patient/profile"); setOpen(false); }}
                className="text-sm font-medium text-gray-600 text-left"
              >
                My Profile
              </button>
              <button
                onClick={() => { navigate("/patient/profile"); setOpen(false); }}
                className="text-sm font-medium text-gray-600 text-left"
              >
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-red-500 text-left"
              >
                Log out
              </button>
            </>
          )}

          {!isPatient && (
            <div className="flex gap-3">
              <Link
                to="/register"
                onClick={() => setOpen(false)}
                className="flex-1 text-center border border-blue-600 text-blue-600 text-sm font-medium px-4 py-2 rounded-full"
              >
                Register
              </Link>
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="flex-1 text-center bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-full"
              >
                Log in
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}