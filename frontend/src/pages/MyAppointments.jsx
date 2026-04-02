import React, { useState, useEffect, useRef } from "react";
import { useNavigate }                         from "react-router-dom";
import Noappointment                           from "../assets/Noappointment.png";
import axios                                   from "axios";
import Sidebar                                 from "../components/SideBar(patient)";
import Header                                  from "../components/Header(patient)";
import DateSelector                            from "../components/DateSelector";
import AvailableSlots                          from "../components/AvailableSlots";

const API = import.meta.env.VITE_API_URL;

export default function MyAppointments() {
  const navigate    = useNavigate();
  const timeoutRef  = useRef(null);

  const [appointments,      setAppointments]      = useState([]);
  const [activeMenu,        setActiveMenu]        = useState("upcoming");
  const [isSidebarOpen,     setIsSidebarOpen]     = useState(false);
  const [rescheduleAppt,    setRescheduleAppt]    = useState(null);
  const [selectedDate,      setSelectedDate]      = useState(null);
  const [selectedTime,      setSelectedTime]      = useState("");
  const [rescheduleError,   setRescheduleError]   = useState("");
  const [rescheduleSuccess, setRescheduleSuccess] = useState("");
  const [isSubmitting,      setIsSubmitting]      = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : "auto";
  }, [isSidebarOpen]);

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

  useEffect(() => {
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
      if (activeMenu === "upcoming") {
        return appt.status === "Pending" || appt.status === "Confirmed";
      } else {
        return (
          appt.status === "Completed" ||
          appt.status === "Missed" ||
          appt.status === "Cancelled"
        );
      }
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const openReschedule = (appt) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setRescheduleAppt(appt);
    setSelectedDate(null);
    setSelectedTime("");
    setRescheduleError("");
    setRescheduleSuccess("");
  };

  const closeReschedule = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setRescheduleAppt(null);
    setSelectedDate(null);
    setSelectedTime("");
    setRescheduleError("");
    setRescheduleSuccess("");
  };

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) {
      setRescheduleError("Please select a date and time.");
      return;
    }

    const year    = selectedDate.getFullYear();
    const month   = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day     = String(selectedDate.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    setIsSubmitting(true);
    setRescheduleError("");

    try {
      await axios.patch(
        `${API}/api/appointments/${rescheduleAppt.id}/reschedule`,
        { date: dateStr, time: selectedTime },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRescheduleSuccess("Appointment rescheduled successfully. Awaiting doctor confirmation.");
      await fetchAppointments();
      timeoutRef.current = setTimeout(() => closeReschedule(), 2000);
    } catch (err) {
      setRescheduleError(err.response?.data?.message || "Failed to reschedule. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] bg-gray-100 px-3 py-1.5 rounded-md text-gray-600 font-medium text-xs gap-x-4">
                <p>Doctor Name</p>
                <p className="text-center">Date</p>
                <p className="text-center">Time</p>
                <p className="text-right">Status</p>
                <p></p>
              </div>

              <div className="mt-2 space-y-1.5">
                {filteredAppointments.map((appointment, index) => {
                  const todayRow      = isToday(appointment.date);
                  const fullDateTime  = `${new Date(appointment.date).toLocaleDateString()} ${appointment.time}`;
                  const canReschedule = appointment.status === "Pending" || appointment.status === "Confirmed";

                  return (
                    <div key={index}>
                      <div
                        className={`grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] items-center border rounded-md px-3 py-1.5 gap-x-4 transition
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

                        <div className="flex justify-end">
                          {canReschedule && (
                            <button
                              type="button"
                              onClick={() => openReschedule(appointment)}
                              className="text-xs bg-white text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-400 px-3 py-0.5 rounded-full transition whitespace-nowrap"
                            >
                              Reschedule
                            </button>
                          )}
                        </div>
                      </div>

                      {appointment.rejectionReason && (
                        <div className="border border-t-0 rounded-b-md px-4 py-3 bg-red-50 flex items-start gap-2">
                          <span className="text-red-500 text-sm mt-0.5">ⓘ</span>
                          <div>
                            <p className="text-xs font-semibold text-red-600">Note from Doctor</p>
                            <p className="text-xs text-red-500 mt-0.5">{appointment.rejectionReason}</p>
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

      {/* Reschedule Modal */}
      {rescheduleAppt && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-y-auto max-h-[90vh]">

            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b">
              <div>
                <h2 className="text-base font-semibold text-gray-800">Reschedule appointment</h2>
                <p className="text-xs text-gray-400 mt-0.5">{rescheduleAppt.doctorName}</p>
              </div>
              <button
                type="button"
                onClick={closeReschedule}
                className="text-gray-400 hover:text-gray-600 text-lg"
                aria-label="Close reschedule modal"
              >
                ✕
              </button>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center gap-2 px-6 py-3 border-b bg-gray-50 text-xs">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">1</span>
              <span className="font-medium text-blue-600">Select date</span>
              <span className="text-gray-300 mx-1">›</span>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${selectedDate ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"}`}>2</span>
              <span className={`font-medium ${selectedDate ? "text-blue-600" : "text-gray-400"}`}>Pick time slot</span>
              <span className="text-gray-300 mx-1">›</span>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${selectedTime ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"}`}>3</span>
              <span className={`font-medium ${selectedTime ? "text-blue-600" : "text-gray-400"}`}>Confirm</span>
            </div>

            <div className="px-6 py-4 space-y-4">

              {/* Current Appointment Info */}
              <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide mb-1">Current appointment</p>
                  <p className="text-sm font-medium text-gray-700">
                    {new Date(rescheduleAppt.date).toLocaleDateString("default", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · {rescheduleAppt.time}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusStyle(rescheduleAppt.status)}`}>
                  {rescheduleAppt.status}
                </span>
              </div>

              {/* Date and Slots side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DateSelector
                  selectedDate={selectedDate}
                  onSelectDate={(date) => {
                    setSelectedDate(date);
                    setSelectedTime("");
                  }}
                />
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">Available time slots</p>
                  <AvailableSlots
                    doctorId={rescheduleAppt.doctorId}
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    onSelectTime={setSelectedTime}
                  />
                </div>
              </div>

              {/* Selected summary */}
              {selectedDate && selectedTime && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                  <p className="text-xs text-blue-500 font-medium">New appointment time</p>
                  <p className="text-sm font-semibold text-blue-700 mt-0.5">
                    {selectedDate.toLocaleDateString("default", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · {selectedTime}
                  </p>
                </div>
              )}

              {/* Info note */}
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <span>ⓘ</span> Doctor will need to re-confirm after rescheduling
              </p>

              {rescheduleError && (
                <p className="text-red-500 text-sm">{rescheduleError}</p>
              )}
              {rescheduleSuccess && (
                <p className="text-green-500 text-sm">{rescheduleSuccess}</p>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
              <p className="text-xs text-gray-400">
                {!selectedDate ? "Step 1 of 3 — choose a new date" : !selectedTime ? "Step 2 of 3 — pick a time slot" : "Step 3 of 3 — confirm your reschedule"}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeReschedule}
                  className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReschedule}
                  disabled={isSubmitting || !selectedDate || !selectedTime}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Rescheduling..." : "Confirm reschedule"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}