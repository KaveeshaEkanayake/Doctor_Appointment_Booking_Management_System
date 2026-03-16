import React, { useState } from "react";
import axios from "axios";
import headerImg from "../assets/LoginImg.png";
import logoImg from "../assets/Logo04.PNG";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Link } from "react-router-dom";

export default function RegisterPage() {
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Frontend validation
    const passwordRegex = /^(?=.*\d).{8,}$/;

    if (!formData.email) {
      setStatusMessage("Email is required");
      setStatusType("error");
      return;
    }

    if (!passwordRegex.test(formData.password)) {
      setStatusMessage("Password must be at least 8 characters and include a number");
      setStatusType("error");
      return;
    }

    try {
      // ✅ Fixed: backticks + phone included
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        ...formData,
        phone: phone
      });

      setStatusMessage("Registration successful! Redirecting to login...");
      setStatusType("success");

      // ✅ Fixed: redirect to /login not /register
      setTimeout(() => navigate("/login"), 2000);

    } catch (err) {
      setStatusMessage(err.response?.data?.message || "Registration failed");
      setStatusType("error");
    }
  };

  return (
    <div className="flex h-screen bg-[#F6FAFF]">
      {/* Left side with image and logo */}
      <div className="hidden md:flex w-2/4 mt-[160px]">
        <div className="flex h-full bg-blue-50">
          <div className="absolute top-14 left-60 flex items-center space-x-2">
            <img src={logoImg} alt="MediCare Logo" className="h-16" />
          </div>
        </div>

        <div className="absolute top-100 left-0 hidden md:flex w-[900px] h-[580px]">
          <img
            src={headerImg}
            alt="Doctors"
            className="w-[1600px] h-auto"
          />
        </div>
      </div>

      {/* Right side register form */}
      <div className="w-1/2 flex flex-col justify-center items-center bg-white px-10">

        <h2 className="mt-6 text-4xl font-bold mb-1 text-black-700">Hey There</h2>
        <p className="mb-6 text-[#878787]">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
        <p className="mb-6 text-[#878787]">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Log in
            </Link>
            {" "}|{" "}
            <Link to="/doctor/register" className="text-blue-600 hover:underline">
              Register as Doctor
            </Link>
          </p>
```
        <form
          onSubmit={handleRegister}
          className="w-full max-w-md space-y-3 bg-white p-6 rounded-lg"
        >
                      {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block mb-2 text-gray-700">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block mb-2 text-gray-700">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

          {/* Phone Number */}
          <div>
            <label className="block mb-2 text-gray-700">Phone Number</label>
            <PhoneInput
              country={"lk"}
              value={phone}
              onChange={(value) => setPhone(value)}
              containerClass="w-full border rounded-md focus-within:ring-2 focus-within:ring-blue-400 flex"
              inputClass="flex-1 px-3 py-2 border-l rounded-r-md focus:outline-none"
              buttonClass="border-r rounded-l-md"
            />
          </div>

                    {/* Email */}
          <div>
            <label htmlFor="email" className="block mb-2 text-gray-700">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Email Address"
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block mb-2 text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="* * * * * * * * * * * "
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Sign Up Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Sign Up
          </button>

          {/* Remember me */}
          <div className="flex justify-between items-center text-sm">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" /> Remember me
            </label>
          </div>

        </form>

        {/* Status message */}
        {statusMessage && (
          <div className={`mt-4 p-3 border rounded-lg text-sm w-full max-w-md text-center ${
            statusType === "success"
              ? "bg-green-100 border-green-300 text-green-800"
              : "bg-yellow-100 border-yellow-300 text-yellow-800"
          }`}>
            {statusMessage}
          </div>
        )}

      </div>
    </div>
  );
}
