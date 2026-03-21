import React from "react";
import logoImg from "../assets/Logo04.PNG";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { NavLink } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#F6FAFF] mt-auto">

      {/* MAIN FOOTER CONTENT */}
      <div className="px-10 py-8">
        <div className="grid md:grid-cols-[2fr_1fr_1fr_1fr_1.5fr] gap-10">

          {/* Branding */}
          <div>
            <img src={logoImg} alt="MediCare Logo" className="h-10 mb-2" />
            <p className="text-sm text-[#012047]">
              Effortlessly schedule your medical <br />
              appointments with MediCare. Connect <br />
              with healthcare professionals, manage<br />
              appointments & prioritize your well being.
            </p>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold mb-4 text-[#012047]">Company</h4>
            <ul className="space-y-4 text-sm text-[#012047]">
              <li>
                <NavLink to="/"
                  className={({ isActive }) =>
                    isActive ? "text-[#0E82FD]" : "hover:text-[#0E82FD]"
                  }>
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/about"
                  className={({ isActive }) =>
                    isActive ? "text-[#0E82FD]" : "hover:text-[#0E82FD]"
                  }>
                  About Us
                </NavLink>
              </li>
              <li>
                <NavLink to="/contact"
                  className={({ isActive }) =>
                    isActive ? "text-[#0E82FD]" : "hover:text-[#0E82FD]"
                  }>
                  Contact Us
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Specialities */}
          <div>
            <h4 className="font-bold mb-4 text-[#012047]">Specialities</h4>
            <ul className="space-y-4 text-sm text-[#012047]">
              <li>Neurology</li>
              <li>Cardiologist</li>
              <li>Dentist</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4 text-[#012047]">Contact</h4>
            <ul className="space-y-4 text-sm text-[#012047]">
              <li className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-black" />
                Kings Street, Colombo
              </li>
              <li className="flex items-center gap-2">
                <FaPhoneAlt className="text-black" />
                +11 23456789
              </li>
              <li className="flex items-center gap-2">
                <FaEnvelope className="text-black" />
                medicare@example.com
              </li>
            </ul>
          </div>

          {/* Email Subscribe */}
          <div>
            <div className="flex mt-2">
              <input
                type="email"
                placeholder="Enter Email"
                className="px-3 py-2 w-full border border-r-0 rounded-l-md text-black focus:outline-none"
              />
              <button className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700">
                Submit
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="bg-[#E2EDFF] py-4 w-full px-10 flex justify-between items-center text-xs text-[#012047]">
        <div>
          Copyright © 2024 MediCare. All Rights Reserved
        </div>
        <div className="flex gap-6">
          <span className="cursor-default hover:underline">Privacy Policy</span>
          <span className="cursor-default hover:underline">Terms & Conditions</span>
        </div>
      </div>

    </footer>
  );
}