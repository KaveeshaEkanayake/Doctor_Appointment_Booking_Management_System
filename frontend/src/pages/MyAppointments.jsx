import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import logoImg from "../assets/Logo04.PNG";
import axios from "axios";
import profile_pic from "../assets/profile_pic.png";
import { FaHome, FaCalendarAlt, FaUser, FaSignOutAlt } from "react-icons/fa";

export default function MyAppointments() {

  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {

      const res = await axios.get("http://localhost:5173/api/auth/my-appointments");

      setAppointments(res.data);

    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const getStatusStyle = (status) => {

    if (status === "Confirmed") return "bg-green-500";
    if (status === "Rescheduled") return "bg-blue-500";
    if (status === "Canceled") return "bg-red-500";
    if (status === "Pending") return "bg-yellow-400";

    return "bg-gray-400";
  };

  return (
    <div className="flex h-screen bg-[#F6FAFF]">

      {/* LEFT SIDEBAR */}
      <div className="hidden md:flex w-1/5 flex-col bg-gray-100 p-6">

        <div className="flex items-center mb-10">
          <img src={logoImg} className="h-10 mr-2"/>
          
        </div>

        <div className="space-y-6 text-gray-600">

          <p className="flex items-center gap-2 cursor-pointer"> <FaHome />Dashboard</p>

          <div>
            <p className="flex items-center gap-2 text-blue-600 font-semibold"><FaCalendarAlt />Appointment</p>
            <div className="ml-4 mt-2 text-sm space-y-3">
              <p className="text-blue-500">Upcoming Appointment</p>
              <p className="text-gray-500">Past Appointment</p>
            </div>
          </div>

          <p className="flex items-center gap-2"> <FaUser />Profile</p>
          <p className="flex items-center gap-2"> <FaSignOutAlt /> Logout</p>

        </div>

      </div>

      {/* RIGHT CONTENT */}
      <div className="w-full md:w-4/5 flex flex-col p-10">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">

          <h2 className="text-3xl font-bold">My Appointments</h2>

          <div className="flex items-center space-x-4">
            <span className="text-xl">🔔</span>

            <div className="flex items-center space-x-2">
              <img src={profile_pic} alt="profile pic" className="w-10 h-10 rounded-full"/>
              <span>Shane Doe</span>
            </div>

          </div>

        </div>

        {/* APPOINTMENT TABLE */}
        <div className="border rounded-xl p-6 bg-white">

          {/* TABLE HEADER */}
          <div className="grid grid-cols-4 bg-gray-200 p-4 rounded-lg text-gray-600 font-medium">

            <p>Doctor Name</p>
            <p>Date</p>
            <p>Time</p>
            <p className="text-right">Status</p>

          </div>

          {/* LIST */}
          <div className="mt-4 space-y-4">

            {Array.isArray(appointments) && appointments.map((appointment, index) => (

              <div
                key={index}
                className="grid grid-cols-4 items-center border rounded-lg p-4"
              >

                <p>{appointment.doctorName}</p>
                <p>{appointment.date}</p>
                <p>{appointment.time}</p>

                <div className="flex justify-end">

                  <span
                    className={`text-white px-4 py-1 rounded-full text-sm ${getStatusStyle(appointment.status)}`}
                  >
                    {appointment.status}
                  </span>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
}

