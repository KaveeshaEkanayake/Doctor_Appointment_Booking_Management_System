import React, { useState, useEffect } from "react";
import { useNavigate }                from "react-router-dom";
import Noappointment                  from "../assets/Noappointment.png";
import axios                          from "axios";
import Sidebar                        from "../components/SideBar(patient)";
import Header                         from "../components/Header(patient)";

const API = import.meta.env.VITE_API_URL;

export default function MyAppointments() {
  const navigate = useNavigate();

  const [appointments,  setAppointments]  = useState([]);
  const [activeMenu,    setActiveMenu]    = useState("upcoming");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : "auto";
  }, [isSidebarOpen]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get(`${API}/api/appointments/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAppointments(Array.isArray(res.data.appointments) ? res.data.appointments : []);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setAppointments([]);
      }
    };
    fetchAppointments();
  }, []);

  const getStatusStyle = (status) => {
    if (status === "Confirmed")   return "bg-green-100 text-green-700";
    if (status === "Rescheduled") return "bg-blue-100 text-blue-700";
    if (status === "Cancelled")   return "bg-red-100 text-red-700";
    if (status === "Pending")     return "bg-yellow-100 text-yellow-700";
    if (status === "Completed")   return "bg-gray-100 text-gray-700";
    if (status === "Missed")      return "bg-red-200 text-red-800";
    return "bg-gray-100 text-gray-600";
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const isToday = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  };

  const isTomorrow = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === tomorrow.getTime();
  };

  const filteredAppointments = appointments
    .filter((appt) => {
      const apptDate = new Date(appt.date);
      apptDate.setHours(0, 0, 0, 0);
      if (activeMenu === "upcoming") {
        return apptDate >= today &&
          appt.status !== "Completed" &&
          appt.status !== "Missed";
      } else {
        return apptDate < today ||
          appt.status === "Completed" ||
          appt.status === "Missed";
      }
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="flex h-screen bg-[#F6FAFF]">

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-30 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={`fixed md:static top-0 left-0 h-full transform transition-transform duration-300 z-50
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      </div>

      <div className="flex-1 flex flex-col p-6 md:p-10 overflow-y-auto">
        <Header
          title="My Appointments"
          setIsSidebarOpen={setIsSidebarOpen}
          notificationsCount={0}
        />

        <div className="border rounded-xl p-5 bg-white">
          {filteredAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <img src={Noappointment} className="w-40 mb-5" alt="No appointments" />
              <h3 className="text-lg font-semibold mb-1">No Appointments Scheduled</h3>
              <p className="text-gray-500 text-sm mb-3">
                You have no {activeMenu === "upcoming" ? "upcoming" : "past"} appointments
              </p>
              <button
                onClick={() => navigate("/doctors")}
                className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 mt-4 text-sm"
              >
                Book an Appointment
              </button>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr] bg-gray-100 px-3 py-1.5 rounded-md text-gray-600 font-medium text-xs gap-x-4">
                <p>Doctor Name</p>
                <p className="text-center">Date</p>
                <p className="text-center">Time</p>
                <p className="text-right">Status</p>
              </div>

              {/* Table body */}
              <div className="mt-2 space-y-1.5">
                {filteredAppointments.map((appointment, index) => {
                  const todayRow     = isToday(appointment.date);
                  const fullDateTime = `${new Date(appointment.date).toLocaleDateString()} ${appointment.time}`;

                  return (
                    <div key={index}>
                      {/* Appointment row */}
                      <div
                        className={`grid grid-cols-[2fr_1.5fr_1fr_1fr] items-center border rounded-md px-3 py-1.5 gap-x-4 transition
                          ${todayRow ? "bg-blue-50 border-blue-300" : "hover:bg-gray-50"}
                          ${appointment.rejectionReason ? "rounded-b-none border-b-0" : ""}`}
                      >
                        <p className="truncate text-sm">{appointment.doctorName}</p>

                        <div className="flex flex-col items-center text-sm gap-1">
                          <span className="truncate cursor-pointer" title={fullDateTime}>
                            {new Date(appointment.date).toLocaleDateString()}
                          </span>
                          <div className="flex gap-1 flex-wrap justify-center">
                            {isToday(appointment.date) && (
                              <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full">
                                Today
                              </span>
                            )}
                            {isTomorrow(appointment.date) && (
                              <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full">
                                Tomorrow
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-center text-sm">{appointment.time}</p>

                        <div className="flex justify-end">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </div>
                      </div>

                      {/* Rejection note from doctor */}
                      {appointment.rejectionReason && (
                        <div className="border border-t-0 rounded-b-md px-4 py-3 bg-red-50 flex items-start gap-2">
                          <span className="text-red-500 text-sm mt-0.5">ⓘ</span>
                          <div>
                            <p className="text-xs font-semibold text-red-600">
                              Note from Doctor
                            </p>
                            <p className="text-xs text-red-500 mt-0.5">
                              {appointment.rejectionReason}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}