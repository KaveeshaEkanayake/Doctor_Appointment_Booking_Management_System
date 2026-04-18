import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import logoImg from "../assets/Logo04.PNG";

const API = import.meta.env.VITE_API_URL;

export default function PasswordResetPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [strength, setStrength] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (value.length > 10) setStrength(2);
    else if (value.length > 5) setStrength(1);
    else setStrength(0);
  };

  const strengthLabel =
    strength === 2 ? "Strong" : strength === 1 ? "Medium" : "Weak";
  const strengthColor =
    strength === 2 ? "bg-green-500" : strength === 1 ? "bg-yellow-500" : "bg-red-500";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!token) {
      setError("Invalid or missing reset token");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to reset password");
      }

      navigate("/forgot-password/resetsuccess");

    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-blue-100 p-20 rounded-lg shadow-md w-[700px] justify-center">
        <div className="text-center mb-5 w-full">
          <img src={logoImg} alt="MediCare Logo" className="mx-auto h-10 w-22" />
        </div>
        <div className="bg-white rounded-lg shadow-md w-full p-8 flex items-center justify-center">
          <div className="bg-white rounded-lg w-[300px] p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
              Reset your password
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="password"
                placeholder="New password"
                value={password}
                onChange={handlePasswordChange}
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

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
                    />
                  ))}
                </div>
                <span className={`text-sm font-semibold ${
                  strength === 2 ? "text-green-600"
                  : strength === 1 ? "text-yellow-600"
                  : "text-red-600"
                }`}>
                  {strengthLabel}
                </span>
              </div>

              {error && (
                <p className="text-red-500 text-xs text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white text-sm font-semibold py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? "Resetting..." : "Reset password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}