import React, { useState } from "react";
import logoImg from "../assets/Logo04.PNG";

export default function PatientDeleteAccountPage() {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDeleteClick = () => setShowConfirm(true);
  const handleCancel = () => setShowConfirm(false);
  const handleConfirmDelete = () => {
    // TODO: call backend API to delete account
    console.log("Account deletion confirmed");
    setShowConfirm(false);
  };

  return (
    <div className="min-h-screen items-center justify-center">
      {/* Logo */}
      <div className="text-center mb-6 p-8">
        <img src={logoImg} alt="MediCare Logo" className="mx-auto h-12 w-22" />
      </div>

      {/* Heading */}
      <h2 className="text-3xl font-bold text-gray-800 mb-5 text-center">
        Delete Account
      </h2>
      <p className="text-gray-600 text-sm mb-16 text-center">
        Request to permanently delete your account
      </p>

      {/* Warning section */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-8 mb-6 w-[900px] bg-blue-100 rounded-lg shadow-md p-8">

          {/* Icon instead of image */}
          <div className="w-1/3 flex justify-center">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
          </div>

          {/* Text content */}
          <div className="w-2/3 text-gray-700 text-sm space-y-2">
            <p className="font-bold text-red-700 text-lg mb-5">
              Are you sure you want to delete your account?
            </p>
            <ul className="list-disc list-inside text-gray-500 font-semibold">
              <li>All your data will be permanently erased.</li>
              <li>You will be logged out and unable to log in again.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Delete button */}
      <div className="text-center">
        <button
          onClick={handleDeleteClick}
          className="w-[300px] h-[50px] mx-auto bg-red-600 text-white text-sm font-semibold py-2 rounded-md hover:bg-red-700 transition mt-10"
        >
          Request Account Deletion
        </button>
        <p className="text-md text-gray-500 mt-8">
          Once deleted, you will be logged out and cannot regain access.
        </p>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-[400px]">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              Confirm Account Deletion
            </h3>
            <p className="text-sm text-gray-700 mb-4 text-center">
              Are you sure you want to permanently delete your account?
            </p>
            <div className="flex items-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 mr-2 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.721-1.36 3.486 0l6.518 11.614c.75 1.338-.213 3.037-1.743 3.037H3.482c-1.53 0-2.493-1.699-1.743-3.037L8.257 3.1zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-2a.75.75 0 01-.75-.75V7a.75.75 0 011.5 0v3.25A.75.75 0 0110 11z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-red-600 font-semibold">This action is irreversible.</p>
                <p className="text-black">All your data will be deleted.</p>
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}