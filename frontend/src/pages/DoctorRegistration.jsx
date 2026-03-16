import React, { useState } from "react";
import headerImg from "../assets/LoginImg.png";
import logoImg from "../assets/Logo04.PNG";
import { useNavigate, Link } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import axios from "axios";

export default function DoctorRegistration() {
  const navigate = useNavigate();
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");
  const [phone, setPhone] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    specialisation: ""  // ✅ matches backend spelling
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const { firstName, lastName, email, password, specialisation } = formData;

    const passwordRegex = /^(?=.*\d).{8,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!firstName) {
      setStatusMessage("First name is required");
      setStatusType("error");
      return;
    }

    if (!lastName) {
      setStatusMessage("Last name is required");
      setStatusType("error");
      return;
    }

    if (!phone) {
      setStatusMessage("Phone number is required");
      setStatusType("error");
      return;
    }

    if (!email) {
      setStatusMessage("Email is required");
      setStatusType("error");
      return;
    }

    if (!emailRegex.test(email)) {
      setStatusMessage("Enter a valid email address");
      setStatusType("error");
      return;
    }

    if (!password) {
      setStatusMessage("Password is required");
      setStatusType("error");
      return;
    }

    if (!passwordRegex.test(password)) {
      setStatusMessage("Password must be at least 8 characters and include a number");
      setStatusType("error");
      return;
    }

    if (!specialisation) {
      setStatusMessage("Please select a specialisation");
      setStatusType("error");
      return;
    }

    try {
      // ✅ Fixed: correct API URL with env variable
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/doctor/register`, {
        firstName,
        lastName,
        phone,
        email,
        password,
        specialisation
      });

      setStatusMessage("Registration successful! Your account is pending approval.");
      setStatusType("success");

      setTimeout(() => navigate("/login"), 2000);

    } catch (err) {
      setStatusMessage(err.response?.data?.message || "Registration failed");
      setStatusType("error");
    }
  };

  return (
    <div className="flex h-screen bg-[#F6FAFF]">
      <div className="hidden md:flex w-1/2 relative bg-blue-50">
        <div className="absolute top-10 left-20 flex items-center">
          <img src={logoImg} className="h-16" />
        </div>
        <img src={headerImg} className="absolute bottom-0 left-0 w-full h-auto" />
      </div>

      <div className="w-full md:w-1/2 flex flex-col justify-center items-center bg-white px-10">
        <h2 className="text-4xl font-bold mb-2">Doctor Registration</h2>
        <p className="mb-6 text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">Log in</Link>
        </p>

        <form onSubmit={handleRegister} className="w-full max-w-md space-y-3">

          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block mb-1 text-gray-700">First Name</label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              placeholder="First Name"
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="block mb-1 text-gray-700">Last Name</label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              placeholder="Last Name"
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block mb-1 text-gray-700">Phone Number</label>
            <PhoneInput
              country={"lk"}
              value={phone}
              onChange={(value) => setPhone(value)}
              containerClass="w-full"
              inputClass="w-full"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block mb-1 text-gray-700">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email Address"
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block mb-1 text-gray-700">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="********"
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Specialisation */}
          <div>
            <label htmlFor="specialisation" className="block mb-1 text-gray-700">Specialisation</label>
            <select
              id="specialisation"
              name="specialisation"
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select Specialisation</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Dermatology">Dermatology</option>
              <option value="Neurology">Neurology</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="General Practice">General Practice</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Psychiatry">Psychiatry</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 mt-4"
          >
            Sign Up
          </button>

          <div className="flex items-center mt-2 text-sm">
            <input type="checkbox" id="remember" className="mr-2" />
            <label htmlFor="remember" className="text-gray-600">Remember me</label>
          </div>

        </form>

        {statusMessage && (
          <div className={`mt-4 p-3 rounded-lg text-sm w-full max-w-md text-center ${
            statusType === "error"
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}>
            {statusMessage}
          </div>
        )}
      </div>
    </div>
  );
}