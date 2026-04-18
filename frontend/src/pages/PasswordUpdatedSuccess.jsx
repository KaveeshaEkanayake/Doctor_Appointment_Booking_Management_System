import React from "react";
import logoImg from "../assets/Logo04.PNG";

export default function PasswordUpdatedSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      {/* Outer light blue container */}
      <div className="bg-blue-100 p-20 rounded-lg shadow-md  w-[700px]  justify-center">
        {/* Logo + Title */}
          <div className="text-center mb-5 w-full">
              <img
                src={logoImg} 
                alt="MediCare Logo"
                className="mx-auto h-10 w-22"
              />
          </div>

        {/* Inner white card */}
        <div className="bg-white rounded-lg shadow-md w-full p-8 flex items-center justify-center">
          
            <div className="bg-white rounded-lg w-[400px] p-8">
                
                <div className="flex items-center justify-center mb-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500">
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                        >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="ml-3 text-lg font-semibold text-gray-800">
                        Password updated successfully
                    </h2>
                </div>


                {/* Description */}
                <p className="text-gray-600 text-sm mb-6 flex items-center justify-center text-center">
                    Your password has been reset. <br />
                    Please login with your new password.
                </p>

                {/* Button */}
                <button
                    onClick={() => (window.location.href = "/login")}
                    className="w-full bg-blue-600 text-white text-sm font-semibold py-2 mt-8 rounded-md hover:bg-blue-700 transition"
                >
                    Go to login
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
