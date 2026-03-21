import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import logoImg from "../assets/Logo04.PNG";
import { FiMenu, FiX } from "react-icons/fi";

export default function Navbar() {
  const navigate   = useNavigate();
  const [open, setOpen] = useState(false);

  const role  = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  const isPatient = token && role === "patient";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const navLinks = [
    { label: "Home",       to: "/"         },
    { label: "Doctors",    to: "/doctors"  },
    { label: "About",      to: "/about"    },
    { label: "Contact Us", to: "/contact"  },
  ];

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

          {/* Patient logged in — show dashboard + appointments */}
          {isPatient && (
            <>
            
              <NavLink
                to="/my-appointments"
                className={({ isActive }) =>
                  `text-sm font-medium transition ${
                    isActive ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
                  }`
                }
              >
                My Appointments
              </NavLink>
            </>
          )}
        </div>

        {/* Desktop right buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isPatient ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 border border-gray-300 text-gray-600 text-sm font-medium px-4 py-2 rounded-full hover:bg-gray-50 transition"
            >
              Log out
            </button>
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
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-gray-600"
        >
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
              <NavLink to="/patient/dashboard" onClick={() => setOpen(false)} className="text-sm font-medium text-gray-600">
                Dashboard
              </NavLink>
              <NavLink to="/my-appointments" onClick={() => setOpen(false)} className="text-sm font-medium text-gray-600">
                My Appointments
              </NavLink>
              <button onClick={handleLogout} className="text-sm font-medium text-red-500 text-left">
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