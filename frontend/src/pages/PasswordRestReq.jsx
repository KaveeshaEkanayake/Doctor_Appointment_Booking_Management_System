import React, { useState } from "react";
import logoImg from "../assets/Logo04.PNG";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

export default function PasswordResetReq() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to send reset link");
      }

      setSuccess(true);
      navigate("/forgot-password/sent");

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
            {success ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-500 text-3xl">✓</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Check Your Email
                </h2>
                <p className="text-gray-600 text-sm mb-6">
                  We've sent a password reset link to{" "}
                  <span className="font-medium text-blue-600">{email}</span>.
                  Please check your inbox.
                </p>
                <a href="/login" className="text-blue-600 text-sm hover:underline">
                  Back to login
                </a>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">
                  Forgot Your Password?
                </h2>
                <p className="text-gray-600 text-sm mb-6 text-center">
                  Enter your registered email address. We will send you a
                  password reset link.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {error && (
                    <p className="text-red-500 text-xs text-center">{error}</p>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white text-sm font-semibold py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {loading ? "Sending..." : "Send reset link"}
                  </button>
                </form>
                <div className="text-center mt-4">
                  <a href="/login" className="text-blue-600 text-sm hover:underline">
                    Back to login
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}