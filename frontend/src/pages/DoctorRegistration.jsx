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
    fullName: "",
    email: "",
    password: "",
    specialization: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
  e.preventDefault();

  const { fullName, email, password, specialization } = formData;

  const passwordRegex = /^(?=.*\d).{8,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const nameRegex = /^[A-Za-z\s]+$/;

  if (!fullName) {
    setStatusMessage("Full name is required");
    setStatusType("error");
    return;
  }

  if (!nameRegex.test(fullName)) {
    setStatusMessage("Name should contain only letters");
    setStatusType("error");
    return;
  }

  if (!phone) {
    setStatusMessage("Phone number is required");
    setStatusType("error");
    return;
  }

  if (phone.length !== 11) {
    setStatusMessage("Phone number must contain 9 digits");
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

  if (!specialization) {
    setStatusMessage("Please select a specialization");
    setStatusType("error");
    return;
  }

 try {

    const res = await axios.post("http://localhost:5000/registerDoctor", {
      fullName,
      phone,
      email,
      password,
      specialization
    });

    setStatusMessage("Registration successful!");
    setStatusType("success");

    setTimeout(() => {
      navigate("/login");
    }, 2000);

  } 
  catch (err) {
    setStatusMessage(
      err.response?.data?.message || "Registration failed"
    );
    setStatusType("error");
  }
 };


  return (
    <div className="flex h-screen bg-[#F6FAFF]">

      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 relative bg-blue-50">

        <div className="absolute top-10 left-20 flex items-center">
          <img src={logoImg} className="h-16" />
        </div>

        <img
          src={headerImg}
          className="absolute bottom-0 left-0 w-full h-auto"
        />

      </div>

      {/* RIGHT SIDE FORM */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center bg-white px-10">

        <h2 className="text-4xl font-bold mb-2">Hey There</h2>

        <p className="mb-6 text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>

        <form
          onSubmit={handleRegister}
          className="w-full max-w-md "
        >

          {/* Full Name */}
          <div>
            <label className="block mb-1 text-gray-700">Full Name</label>
            <input
              name="fullName"
              type="text"
              placeholder="Full Name"
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 "
            />
          </div>


          {/* PHONE */}
          <div>
            <label className="block mb-1 text-gray-700 mt-4">Phone Number</label>

            <PhoneInput
              country={"lk"}
              value={phone}
              onChange={(value) => setPhone(value)}
              containerClass="w-full"
              inputClass="w-full"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="block mb-1 text-gray-700 mt-4">Email Address</label>
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block mb-1 text-gray-700 mt-4">Password</label>
            <input
              name="password"
              type="password"
              placeholder="********"
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* SPECIALIZATION */}
          <div>
            <label className="block mb-1 text-gray-700 mt-4">Specialization</label>

            <select
              name="specialization"
              placeholder="Specialization"
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select Specialization</option>
              <option>Cardiology</option>
              <option>Dermatology</option>
              <option>Neurology</option>
              <option>Pediatrics</option>
            </select>

          </div>

          {/* BUTTON */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 mt-12"
          >
            Sign Up
          </button>

          <div className="flex items-center mt-4 text-sm">
            <input
              type="checkbox"
              id="remember"
              className="mr-2"
            />
           <label htmlFor="remember" className="text-gray-600">
               Remember me
           </label>
          </div>

        </form>

        {/* STATUS MESSAGE */}
        {statusMessage && (
          <div className={`mt-4 p-3 rounded-lg text-sm w-full max-w-md text-center 
          ${statusType === "error"
            ? "bg-red-100 text-red-700"
            : "bg-green-100 text-green-700"}`}>
            {statusMessage}
          </div>
        )}

      </div>
    </div>
  );
}