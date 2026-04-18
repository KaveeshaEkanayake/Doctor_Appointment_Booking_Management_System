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
  const navigate   = useNavigate();
  const timeoutRef = useRef(null);

  const [appointments,      setAppointments]      = useState([]);
  const [activeMenu,        setActiveMenu]        = useState("upcoming");
  const [isSidebarOpen,     setIsSidebarOpen]     = useState(false);
  const [rescheduleAppt,    setRescheduleAppt]    = useState(null);
  const [selectedDate,      setSelectedDate]      = useState(null);
  const [selectedTime,      setSelectedTime]      = useState("");
  const [rescheduleError,   setRescheduleError]   = useState("");
  const [rescheduleSuccess, setRescheduleSuccess] = useState("");
  const [isSubmitting,      setIsSubmitting]      = useState(false);
  const [cancelAppt,        setCancelAppt]        = useState(null);
  const [cancelError,       setCancelError]       = useState("");
  const [isCancelling,      setIsCancelling]      = useState(false);

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

  const isUpcoming = (appt) => {
    const apptDate = new Date(appt.date);
    apptDate.setHours(0, 0, 0, 0);
    return apptDate >= today && appt.status !== "Cancelled";
  };

  const isPast = (appt) => {
    const apptDate = new Date(appt.date);
    apptDate.setHours(0, 0, 0, 0);
    return apptDate < today || appt.status === "Cancelled";
  };

  const filteredAppointments = appointments
    .filter((appt) => activeMenu === "upcoming" ? isUpcoming(appt) : isPast(appt))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const getStatusBadge = (status) => {
    if (status === "Confirmed") return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Confirmed</span>;
    if (status === "Pending")   return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Pending</span>;
    if (status === "Cancelled") return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Cancelled</span>;
    if (status === "Completed") return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Completed</span>;
    if (status === "Missed")    return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-200 text-red-800">Missed</span>;
    if (status === "Paid")      return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Confirmed</span>;
    return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{status}</span>;
  };

  const getPaymentBadge = (appt) => {
    if (appt.status === "Cancelled") return null;
    if (appt.status === "Paid") return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Paid</span>;
    return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-600">Unpaid</span>;
  };

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

  const openCancel = (appt) => { setCancelAppt(appt); setCancelError(""); };
  const closeCancel = () => { setCancelAppt(null); setCancelError(""); };

  const handleCancel = async () => {
    setIsCancelling(true);
    setCancelError("");
    try {
      await axios.patch(
        `${API}/api/appointments/${cancelAppt.id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchAppointments();
      closeCancel();
    } catch (err) {
      setCancelError(err.response?.data?.message || "Failed to cancel. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F6FAFF]">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black opacity-30 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}
      <div className={`fixed md:static top-0 left-0 h-full transform transition-transform duration-300 z-50 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      </div>

      <div className="flex-1 flex flex-col p-6 md:p-10 overflow-y-auto">
        <Header title="My Appointments" setIsSidebarOpen={setIsSidebarOpen} notificationsCount={0} />

        {/* Tabs */}
        <div className="flex gap-6 mb-5 border-b border-gray-200">
          <button
            onClick={() => setActiveMenu("upcoming")}
            className={`pb-2 text-sm font-medium border-b-2 transition ${
              activeMenu === "upcoming" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveMenu("past")}
            className={`pb-2 text-sm font-medium border-b-2 transition ${
              activeMenu === "past" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Past
          </button>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border">
            <img src={Noappointment} className="w-40 mb-5" alt="No appointments" />
            <h3 className="text-lg font-semibold mb-1">No Appointments</h3>
            <p className="text-gray-500 text-sm mb-3">
              You have no {activeMenu === "upcoming" ? "upcoming" : "past"} appointments
            </p>
            {activeMenu === "upcoming" && (
              <button
                onClick={() => navigate("/doctors")}
                className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 mt-4 text-sm"
              >
                Book an Appointment
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAppointments.map((appointment, index) => {
              const canReschedule = isUpcoming(appointment) && appointment.status !== "Cancelled";
              const canCancel     = isUpcoming(appointment) && appointment.status !== "Cancelled";
              const canPay        = appointment.status === "Confirmed" ||
                                    (isPast(appointment) &&
                                     appointment.status !== "Cancelled" &&
                                     appointment.status !== "Paid" &&
                                     appointment.status !== "Missed");

              return (
                <div key={index} className="bg-white rounded-xl border shadow-sm overflow-hidden">
                  <div className="px-5 py-4 flex items-start justify-between gap-4">

                    {/* Left — doctor info */}
                    <div className="flex items-start gap-4">
                      {appointment.profilePhoto ? (
                        <img
                          src={appointment.profilePhoto}
                          alt="doctor"
                          className="w-10 h-10 rounded-full object-cover border shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
                          {appointment.doctorName?.charAt(4) || "D"}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{appointment.doctorName}</p>
                        <p className="text-xs text-gray-500">{appointment.specialisation}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-gray-400">
                            {new Date(appointment.date).toLocaleDateString("en-US", {
                              weekday: "short", month: "short", day: "numeric", year: "numeric"
                            })}
                          </p>
                          <span className="text-gray-300">·</span>
                          <p className="text-xs text-gray-400">{appointment.time}</p>
                          {isToday(appointment.date) && (
                            <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-medium">Today</span>
                          )}
                          {isTomorrow(appointment.date) && (
                            <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full font-medium">Tomorrow</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right — badges + actions */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(appointment.status)}
                        {getPaymentBadge(appointment)}
                      </div>
                      <div className="flex items-center gap-2">
                        {canPay && (
                          <button
                            onClick={() => navigate(`/patient/payment/${appointment.id}`, { state: { appointment } })}
                            className="text-xs bg-green-500 text-white hover:bg-green-600 px-3 py-1 rounded-full transition"
                          >
                            Pay Now
                          </button>
                        )}
                        {canReschedule && (
                          <button
                            onClick={() => openReschedule(appointment)}
                            className="text-xs border border-blue-400 text-blue-600 hover:bg-blue-600 hover:text-white px-3 py-1 rounded-full transition"
                          >
                            Reschedule
                          </button>
                        )}
                        {canCancel && (
                          <button
                            onClick={() => openCancel(appointment)}
                            className="text-xs border border-red-400 text-red-500 hover:bg-red-500 hover:text-white px-3 py-1 rounded-full transition"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {appointment.rejectionReason && (
                    <div className="px-5 py-3 bg-red-50 border-t flex items-start gap-2">
                      <span className="text-red-500 text-sm">ⓘ</span>
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
        )}
      </div>

      {/* Cancel Modal */}
      {cancelAppt && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-500 text-xl">⚠</span>
              </div>
            </div>
            <h2 className="text-lg font-semibold text-gray-800 text-center mb-2">Cancel Appointment?</h2>
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to cancel? This action cannot be undone and the slot will be released.
            </p>
            <button
              type="button" onClick={handleCancel} disabled={isCancelling}
              className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl mb-3 transition disabled:opacity-50"
            >
              {isCancelling ? "Cancelling..." : "Yes, Cancel Appointment"}
            </button>
            <button
              type="button" onClick={closeCancel} disabled={isCancelling}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition"
            >
              No, Keep Appointment
            </button>
            <div className="mt-4 bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                {cancelAppt.doctorName.charAt(4)}
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-semibold">Selected Appointment</p>
                <p className="text-xs font-medium text-gray-700">
                  {cancelAppt.doctorName} · {new Date(cancelAppt.date).toLocaleDateString("default", { month: "short", day: "numeric" })}, {cancelAppt.time}
                </p>
              </div>
            </div>
            {cancelError && <p className="text-red-500 text-sm mt-3 text-center">{cancelError}</p>}
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleAppt && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b">
              <div>
                <h2 className="text-base font-semibold text-gray-800">Reschedule appointment</h2>
                <p className="text-xs text-gray-400 mt-0.5">{rescheduleAppt.doctorName}</p>
              </div>
              <button type="button" onClick={closeReschedule} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>

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
              <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide mb-1">Current appointment</p>
                <p className="text-sm font-medium text-gray-700">
                  {new Date(rescheduleAppt.date).toLocaleDateString("default", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · {rescheduleAppt.time}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DateSelector selectedDate={selectedDate} onSelectDate={(date) => { setSelectedDate(date); setSelectedTime(""); }} />
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

              {selectedDate && selectedTime && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                  <p className="text-xs text-blue-500 font-medium">New appointment time</p>
                  <p className="text-sm font-semibold text-blue-700 mt-0.5">
                    {selectedDate.toLocaleDateString("default", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · {selectedTime}
                  </p>
                </div>
              )}

              <p className="text-xs text-gray-400 flex items-center gap-1">
                <span>ⓘ</span> Doctor will need to re-confirm after rescheduling
              </p>
              {rescheduleError && <p className="text-red-500 text-sm">{rescheduleError}</p>}
              {rescheduleSuccess && <p className="text-green-500 text-sm">{rescheduleSuccess}</p>}
            </div>

            <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
              <p className="text-xs text-gray-400">
                {!selectedDate ? "Step 1 of 3 — choose a new date" : !selectedTime ? "Step 2 of 3 — pick a time slot" : "Step 3 of 3 — confirm your reschedule"}
              </p>
              <div className="flex gap-3">
                <button type="button" onClick={closeReschedule} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-100">
                  Cancel
                </button>
                <button
                  type="button" onClick={handleReschedule}
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