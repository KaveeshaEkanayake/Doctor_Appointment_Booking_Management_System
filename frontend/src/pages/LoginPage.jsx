import React, { useState } from "react";
import axios from "axios";
import headerImg from "../assets/LoginImg.png";
import logoImg    from "../assets/Logo04.PNG";
import { useNavigate } from "react-router-dom";
import { Link }        from "react-router-dom";

export default function LoginPage() {
  const [email,         setEmail]         = useState("");
  const [password,      setPassword]      = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType,    setStatusType]    = useState("");
  const [role,          setRole]          = useState("patient");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const endpoint = role === "patient"
      ? `${import.meta.env.VITE_API_URL}/api/auth/login`
      : `${import.meta.env.VITE_API_URL}/api/auth/doctor/login`;

    try {
      const res = await axios.post(endpoint, { email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", role);

      // ← Store user info for Header and other components
      if (role === "patient" && res.data.patient) {
        localStorage.setItem("user", JSON.stringify(res.data.patient));
      } else if (role === "doctor" && res.data.doctor) {
        localStorage.setItem("user", JSON.stringify(res.data.doctor));
      }

      if (role === "patient") {
        navigate("/doctors");
      } else {
        navigate("/doctor/dashboard");
      }

    } catch (err) {
      if (err.response?.status === 403) {
        setStatusMessage(err.response.data.message);
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
        <p className="mb-4 text-[#878787]">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">Sign up</Link>
        </p>

        {/* Role selector */}
        <div className="flex mb-6 border rounded-lg overflow-hidden w-full max-w-md">
          <button
            type="button"
            onClick={() => setRole("patient")}
            className={`flex-1 py-2 text-sm font-medium transition ${
              role === "patient" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Patient
          </button>
          <button
            type="button"
            onClick={() => setRole("doctor")}
            className={`flex-1 py-2 text-sm font-medium transition ${
              role === "doctor" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Doctor
          </button>
        </div>

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

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
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