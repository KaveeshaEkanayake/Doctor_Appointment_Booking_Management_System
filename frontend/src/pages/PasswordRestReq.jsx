import React, { useState } from "react";
import logoImg from "../assets/Logo04.PNG";

export default function PasswordResetReq() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: call backend API (Express + MongoDB) to send reset link
    console.log("Reset link sent to:", email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      {/* Outer light blue container */}
      <div className="bg-blue-100 p-20 rounded-lg shadow-md  w-[700px]  justify-center">

        {/* Logo + Title */}
        <div className="text-center mb-5 w-full">
            <img
              src={logoImg} // replace with your MediCare logo
              alt="MediCare Logo"
              className="mx-auto h-10 w-22"
            />
          </div>
        
        {/* Inner white card */}
        <div className="bg-white rounded-lg shadow-md w-full p-8 flex items-center justify-center">       

            <div className="bg-white rounded-lg w-[300px] p-8">
                {/* Heading + Description */}
                <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">
                    Forgot Your Password?
                </h2>
                <p className="text-gray-600 text-sm mb-6 text-center">
                    Enter your registered email address. We will send you a password reset link.
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    />
                    <button
                    type="submit"
                    className="w-full bg-blue-600 text-white text-sm font-semibold py-2 rounded-md hover:bg-blue-700 transition"
                    >
                    Send reset link
                    </button>
                </form>

                {/* Back to login */}
                <div className="text-center mt-4">
                    <a href="/login" className="text-blue-600 text-sm hover:underline">
                    Back to login
                    </a>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}
