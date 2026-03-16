import React, { useState } from "react";
import axios from "axios";
import headerImg from "../assets/LoginImg.png";
import logoImg from "../assets/Logo04.PNG";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Try patient login first
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", "patient");
      navigate("/patient/dashboard");
      return;
    } catch (patientErr) {
      // If patient login fails try doctor login
      if (patientErr.response?.status !== 401) {
        setStatusMessage("Invalid credentials");
        setStatusType("error");
        return;
      }
    }

    // Try doctor login
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/doctor/login`, {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", "doctor");
      navigate("/doctor/dashboard");
    } catch (doctorErr) {
      if (doctorErr.response?.status === 403) {
        setStatusMessage(doctorErr.response.data.message);
        setStatusType("error");
      } else {
        setStatusMessage("Invalid credentials");
        setStatusType("error");
      }
    }
  };

  return (
    <div className="flex h-screen bg-[#F6FAFF]">
      <div className="hidden md:flex w-2/4 mt-[160px]">
        <div className="flex h-full bg-blue-50">
          <div className="absolute top-14 left-60 flex items-center space-x-2">
            <img src={logoImg} alt="MediCare Logo" className="h-16" />
          </div>
        </div>
        <div className="absolute top-100 left-0 hidden md:flex w-[900px] h-[580px]">
          <img src={headerImg} alt="Doctors" className="w-[1600px] h-auto" />
        </div>
      </div>

      <div className="w-1/2 flex flex-col justify-center items-center bg-white px-10">
        <h2 className="mt-6 text-4xl font-bold mb-2 text-black-700">Welcome back</h2>
        <p className="mb-6 text-[#878787]">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>

        <form onSubmit={handleLogin} className="w-full max-w-md space-y-4 bg-white p-6 rounded-lg">
          <div>
            <label htmlFor="email" className="block mb-2 text-gray-700">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-4 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-2 text-gray-700">Your Password</label>
            <input
              id="password"
              type="password"
              placeholder="* * * * * * * * * * * "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mb-4 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
            Log in
          </button>

          <div className="flex justify-between items-center text-sm">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" /> Remember me
            </label>
            <a href="/forgot" className="text-blue-600 hover:underline">Forgot password?</a>
          </div>
        </form>

        {statusMessage && (
          <div className={`mt-6 p-3 border rounded-lg text-sm w-full max-w-md text-center ${
            statusType === "error"
              ? "bg-yellow-100 border-yellow-300 text-yellow-800"
              : "bg-green-100 border-green-300 text-green-800"
          }`}>
            {statusMessage}
          </div>
        )}
      </div>
    </div>
  );
}