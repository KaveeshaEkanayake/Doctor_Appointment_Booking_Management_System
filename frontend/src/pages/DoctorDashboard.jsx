// import React from "react";
// import DoctorLayout from "../layouts/DoctorLayout";

// export default function DoctorDashboard() {
//   return (
//     <DoctorLayout>
//       <div className="p-8">
//         <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
//         <p className="text-gray-500 mt-2">
//           Welcome to your doctor dashboard. This page is under construction.
//         </p>
//       </div>
//     </DoctorLayout>
//   );
// }


import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DoctorLayout from "../layouts/DoctorLayout";
import { FiCalendar, FiUsers, FiAlertTriangle } from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function DoctorDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    today: 0,
    patients: 0,
    pending: 0,
  });

  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      setStats({
        today: 12,
        patients: 1240,
        pending: 4,
      });

      // ✅ Added hasNotes field (IMPORTANT)
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
          hasNotes: false, // 👈 shows Add Notes
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
      <div className="p-6 md:p-8">

        {/* 🔥 Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome back, Dr. Arjun
            </h1>
            <p className="text-gray-500 text-sm">
              Monday, November 4, 2024
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification */}
            <button className="relative p-2 rounded-full hover:bg-gray-100 transition">
              🔔
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile */}
            <div
              onClick={() => navigate("/doctor/profile")}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-lg transition"
            >
              <img
                src="https://i.pravatar.cc/40"
                alt="profile"
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm font-medium text-gray-700">
                Dr. Arjun
              </span>
            </div>
          </div>
        </div>

        {/* 🔥 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

          <div
            onClick={() => navigate("/doctor/appointments")}
            className="bg-white p-6 rounded-xl shadow-sm border flex items-center gap-4 cursor-pointer hover:shadow-md transition"
          >
            <div className="bg-blue-100 p-3 rounded-lg">
              <FiCalendar className="text-blue-500 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Today's Appointments</p>
              {loading ? (
                <AiOutlineLoading3Quarters className="animate-spin mt-1" />
              ) : (
                <h2 className="text-2xl font-bold">{stats.today}</h2>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center gap-4 hover:shadow-md transition">
            <div className="bg-purple-100 p-3 rounded-lg">
              <FiUsers className="text-purple-500 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Patients Served</p>
              {loading ? (
                <AiOutlineLoading3Quarters className="animate-spin mt-1" />
              ) : (
                <h2 className="text-2xl font-bold">{stats.patients}</h2>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center gap-4 hover:shadow-md transition">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <FiAlertTriangle className="text-yellow-500 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Requests</p>
              {loading ? (
                <AiOutlineLoading3Quarters className="animate-spin mt-1" />
              ) : (
                <h2 className="text-2xl font-bold">{stats.pending}</h2>
              )}
            </div>
          </div>

        </div>

        {/* 🔥 Schedule Table */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Today's Schedule
            </h2>

            <button
              onClick={() => navigate("/doctor/appointments")}
              className="text-blue-500 text-sm font-medium hover:underline"
            >
              View All
            </button>
          </div>

          {loading ? (
            <AiOutlineLoading3Quarters className="animate-spin" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                
                {/* ✅ HEADER FIXED */}
                <thead className="text-gray-400 border-b text-xs uppercase">
                  <tr>
                    <th className="py-3 text-left">PATIENT NAME</th>
                    <th className="text-left">TIME</th>
                    <th className="text-left">REASON</th>
                    <th className="text-left">STATUS</th>
                    <th className="text-right">ACTIONS</th>
                  </tr>
                </thead>

                {/* ✅ BODY FIXED */}
                <tbody className="divide-y">
                  {appointments.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition">
                      
                      <td className="py-4 font-medium text-gray-700">
                        {item.name}
                      </td>

                      <td className="text-gray-600">{item.time}</td>

                      <td className="text-gray-600">{item.reason}</td>

                      <td>
                        <span className={statusStyle(item.status)}>
                          {item.status}
                        </span>
                      </td>

                      {/* ✅ PERFECT ALIGNMENT */}
                      <td className="text-right">
                        {item.hasNotes ? (
                          <button
                            onClick={() => navigate("/doctor/appointments")}
                            className="text-gray-500 text-sm hover:text-blue-600 hover:underline transition"
                          >
                            View Notes
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate("/doctor/appointments")}
                            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-blue-700 transition"
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
          )}
        </div>

      </div>
    </DoctorLayout>
  );
}