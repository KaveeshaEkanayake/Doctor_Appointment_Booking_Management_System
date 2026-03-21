import { useEffect, useState } from "react";
import axios from "axios";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const API = import.meta.env.VITE_API_URL;

export default function PatentProfileDisplay({ onEdit }) {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get(`${API}/api/patient/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setPatient(res.data.patient))
      .catch(() => setError("Failed to load profile."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-24 text-gray-400 gap-2">
      <AiOutlineLoading3Quarters className="animate-spin text-xl" />
      <span>Loading...</span>
    </div>
  );

  if (error) return (
    <div className="p-4 text-red-500">{error}</div>
  );

  const fullName = `${patient.firstName} ${patient.lastName}`;

  return (
    <main className="flex-1 p-8">
      <h2 className="text-2xl font-semibold mb-6">
        Hi, {patient.firstName}!
      </h2>

      {/* My Profile */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg md:text-xl font-bold">My Profile</h3>
          <button onClick={onEdit} className="text-blue-600 hover:underline text-sm">
            ✎ Edit
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-500 border">
            {patient.firstName?.[0]}
          </div>
          <div>
            <p className="text-lg font-semibold">{fullName}</p>
            <p className="text-gray-600">{patient.email}</p>
            {patient.address && (
              <p className="text-gray-600">{patient.address}</p>
            )}
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white shadow-md rounded-lg p-10">
        <div className="flex justify-between items-center mb-6 md:mb-10">
          <h3 className="text-lg md:text-xl font-bold">Personal Information</h3>
          <button onClick={onEdit} className="text-blue-600 hover:underline text-sm">
            ✎ Edit
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          <div>
            <p className="text-gray-500 text-sm">Name</p>
            <p className="text-gray-800 font-medium mt-1">{fullName}</p>
            <hr className="mt-2" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Email Address</p>
            <p className="text-gray-800 font-medium mt-1">{patient.email}</p>
            <hr className="mt-2" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Phone Number</p>
            <p className="text-gray-800 font-medium mt-1">{patient.phone || "—"}</p>
            <hr className="mt-2" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Date of Birth</p>
            <p className="text-gray-800 font-medium mt-1">
              {patient.dateOfBirth
                ? new Date(patient.dateOfBirth).toLocaleDateString()
                : "—"}
            </p>
            <hr className="mt-2" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Address</p>
            <p className="text-gray-800 font-medium mt-1">{patient.address || "—"}</p>
            <hr className="mt-2" />
          </div>
        </div>
      </div>
    </main>
  );
}