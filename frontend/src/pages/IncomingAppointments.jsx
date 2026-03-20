import { useState } from "react";
import {
  initialPendingAppointments,
  initialConfirmedAppointments,
} from "../assets/appointmentsData";

import {
  FaCalendarCheck,
  FaSyncAlt,
  FaFilter,
  FaClock,
  FaCalendarAlt,
  FaThLarge,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";

function IncomingAppointments() {
  const [tab, setTab] = useState("pending");

  const [pending, setPending] = useState(initialPendingAppointments);
  const [confirmed, setConfirmed] = useState(initialConfirmedAppointments);

  const handleAccept = (appointment) => {
    setPending((prev) => prev.filter((a) => a.id !== appointment.id));
    setConfirmed((prev) => [...prev, appointment]);
  };

  const handleDecline = (id) => {
    setPending((prev) => prev.filter((a) => a.id !== id));
  };

  const data = tab === "pending" ? pending : confirmed;

  return (
    <div className="flex h-screen bg-white">

      {/* SIDEBAR */}
      <div className="w-64 bg-blue-50 p-6">
        <h1 className="text-blue-600 font-bold text-4xl mb-10">MediCare</h1>

        <ul className="space-y-4 mt-12">
          <li className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg">
            <FaThLarge /> Dashboard
          </li>

          <li className="flex items-center gap-3 px-3 py-2 bg-blue-500 text-white rounded-lg">
            <FaCalendarCheck /> My Appointments
          </li>

          <li className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg">
            <FaCalendarAlt /> My Availability
          </li>

          <li className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg">
            <FaUser /> Profile
          </li>

          <li className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg">
            <FaSignOutAlt /> Logout
          </li>
        </ul>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-8 ">

        {/* HEADER (no card) */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-500">Hi, Dr.Arjun</p>
            <h2 className="text-3xl font-bold mt-2 mb-4">My Appointments</h2>
          </div>

          <div className="flex items-center gap-3">
            <img  
              src="https://thumbs.dreamstime.com/b/portrait-happy-arabic-doctor-male-blue-background-square-smiling-to-camera-wearing-white-uniform-posing-headshot-cheerful-233544543.jpg"  
              alt="doctor"  
              className="w-10 h-10 rounded-full object-cover"/>
            <span className="font-medium">Dr. Arjun</span>            
          </div>
        </div>

        {/* TABS + FILTER */}
        <div className="flex justify-between items-center mb-6 max-w-4xl">

          <div className="flex gap-6 border-b pb-2">
            <button
              onClick={() => setTab("pending")}
              className={`font-semibold ${
                tab === "pending"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500"
              }`}
            >
              Pending Requests ({pending.length})
            </button>

            <button
              onClick={() => setTab("confirmed")}
              className={`font-semibold ${
                tab === "confirmed"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500"
              }`}
            >
              Confirmed Appointments ({confirmed.length})
            </button>
          </div>

          {/* FILTER BUTTONS */}
          <div className="flex gap-3">
            <button className="flex items-center gap-2 border px-3 py-1 rounded text-gray-600">
              <FaFilter /> Filter
            </button>

            <button className="flex items-center gap-2 border px-3 py-1 rounded text-gray-600">
              <FaCalendarAlt /> Date: Newest First
            </button>
          </div>
        </div>

        {/* EMPTY STATE */}
        {tab === "pending" && data.length === 0 && (
          <div className="text-center mt-20">
            <h3 className="text-2xl font-bold mb-3">
              No pending requests at the moment
            </h3>

            <p className="text-gray-500 mb-6">
              You're all caught up! Check back later or view your <br />
              confirmed appointments for today's schedule.
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setTab("confirmed")}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg"
              >
                <FaCalendarCheck />
                View Confirmed Appointments
              </button>

              <button className="flex items-center gap-2 border px-5 py-2 rounded-lg text-gray-600">
                <FaSyncAlt />
                Refresh Dashboard
              </button>
            </div>
          </div>
        )}

        {/* CARDS */}
        <div className="space-y-4 max-w-4xl">

          {data.map((app) => (
            <div
              key={app.id}
              className="bg-gray-50 p-4 outline outline-1 outline-gray-300 rounded-xl flex justify-between items-center"
            >
              <div className="flex gap-4 items-center">

                {/* IMAGE */}
                <img
                  src={app.image}
                  alt={app.name}
                  className="w-14 h-14 rounded-lg object-cover"
                />

                {/* DETAILS */}
                <div className="space-y-1">
                  <h3 className="font-semibold">{app.name}</h3>

                  <div className="flex gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <FaCalendarAlt /> {app.date}
                    </span>

                    <span className="flex items-center gap-1">
                      <FaClock /> {app.time}
                    </span>
                  </div>

                  <p className="text-sm text-gray-800">
                    Reason: {app.reason}
                  </p>
                </div>
              </div>

              {/* ACTIONS */}
              {tab === "pending" ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(app)}
                    className="bg-blue-600 text-white px-4 py-1 rounded-lg"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDecline(app.id)}
                    className="border px-4 py-1 rounded-lg"
                  >
                    Decline
                  </button>
                </div>
              ) : (
                <button className="border px-4 py-1 rounded-lg">
                  View Details
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default IncomingAppointments;