import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DoctorLayout from "../layouts/DoctorLayout";
import { FiCalendar, FiUsers, FiAlertTriangle } from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import imgDoctor from "../assets/imgDoctor.png";
import { FiBell } from "react-icons/fi";

export default function DoctorDashboard() {
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    today: 0,
    patients: 0,
    pending: 0,
  });

  const [appointments, setAppointments] = useState([]);

  // ✅ REAL-TIME DATE
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // ✅ MOCK DATA (replace later with API)
  useEffect(() => {
    setTimeout(() => {
      setStats({
        today: 12,
        patients: 1240,
        pending: 4,
      });

      setAppointments([
        {
          name: "Nimali Dissanayaka",
          time: "09:00 AM",
          reason: "Annual Checkup",
          status: "Confirmed",
          hasNotes: true,
        },
        {
          name: "Kalum Silva",
          time: "10:30 AM",
          reason: "Follow-up",
          status: "Pending",
          hasNotes: true,
        },
        {
          name: "Janidu Silva",
          time: "01:00 PM",
          reason: "Flu Symptoms",
          status: "Completed",
          hasNotes: false,
        },
        {
          name: "Amali Perera",
          time: "02:15 PM",
          reason: "Consultation",
          status: "Cancelled",
          hasNotes: true,
        },
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  // ✅ FORMAT DATE
  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // ✅ STATUS STYLES
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

        {/* 🔥 Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">

          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              Welcome back, Dr. Arjun
            </h1>
            <p className="text-gray-500 text-sm">
              {formatDate(currentDate)}
            </p>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4">

            {/* Notification */}
            <button className="relative p-2 rounded-full hover:bg-gray-100 transition">
              <FiBell className="text-xl text-gray-600" />

              {/* Notification Dot */}
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile */}
            <div
              onClick={() => navigate("/doctor/profile")}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-lg transition"
            >
              <img
                src={imgDoctor}
                onError={(e) => (e.target.src = defaultProfile)}
                alt="profile"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border"
              />
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                Dr. Arjun
              </span>
            </div>

          </div>
        </div>

        {/* 🔥 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">

          {/* Today */}
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

          {/* Patients */}
          <div
            onClick={() => navigate("/doctor/patients")}
            className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border flex items-center gap-4 cursor-pointer hover:shadow-md hover:scale-[1.01] transition"
          >
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

          {/* Pending */}
          <div
            onClick={() => navigate("/doctor/requests")}
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

        {/* 🔥 Schedule */}
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
            <AiOutlineLoading3Quarters className="animate-spin" />
          ) : (
            <>
              {/* MOBILE */}
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

                      {item.hasNotes ? (
                        <button className="text-blue-500 text-xs">
                          View
                        </button>
                      ) : (
                        <button className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                          Add
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* DESKTOP */}
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
                          {item.hasNotes ? (
                            <button className="text-gray-500 hover:text-blue-600 hover:underline">
                              View Notes
                            </button>
                          ) : (
                            <button className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs">
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
    </DoctorLayout>
  );
}