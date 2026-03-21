import React, { useState } from "react";
import { Link } from "react-router-dom";
import logoImg from "../assets/Logo04.PNG";

export default function Footer() {
  const [email,         setEmail]         = useState("");
  const [newsletterMsg, setNewsletterMsg] = useState("");

  const handleNewsletterSubmit = () => {
    if (!email || !email.includes("@")) {
      setNewsletterMsg("Please enter a valid email.");
      return;
    }
    setNewsletterMsg("Thanks! We'll be in touch soon.");
    setEmail("");
    setTimeout(() => setNewsletterMsg(""), 3000);
  };

  return (
    <footer className="bg-white border-t border-gray-100 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div>
            <img src={logoImg} alt="MediCare" className="h-10 mb-3" />
            <p className="text-sm text-gray-500 leading-relaxed">
              Effortlessly schedule your medical appointments with MediCare.
              Connect with healthcare professionals, manage appointments &
              prioritize your well being.
            </p>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-gray-500 hover:text-blue-600 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-gray-500 hover:text-blue-600 transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-gray-500 hover:text-blue-600 transition">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Specialities */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-4">Specialities</h3>
            <ul className="space-y-2">
              {["Neurology", "Cardiologist", "Dentist"].map((s) => (
                <li key={s}>
                  <Link
                    to="/doctors"
                    className="text-sm text-gray-500 hover:text-blue-600 transition"
                  >
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + Newsletter */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-4">Contact Us</h3>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center gap-2 text-sm text-gray-500">
                📍 Kings Street, Colombo
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-500">
                📞 +11 2345789
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-500">
                ✉️ medicare@example.com
              </li>
            </ul>

            {/* Newsletter */}
            <div className="flex gap-2 mt-4">
              <input
                type="email"
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={handleNewsletterSubmit}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
              >
                Submit
              </button>
            </div>
            {newsletterMsg && (
              <p className="text-xs text-green-600 mt-2">{newsletterMsg}</p>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400">
            Copyright © 2024 MediCare. All Rights Reserved
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400 cursor-default">
              Privacy Policy
            </span>
            <span className="text-xs text-gray-400 cursor-default">
              Terms & Conditions
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}