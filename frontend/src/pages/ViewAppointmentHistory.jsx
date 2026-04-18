import React, { useState, useMemo, useEffect } from "react";
import axios                                    from "axios";
import Sidebar                                  from "../components/SideBar(patient)";
import Header                                   from "../components/Header(patient)";
import { AiOutlineLoading3Quarters }            from "react-icons/ai";
import { FiCalendar, FiX }                      from "react-icons/fi";
import { FaUserMd, FaCreditCard, FaNotesMedical, FaClock } from "react-icons/fa";

const API = import.meta.env.VITE_API_URL;

export default function ViewAppointmentHistory() {
  const [appointments,   setAppointments]   = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState("");
  const [isSidebarOpen,  setIsSidebarOpen]  = useState(false);
  const [doctorFilter,   setDoctorFilter]   = useState("");
  const [startDate,      setStartDate]      = useState("");
  const [endDate,        setEndDate]        = useState("");
  const [currentPage,    setCurrentPage]    = useState(1);
  const [selectedAppt,   setSelectedAppt]   = useState(null);
  const [payment,        setPayment]        = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const itemsPerPage = 5;

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get(`${API}/api/appointments/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const all = Array.isArray(res.data.appointments) ? res.data.appointments : [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const past = all.filter((appt) => {
          const apptDate = new Date(appt.date);
          apptDate.setHours(0, 0, 0, 0);
          return (
            apptDate < today ||
            appt.status === "Cancelled" ||
            appt.status === "Completed" ||
            appt.status === "Missed"
          );
        });

        setAppointments(past);
      } catch (err) {
        console.error(err);
        setError("Failed to load appointment history.");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const fetchPayment = async (appointmentId) => {
    setPaymentLoading(true);
    setPayment(null);
    try {
      const res = await axios.get(
        `${API}/api/payments/appointment/${appointmentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) setPayment(res.data.payment);
    } catch {
      setPayment(null);
    } finally {
      setPaymentLoading(false);
    }
  };

  const openDetail = (appt) => {
    setSelectedAppt(appt);
    fetchPayment(appt.id);
  };

  const closeDetail = () => {
    setSelectedAppt(null);
    setPayment(null);
  };

  const filteredAppointments = useMemo(() => {
    let data = [...appointments];
    if (doctorFilter) {
      data = data.filter((a) =>
        a.doctorName.toLowerCase().includes(doctorFilter.toLowerCase())
      );
    }
    if (startDate) data = data.filter((a) => new Date(a.date) >= new Date(startDate));
    if (endDate)   data = data.filter((a) => new Date(a.date) <= new Date(endDate));
    return data.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [appointments, doctorFilter, startDate, endDate]);

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

  const paginatedAppointments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAppointments.slice(start, start + itemsPerPage);
  }, [filteredAppointments, currentPage]);

  const getStatusStyle = (status) => {
    if (status === "Completed") return "bg-blue-100 text-blue-700";
    if (status === "Cancelled") return "bg-red-100 text-red-700";
    if (status === "Missed")    return "bg-red-200 text-red-800";
    if (status === "Paid")      return "bg-green-100 text-green-700";
    return "bg-gray-100 text-gray-600";
  };

  const getTimeline = (status) => {
    const steps = [
      { label: "Booked",    done: true },
      { label: "Confirmed", done: ["Confirmed", "Completed", "Paid", "Missed"].includes(status) },
      { label: "Completed", done: ["Completed", "Paid"].includes(status) },
    ];
    return steps;
  };

  return (
    <div className="flex h-screen bg-[#F6FAFF]">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black opacity-30 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}
      <div className={`fixed md:static top-0 left-0 h-full transform transition-transform duration-300 z-50
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col p-6 md:p-10 overflow-y-auto">
        <Header title="Appointment History" setIsSidebarOpen={setIsSidebarOpen} notificationsCount={0} />

        <div className="bg-white border rounded-2xl p-6 mt-4">

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <input
              type="text"
              placeholder="Search by doctor name..."
              value={doctorFilter}
              onChange={(e) => { setDoctorFilter(e.target.value); setCurrentPage(1); }}
              className="border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-48"
            />
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">From</label>
              <input
                type="date" value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                className="border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">To</label>
              <input
                type="date" value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                className="border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <button
              onClick={() => { setDoctorFilter(""); setStartDate(""); setEndDate(""); setCurrentPage(1); }}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm text-white font-medium transition"
            >
              Reset
            </button>
          </div>

          <p className="text-xs text-gray-400 mb-3">
            Showing <span className="text-blue-600 font-semibold">{filteredAppointments.length}</span> records
            <span className="ml-2 text-gray-300">· Click any row to view full details</span>
          </p>

          {/* Table Header */}
          <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr] bg-gray-100 px-4 py-2.5 rounded-lg text-xs font-semibold text-gray-600 gap-x-4">
            <p>Doctor</p>
            <p>Date</p>
            <p>Time</p>
            <p>Status</p>
          </div>

          {/* Table Body */}
          <div className="mt-2 space-y-2">
            {loading ? (
              <div className="flex justify-center py-12">
                <AiOutlineLoading3Quarters className="animate-spin text-2xl text-blue-500" />
              </div>
            ) : error ? (
              <p className="text-center text-red-500 py-6 text-sm">{error}</p>
            ) : paginatedAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <FiCalendar className="text-4xl mb-3" />
                <p className="text-sm">No appointment history found</p>
                {(doctorFilter || startDate || endDate) && (
                  <button
                    onClick={() => { setDoctorFilter(""); setStartDate(""); setEndDate(""); }}
                    className="mt-2 text-blue-500 text-xs hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              paginatedAppointments.map((appt) => (
                <div
                  key={appt.id}
                  onClick={() => openDetail(appt)}
                  className="grid grid-cols-[2fr_1.5fr_1fr_1fr] border rounded-lg px-4 py-3 gap-x-4 hover:bg-blue-50 hover:border-blue-200 transition items-center cursor-pointer"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{appt.doctorName}</p>
                    <p className="text-xs text-gray-400">{appt.specialisation}</p>
                  </div>
                  <p className="text-sm text-gray-600">
                    {new Date(appt.date).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric"
                    })}
                  </p>
                  <p className="text-sm text-gray-600">{appt.time}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium w-fit ${getStatusStyle(appt.status)}`}>
                    {appt.status}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-6 gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm disabled:opacity-40 transition"
              >
                Prev
              </button>
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                if (page === 1 || page === totalPages || Math.abs(currentPage - page) <= 1) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
                        currentPage === page ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      {page}
                    </button>
                  );
                }
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="text-gray-400">...</span>;
                }
                return null;
              })}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm disabled:opacity-40 transition"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedAppt && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-base font-semibold text-gray-800">Appointment Details</h2>
              <button onClick={closeDetail} className="text-gray-400 hover:text-gray-600">
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">

              {/* Doctor Info */}
              <div className="flex items-center gap-4 bg-blue-50 rounded-xl p-4">
                {selectedAppt.profilePhoto ? (
                  <img
                    src={selectedAppt.profilePhoto}
                    alt="doctor"
                    className="w-14 h-14 rounded-full object-cover border"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-blue-200 flex items-center justify-center text-blue-600 font-bold text-xl">
                    {selectedAppt.doctorName?.charAt(4) || "D"}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-800">{selectedAppt.doctorName}</p>
                  <p className="text-xs text-gray-500">{selectedAppt.specialisation}</p>
                  <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(selectedAppt.status)}`}>
                    {selectedAppt.status}
                  </span>
                </div>
              </div>

              {/* Appointment Info */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-3 flex items-center gap-1">
                  <FaClock className="text-gray-400" /> Appointment Details
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Date</span>
                    <span className="font-medium text-gray-800">
                      {new Date(selectedAppt.date).toLocaleDateString("en-US", {
                        weekday: "long", month: "long", day: "numeric", year: "numeric"
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Time</span>
                    <span className="font-medium text-gray-800">{selectedAppt.time}</span>
                  </div>
                  {selectedAppt.reason && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Reason</span>
                      <span className="font-medium text-gray-800 text-right max-w-[60%]">{selectedAppt.reason}</span>
                    </div>
                  )}
                  {selectedAppt.rejectionReason && (
                    <div className="bg-red-50 rounded-lg p-3 mt-2">
                      <p className="text-xs font-semibold text-red-600 mb-1">Note from Doctor</p>
                      <p className="text-xs text-red-500">{selectedAppt.rejectionReason}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">
                  Appointment Timeline
                </p>
                <div className="flex items-center gap-2">
                  {getTimeline(selectedAppt.status).map((step, i) => (
                    <React.Fragment key={i}>
                      <div className="flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          step.done ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"
                        }`}>
                          {step.done ? "✓" : i + 1}
                        </div>
                        <p className={`text-[10px] mt-1 ${step.done ? "text-blue-600 font-medium" : "text-gray-400"}`}>
                          {step.label}
                        </p>
                      </div>
                      {i < 2 && (
                        <div className={`flex-1 h-0.5 mb-3 ${step.done ? "bg-blue-300" : "bg-gray-200"}`} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Doctor Notes */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
                  <FaNotesMedical className="text-gray-400" /> Doctor's Notes
                </p>
                {selectedAppt.notes ? (
                  <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 leading-relaxed">
                    {selectedAppt.notes}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No notes added for this appointment</p>
                )}
              </div>

              {/* Payment Details */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
                  <FaCreditCard className="text-gray-400" /> Payment Details
                </p>
                {paymentLoading ? (
                  <div className="flex justify-center py-3">
                    <AiOutlineLoading3Quarters className="animate-spin text-blue-500" />
                  </div>
                ) : payment ? (
                  <div className="bg-green-50 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Amount Paid</span>
                      <span className="font-semibold text-green-600">Rs.{(payment.amount + 500).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Payment Method</span>
                      <span className="font-medium text-gray-800">VISA **** {payment.cardLast4}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Paid On</span>
                      <span className="font-medium text-gray-800">
                        {new Date(payment.paidAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric"
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Invoice</span>
                      <span className="font-medium text-blue-600">
                        INV-{String(payment.id).padStart(6, "0")}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-orange-50 rounded-xl p-4">
                    <p className="text-xs text-orange-600 font-medium">Payment not made for this appointment</p>
                  </div>
                )}
              </div>

            </div>

            <div className="px-6 pb-5">
              <button
                onClick={closeDetail}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}