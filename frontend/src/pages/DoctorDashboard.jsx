import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DoctorLayout from "../layouts/DoctorLayout";
import { FiCalendar, FiUsers, FiAlertTriangle } from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FiBell } from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL;


export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [note, setNote] = useState("");

  const [stats, setStats] = useState({
    today: 0,
    patients: 0,
    pending: 0,
  });

  const [appointments, setAppointments] = useState([]);

  // Get doctor info from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const doctorName = user.firstName
    ? `Dr. ${user.firstName} ${user.lastName}`
    : "Doctor";
  const profilePhoto = user.profilePhoto || null;

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch dashboard data from backend
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/doctor/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load dashboard");
        }

        setStats(data.data.stats);
        setAppointments(data.data.schedule);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data. Please refresh.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const statusStyle = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs";
      case "Pending":
        return "bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs";
      case "Completed":
        return "bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs";
      case "Cancelled":
        return "bg-red-100 text-red-500 px-2 py-1 rounded-full text-xs";
      default:
        return "bg-gray-100 text-gray-500 px-2 py-1 rounded-full text-xs";
    }
  };

  return (
    <DoctorLayout>
      <div className="p-4 sm:p-6 md:p-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              Welcome back, {doctorName}
            </h1>
            <p className="text-gray-500 text-sm">{formatDate(currentDate)}</p>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4">
            {/* Notification */}
            <button className="relative p-2 rounded-full hover:bg-gray-100 transition">
              <FiBell className="text-xl text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile */}
            <div
              onClick={() => navigate("/doctor/profile")}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-lg transition"
            >
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="profile"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border"
                />
              ) : (
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-100 flex items-center justify-center border">
                  <span className="text-blue-600 text-sm font-bold">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </span>
                </div>
              )}
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {doctorName}
              </span>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div
            onClick={() => navigate("/doctor/appointments")}
            className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border flex items-center gap-4 cursor-pointer hover:shadow-md hover:scale-[1.01] transition"
          >
            <div className="bg-blue-100 p-3 rounded-lg">
              <FiCalendar className="text-blue-500 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Today's Appointments</p>
              {loading ? (
                <AiOutlineLoading3Quarters className="animate-spin mt-1" />
              ) : (
                <h2 className="text-xl sm:text-2xl font-bold">{stats.today}</h2>
              )}
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <FiUsers className="text-purple-500 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Patients Served</p>
              {loading ? (
                <AiOutlineLoading3Quarters className="animate-spin mt-1" />
              ) : (
                <h2 className="text-xl sm:text-2xl font-bold">{stats.patients}</h2>
              )}
            </div>
          </div>

          <div
            onClick={() => navigate("/doctor/appointments")}
            className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border flex items-center gap-4 cursor-pointer hover:shadow-md hover:scale-[1.01] transition"
          >
            <div className="bg-yellow-100 p-3 rounded-lg">
              <FiAlertTriangle className="text-yellow-500 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Requests</p>
              {loading ? (
                <AiOutlineLoading3Quarters className="animate-spin mt-1" />
              ) : (
                <h2 className="text-xl sm:text-2xl font-bold">{stats.pending}</h2>
              )}
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800">
              Today's Schedule
            </h2>
            <button
              onClick={() => navigate("/doctor/appointments")}
              className="text-blue-500 text-sm hover:underline"
            >
              View All
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <AiOutlineLoading3Quarters className="animate-spin text-2xl text-blue-500" />
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FiCalendar className="text-4xl mx-auto mb-2" />
              <p>No appointments scheduled for today</p>
            </div>
          ) : (
            <>
              {/* Mobile */}
              <div className="sm:hidden space-y-4">
                {appointments.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.time}</p>
                    <p className="text-sm">{item.reason}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className={statusStyle(item.status)}>
                        {item.status}
                      </span>
                      {item.notes ? (
                        <button className="text-blue-500 text-xs">View Notes</button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedPatient(item);
                            setShowModal(true);
                          }}
                          className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs"
                        >
                          + Add Notes
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead className="text-gray-400 border-b text-xs uppercase">
                    <tr>
                      <th className="py-3 text-left">Patient</th>
                      <th className="text-left">Time</th>
                      <th className="text-left">Reason</th>
                      <th className="text-left">Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {appointments.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-4 font-medium">{item.name}</td>
                        <td>{item.time}</td>
                        <td>{item.reason}</td>
                        <td>
                          <span className={statusStyle(item.status)}>
                            {item.status}
                          </span>
                        </td>
                        <td className="text-right">
                          {item.notes ? (
                            <button className="text-gray-500 hover:text-blue-600 hover:underline">
                              View Notes
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedPatient(item);
                                setShowModal(true);
                              }}
                              className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs"
                            >
                              + Add Notes
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-3xl rounded-xl shadow-lg p-6 relative">

            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                Add Patient Notes - {selectedPatient?.name}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Notes Input */}
              <div>
                <p className="text-sm font-medium mb-2 text-gray-600">
                  Clinical Notes
                </p>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Enter clinical observations, diagnosis, and treatment plan..."
                  className="w-full h-40 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Previous Notes */}
              <div className="flex items-center justify-center border rounded-lg text-gray-400 text-sm">
                No previous notes found
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:underline"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log("Saved note:", note);
                  setShowModal(false);
                  setNote("");
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </DoctorLayout>
  );
}