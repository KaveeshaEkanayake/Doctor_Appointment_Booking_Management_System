import React, { useState, useEffect } from "react";
import axios                           from "axios";
import DoctorLayout                    from "../layouts/DoctorLayout";
import { AiOutlineLoading3Quarters }   from "react-icons/ai";
import { FiCalendar, FiClock, FiX, FiFilter } from "react-icons/fi";
import { LuArrowUpDown }               from "react-icons/lu";

const API = import.meta.env.VITE_API_URL;

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState("pending");
  const [rejectModal,  setRejectModal]  = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [submitting,   setSubmitting]   = useState(false);
  const [error,        setError]        = useState("");
  const [sortOrder,    setSortOrder]    = useState("newest");

  const token = localStorage.getItem("token");
  const user  = (() => {
    try { return JSON.parse(localStorage.getItem("user")) || {}; }
    catch { return {}; }
  })();

  const fetchAppointments = async () => {
    try {
      const res = await axios.get(`${API}/api/doctor/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(res.data.appointments ?? []);
    } catch {
      setError("Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleAccept = async (appointmentId) => {
    try {
      await axios.patch(
        `${API}/api/doctor/appointments/${appointmentId}/status`,
        { status: "CONFIRMED" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppointments(prev =>
        prev.map(a => a.id === appointmentId ? { ...a, status: "CONFIRMED" } : a)
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to confirm appointment");
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }
    setSubmitting(true);
    try {
      await axios.patch(
        `${API}/api/doctor/appointments/${rejectModal.id}/status`,
        { status: "CANCELLED", rejectionReason: rejectReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppointments(prev =>
        prev.map(a => a.id === rejectModal.id
          ? { ...a, status: "CANCELLED", rejectionReason: rejectReason }
          : a
        )
      );
      setRejectModal(null);
      setRejectReason("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject appointment");
    } finally {
      setSubmitting(false);
    }
  };

  const sortFn = (a, b) => sortOrder === "newest"
    ? new Date(b.date) - new Date(a.date)
    : new Date(a.date) - new Date(b.date);

  const pending = appointments
    .filter(a => a.status === "PENDING")
    .sort(sortFn);

  const confirmed = appointments
    .filter(a => a.status === "CONFIRMED")
    .sort(sortFn);

  const AppointmentCard = ({ appt, showActions = false }) => (
    <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-sm transition">
      <div className="flex items-center gap-4">
        {appt.profilePhoto ? (
          <img
            src={appt.profilePhoto}
            alt={appt.patientName}
            className="w-14 h-14 rounded-full object-cover border border-gray-100 flex-shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-xl font-bold text-blue-400 border border-blue-100 flex-shrink-0">
            {appt.patientName?.[0]}
          </div>
        )}
        <div>
          <p className="font-semibold text-gray-800 text-sm">{appt.patientName}</p>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <FiCalendar className="text-gray-400 text-[11px]" />
              {new Date(appt.date).toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric"
              })}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <FiClock className="text-gray-400 text-[11px]" />
              {appt.time}
            </span>
          </div>
          {appt.reason && (
            <p className="text-xs text-gray-400 mt-1">
              Reason: {appt.reason}
            </p>
          )}
        </div>
      </div>

      {showActions ? (
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => handleAccept(appt.id)}
            className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
          >
            Accept
          </button>
          <button
            onClick={() => { setRejectModal(appt); setRejectReason(""); }}
            className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-full text-sm font-semibold hover:bg-gray-50 transition"
          >
            Decline
          </button>
        </div>
      ) : (
        <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0">
          Confirmed
        </span>
      )}
    </div>
  );

  return (
    <DoctorLayout>
      <div className="p-6 md:p-8">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm text-gray-500">Hi, Dr.{user.firstName ?? "Doctor"}</p>
            <h1 className="text-2xl font-bold text-gray-800">My Appointments</h1>
          </div>
          <div className="flex items-center gap-3">
            {user.profilePhoto ? (
              <img
                src={user.profilePhoto}
                alt={user.firstName}
                className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {user.firstName?.[0]?.toUpperCase() ?? "D"}
              </div>
            )}
            <span className="text-sm font-medium text-gray-700 hidden md:block">
              Dr. {user.firstName}
            </span>
          </div>
        </div>

        {/* ── Tabs + Controls ── */}
        <div className="flex items-center justify-between border-b border-gray-200 mb-6">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab("pending")}
              className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
                activeTab === "pending"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Pending Requests
              {pending.length > 0 && (
                <span className="bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {pending.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("confirmed")}
              className={`pb-3 text-sm font-semibold border-b-2 transition ${
                activeTab === "confirmed"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Confirmed Appointments
            </button>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 mb-3">
            <button className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">
              <FiFilter className="text-xs" />
              Filter
            </button>
            <button
              onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
              className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
            >
              <LuArrowUpDown className="text-xs" />
              Date: {sortOrder === "newest" ? "Newest First" : "Oldest First"}
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-400 gap-2">
            <AiOutlineLoading3Quarters className="animate-spin text-xl" />
            <span>Loading appointments...</span>
          </div>
        ) : error ? (
          <div className="text-center py-24 text-red-500">{error}</div>
        ) : activeTab === "pending" ? (
          pending.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-5xl mb-4">📅</p>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">No Pending Requests</h3>
              <p className="text-gray-400 text-sm">You have no pending appointment requests.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((appt) => (
                <AppointmentCard key={appt.id} appt={appt} showActions={true} />
              ))}
            </div>
          )
        ) : (
          confirmed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-5xl mb-4">✅</p>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">No Confirmed Appointments</h3>
              <p className="text-gray-400 text-sm">No appointments have been confirmed yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {confirmed.map((appt) => (
                <AppointmentCard key={appt.id} appt={appt} showActions={false} />
              ))}
            </div>
          )
        )}
      </div>

      {/* ── Reject Modal ── */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">

            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-red-500 text-sm">⊗</span>
                </div>
                <h3 className="text-base font-bold text-gray-800">Reject Appointment</h3>
              </div>
              <button
                onClick={() => setRejectModal(null)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="px-6 py-5">
              <p className="text-sm text-gray-500 mb-4">
                You are about to decline this appointment request. Please provide a clear reason
                for the patient to help them understand why this slot cannot be filled.
              </p>

              <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3 mb-5 border border-gray-100">
                {rejectModal.profilePhoto ? (
                  <img
                    src={rejectModal.profilePhoto}
                    alt={rejectModal.patientName}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold text-sm flex-shrink-0">
                    {rejectModal.patientName?.[0]}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-800">{rejectModal.patientName}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <FiCalendar className="text-xs" />
                      {new Date(rejectModal.date).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric"
                      })}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <FiClock className="text-xs" />
                      {rejectModal.time}
                    </span>
                  </div>
                  {rejectModal.reason && (
                    <p className="text-xs text-gray-400 italic mt-0.5">
                      "{rejectModal.reason}"
                    </p>
                  )}
                </div>
              </div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reason for rejection
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Doctor unavailable during this slot, please reschedule for the following day."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 h-28 resize-none"
              />
              <p className="text-xs text-gray-400 mt-2">
                NOTE: This message will be sent directly to the patient's dashboard.
              </p>
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setRejectModal(null)}
                className="flex-1 py-2.5 rounded-full border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-full bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting && <AiOutlineLoading3Quarters className="animate-spin text-sm" />}
                Submit Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </DoctorLayout>
  );
}