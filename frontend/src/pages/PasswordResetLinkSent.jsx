import React from "react";
import logoImg from "../assets/Logo04.PNG";

export default function PasswordResetLinkSent() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      {/* Outer light blue container */}
      <div className="bg-blue-100 p-20 rounded-lg shadow-md  w-[700px]  justify-center">
        
        {/* Logo + Title */}
        <div className="text-center mb-6">
          <img
            src={logoImg}
            alt="MediCare Logo"
            className="mx-auto h-10 w-22"
          />
        </div>

        {/* Inner white card */}
        <div className="bg-white rounded-lg shadow-md w-full p-8 flex items-center justify-center">
          
          <div className="bg-white rounded-lg w-[400px] p-8  items-center justify-center text-center">
                {/* Heading */}
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Reset your password
                </h2>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-6">
                    We have sent a password reset link to your registered email address. <br />
                    Please check your inbox.
                </p>

                {/* Success box */}
                <div className="flex items-center bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 mr-3">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    </div>
                    <div className="text-left">
                    <p className="font-semibold">Reset link sent successfully</p>
                    <p className="text-sm">Check your email to continue.</p>
                    </div>
                </div>

                {/* Back to login link */}
                <a
                    href="/login"
                    className="text-blue-600 text-sm hover:underline"
                >
                    Back to login
                </a>
          </div>
          
        </div>
      </div>
    </div>
  );
}
