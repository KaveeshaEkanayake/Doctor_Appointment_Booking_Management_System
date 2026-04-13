import React, { useState } from "react";
import logoImg from "../assets/Logo04.PNG";


export default function PasswordResetPage() {
  
  const [confirmPassword, setConfirmPassword] = useState("");
  

  const [password, setPassword] = useState("");
  const [strength, setStrength] = useState(0); // 0 = weak, 1 = medium, 2 = strong

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    // Simple strength logic (expand as needed)
    if (value.length > 10) {
      setStrength(2);
    } else if (value.length > 5) {
      setStrength(1);
    } else {
      setStrength(0);
    }
  };

  const strengthLabel =
    strength === 2 ? "Strong" : strength === 1 ? "Medium" : "Weak";
  const strengthColor =
    strength === 2 ? "bg-green-500" : strength === 1 ? "bg-yellow-500" : "bg-red-500";

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: call backend API to reset password
    console.log("Password reset requested:", password, confirmPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
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
            {/* Heading */}
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            Reset your password
          </h2>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New password */}
            <div className="relative">
              {/* <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                🔒
              </span> */}
              <input
                type="password"
                placeholder="New password"
                value={password}
                onChange={handlePasswordChange}
                className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Confirm password */}
            <div className="relative">
              {/* <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                🔒
              </span> */}
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Password strength indicator */}
            {/* <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Password Strength:</span>
              <span
                className={
                  strength === "Strong"
                    ? "text-green-600 font-semibold"
                    : strength === "Medium"
                    ? "text-yellow-600 font-semibold"
                    : "text-red-600 font-semibold"
                }
              >
                {strength}
              </span>
            </div> */}

             {/* Strength bar */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Password Strength:</span>
              <div className="flex-1 flex space-x-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded ${
                      i <= strength ? strengthColor : "bg-gray-300"
                    }`}
                  ></div>
                ))}
              </div>
              <span
                className={`text-sm font-semibold ${
                  strength === 2
                    ? "text-green-600"
                    : strength === 1
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {strengthLabel}
              </span>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white text-sm font-semibold py-2 rounded-md hover:bg-blue-700 transition"
            >
              Reset password
            </button>
          </form>
        </div>

        </div>
      </div>
    </div>
  );
}
