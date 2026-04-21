import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/SideBar(patient)";
import Header from "../components/Header(patient)";
import { FiCalendar, FiCheckCircle, FiXCircle, FiAlertCircle } from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const API = import.meta.env.VITE_API_URL;

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [stats, setStats]                 = useState({
    upcoming:  0,
    completed: 0,
    cancelled: 0,
  });
  const [nextAppointment, setNextAppointment]     = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [outstanding, setOutstanding]             = useState(0);
  const [unpaidAppointments, setUnpaidAppointments] = useState([]);
  const [showUnpaid, setShowUnpaid]               = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const patientName = user.firstName
    ? `${user.firstName} ${user.lastName}`
    : "Patient";
  const token = localStorage.getItem("token");

  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : "auto";
  }, [isSidebarOpen]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch(`${API}/api/patient/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "Failed to load dashboard");
        setStats(data.data.stats);
        setNextAppointment(data.data.nextAppointment);
        setRecentAppointments(data.data.recentAppointments);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data. Please refresh.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  useEffect(() => {
    const fetchOutstanding = async () => {
      try {
        const res = await fetch(`${API}/api/appointments/outstanding`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setOutstanding(data.totalOutstanding);
          setUnpaidAppointments(data.unpaidAppointments);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchOutstanding();
  }, []);

  const getStatusStyle = (status) => {
    if (status === "Confirmed") return "bg-green-100 text-green-700";
    if (status === "Pending")   return "bg-yellow-100 text-yellow-700";
    if (status === "Completed") return "bg-blue-100 text-blue-700";
    if (status === "Cancelled") return "bg-red-100 text-red-700";
    if (status === "Missed")    return "bg-red-200 text-red-800";
    return "bg-gray-100 text-gray-600";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month:   "short",
      day:     "numeric",
      year:    "numeric",
    });
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
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col p-6 md:p-10 overflow-y-auto">
        <Header
          title="Dashboard"
          setIsSidebarOpen={setIsSidebarOpen}
          notificationsCount={0}
        />

        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            Welcome back, {patientName} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year:    "numeric",
              month:   "long",
              day:     "numeric",
            })}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

          <div
            onClick={() => navigate("/my-appointments")}
            className="bg-white p-5 rounded-xl shadow-sm border flex items-center gap-4 cursor-pointer hover:shadow-md hover:scale-[1.01] transition"
          >
            <div className="bg-blue-100 p-3 rounded-lg">
              <FiCalendar className="text-blue-500 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Upcoming</p>
              {loading ? (
                <AiOutlineLoading3Quarters className="animate-spin mt-1" />
              ) : (
                <h2 className="text-2xl font-bold">{stats.upcoming}</h2>
              )}
            </div>
          </div>

          <div
            onClick={() => navigate("/my-appointments")}
            className="bg-white p-5 rounded-xl shadow-sm border flex items-center gap-4 cursor-pointer hover:shadow-md hover:scale-[1.01] transition"
          >
            <div className="bg-green-100 p-3 rounded-lg">
              <FiCheckCircle className="text-green-500 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              {loading ? (
                <AiOutlineLoading3Quarters className="animate-spin mt-1" />
              ) : (
                <h2 className="text-2xl font-bold">{stats.completed}</h2>
              )}
            </div>
          </div>

          <div
            onClick={() => navigate("/my-appointments")}
            className="bg-white p-5 rounded-xl shadow-sm border flex items-center gap-4 cursor-pointer hover:shadow-md hover:scale-[1.01] transition"
          >
            <div className="bg-red-100 p-3 rounded-lg">
              <FiXCircle className="text-red-500 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Cancelled</p>
              {loading ? (
                <AiOutlineLoading3Quarters className="animate-spin mt-1" />
              ) : (
                <h2 className="text-2xl font-bold">{stats.cancelled}</h2>
              )}
            </div>
          </div>

          {/* Outstanding Balance Card */}
          <div
            onClick={() => setShowUnpaid(true)}
            className={`bg-white p-5 rounded-xl shadow-sm border flex items-center gap-4 cursor-pointer hover:shadow-md hover:scale-[1.01] transition ${
              outstanding > 0 ? "border-orange-200" : ""
            }`}
          >
            <div className={`p-3 rounded-lg ${outstanding > 0 ? "bg-orange-100" : "bg-gray-100"}`}>
              <FiAlertCircle className={`text-xl ${outstanding > 0 ? "text-orange-500" : "text-gray-400"}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Outstanding</p>
              <h2 className={`text-xl font-bold ${outstanding > 0 ? "text-orange-500" : "text-gray-800"}`}>
                Rs.{outstanding.toFixed(2)}
              </h2>
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Next Appointment */}
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-semibold text-gray-800">Next Appointment</h2>
              <button
                onClick={() => navigate("/my-appointments")}
                className="text-blue-500 text-sm hover:underline"
              >
                View All
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <AiOutlineLoading3Quarters className="animate-spin text-2xl text-blue-500" />
              </div>
            ) : nextAppointment ? (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  {nextAppointment.profilePhoto ? (
                    <img
                      src={nextAppointment.profilePhoto}
                      alt="doctor"
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center">
                      <span className="text-blue-600 text-sm font-bold">
                        {nextAppointment.doctorName.charAt(4)}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{nextAppointment.doctorName}</p>
                    <p className="text-xs text-gray-500">{nextAppointment.specialisation}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500">{formatDate(nextAppointment.date)}</p>
                    <p className="text-sm font-medium text-gray-700">{nextAppointment.time}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(nextAppointment.status)}`}>
                    {nextAppointment.status}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <FiCalendar className="text-4xl mx-auto mb-2" />
                <p className="text-sm">No upcoming appointments</p>
                <button
                  onClick={() => navigate("/doctors")}
                  className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-600"
                >
                  Book Now
                </button>
              </div>
            )}
          </div>

          {/* Recent Appointments */}
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-semibold text-gray-800">Recent Appointments</h2>
              <button
                onClick={() => navigate("/my-appointments")}
                className="text-blue-500 text-sm hover:underline"
              >
                View All
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <AiOutlineLoading3Quarters className="animate-spin text-2xl text-blue-500" />
              </div>
            ) : recentAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <FiCalendar className="text-4xl mx-auto mb-2" />
                <p className="text-sm">No appointments yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAppointments.map((apt, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center border rounded-lg px-4 py-3 hover:bg-gray-50 transition"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">{apt.doctorName}</p>
                      <p className="text-xs text-gray-500">{apt.specialisation}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(apt.date)} · {apt.time}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(apt.status)}`}>
                      {apt.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/doctors")}
              className="bg-blue-500 text-white px-5 py-2 rounded-full text-sm hover:bg-blue-600 transition"
            >
              + Book Appointment
            </button>
            <button
              onClick={() => navigate("/my-appointments")}
              className="bg-white border border-gray-300 text-gray-700 px-5 py-2 rounded-full text-sm hover:bg-gray-50 transition"
            >
              View All Appointments
            </button>
            <button
              onClick={() => navigate("/patient/profile")}
              className="bg-white border border-gray-300 text-gray-700 px-5 py-2 rounded-full text-sm hover:bg-gray-50 transition"
            >
              My Profile
            </button>
            {outstanding > 0 && (
              <button
                onClick={() => setShowUnpaid(true)}
                className="bg-orange-500 text-white px-5 py-2 rounded-full text-sm hover:bg-orange-600 transition"
              >
                Pay Outstanding (Rs.{outstanding.toFixed(2)})
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Unpaid Appointments Modal */}
      {showUnpaid && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Outstanding Payments</h2>
                <p className="text-xs text-gray-500 mt-0.5">Total: Rs.{outstanding.toFixed(2)}</p>
              </div>
              <button
                onClick={() => setShowUnpaid(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>

            {unpaidAppointments.length === 0 ? (
              <p className="text-center text-gray-500 py-8 text-sm">No outstanding payments!</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {unpaidAppointments.map((appt, index) => (
                  <div
                    key={index}
                    className="border rounded-xl px-4 py-3 flex justify-between items-center hover:bg-gray-50"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">{appt.doctorName}</p>
                      <p className="text-xs text-gray-500">{formatDate(appt.date)} · {appt.time}</p>
                      <p className="text-xs font-semibold text-gray-800 mt-1">
                        Rs.{appt.totalAmount.toFixed(2)}
                      </p>
                      {appt.daysUntilDue > 0 ? (
                        <p className="text-xs text-orange-500 mt-0.5">
                          Due in {appt.daysUntilDue} day{appt.daysUntilDue !== 1 ? "s" : ""}
                        </p>
                      ) : (
                        <p className="text-xs text-red-500 mt-0.5">Overdue!</p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setShowUnpaid(false);
                        navigate(`/patient/payment/${appt.id}`, {
                          state: {
                            appointment: {
                              ...appt,
                              doctorName:      appt.doctorName,
                              consultationFee: appt.consultationFee,
                            }
                          }
                        });
                      }}
                      className="bg-green-500 text-white px-4 py-1.5 rounded-full text-xs hover:bg-green-600 transition whitespace-nowrap"
                    >
                      Pay Now
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowUnpaid(false)}
              className="w-full mt-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}