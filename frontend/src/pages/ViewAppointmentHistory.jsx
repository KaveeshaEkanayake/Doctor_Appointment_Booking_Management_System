import React, { useState, useMemo } from "react";
// import Sidebar from "../components/Sidebar(patient)";
// import Header from "../components/Header(patient)";

export default function ViewAppointmentHistory() {

  const [doctorFilter, setDoctorFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // 🔽 PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 🔽 MOCK DATA (MORE DATA FOR PAGINATION)
  const [appointments] = useState([
    { id: 1, doctorName: "Dr. Sandun Perera", date: "2026-02-15", time: "09:00 AM", notes: "Follow-up consultation successful.", status: "Completed" },
    { id: 2, doctorName: "Dr. Nimal Surendra", date: "2025-10-08", time: "11:00 AM", notes: "Flu diagnosed.", status: "Completed" },
    { id: 3, doctorName: "Dr. Nimal Jayaweera", date: "2025-11-30", time: "01:30 PM", notes: "General check-up.", status: "Completed" },
    { id: 4, doctorName: "Dr. Amal Silva", date: "2025-09-21", time: "02:00 PM", notes: "Blood pressure normal.", status: "Completed" },
    { id: 5, doctorName: "Dr. Kavindi Fernando", date: "2025-08-14", time: "10:30 AM", notes: "Routine check.", status: "Completed" },
    { id: 6, doctorName: "Dr. Ravi Perera", date: "2025-07-10", time: "03:00 PM", notes: "Minor infection treated.", status: "Completed" },
    { id: 7, doctorName: "Dr. Saman Kumara", date: "2025-06-05", time: "12:00 PM", notes: "Consultation done.", status: "Completed" },
    { id: 8, doctorName: "Dr. Ishara Silva", date: "2025-05-18", time: "09:45 AM", notes: "Prescription updated.", status: "Completed" },
    { id: 9, doctorName: "Dr. Tharindu Jay", date: "2025-04-12", time: "11:15 AM", notes: "Follow-up needed.", status: "Completed" },
    { id: 10, doctorName: "Dr. Nadeesha Perera", date: "2025-03-01", time: "01:00 PM", notes: "Routine visit.", status: "Completed" }
  ]);

  // 🔽 FILTER + SORT
  const filteredAppointments = useMemo(() => {
    let data = appointments.filter(a => a.status === "Completed");

    if (doctorFilter) {
      data = data.filter(a =>
        a.doctorName.toLowerCase().includes(doctorFilter.toLowerCase())
      );
    }

    if (startDate) {
      data = data.filter(a => new Date(a.date) >= new Date(startDate));
    }

    if (endDate) {
      data = data.filter(a => new Date(a.date) <= new Date(endDate));
    }

    return data.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [appointments, doctorFilter, startDate, endDate]);

  // 🔽 PAGINATION LOGIC
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

  const paginatedAppointments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAppointments.slice(start, start + itemsPerPage);
  }, [filteredAppointments, currentPage]);

  return (
    <div className="flex h-screen bg-[#c3cfe4]">

      {/* <Sidebar /> */}

      <div className="flex-1 flex flex-col p-6 md:p-10 overflow-y-auto">

        {/* <Header title="Appointment History" notificationsCount={0} /> */}

        <h1 className="text-3xl font-bold mb-10">Appointment History</h1>

        <div className="bg-white border rounded-2xl p-6">

          {/* 🔽 FILTERS */}
          <div className="flex flex-wrap gap-4 mb-6">

            <input
              type="text"
              placeholder="Search doctor..."
              value={doctorFilter}
              onChange={(e) => {
                setDoctorFilter(e.target.value);
                setCurrentPage(1); // reset page
              }}
              className="border px-3 py-2 rounded-lg text-sm"
            />

            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="border px-3 py-2 rounded-lg text-sm"
            />

            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="border px-3 py-2 rounded-lg text-sm"
            />

            <button
              onClick={() => {
                setDoctorFilter("");
                setStartDate("");
                setEndDate("");
                setCurrentPage(1);
              }}
              className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm text-white font-semibold"
            >
              Reset
            </button>

          </div>

          {/* 🔽 TABLE HEADER */}
          <div className="grid grid-cols-[2fr_1.5fr_1fr_2.5fr] bg-[#c3cfe4] px-4 py-3 rounded-lg text-base font-bold">
            <p>Doctor</p>
            <p>Date</p>
            <p>Time</p>
            <p>Notes</p>
          </div>

          {/* 🔽 TABLE BODY */}
          <div className="mt-2 space-y-2">

            {paginatedAppointments.length === 0 ? (
              <p className="text-center text-gray-500 py-6">
                No appointments found
              </p>
            ) : (
              paginatedAppointments.map(a => (
                <div
                  key={a.id}
                  className="grid grid-cols-[2fr_1.5fr_1fr_2.5fr] border px-4 py-3 rounded-lg"
                >
                  <p>{a.doctorName}</p>
                  <p>{new Date(a.date).toLocaleDateString()}</p>
                  <p>{a.time}</p>
                  <p className="whitespace-normal break-words">
                    {a.notes || "No notes available"}
                  </p>
                </div>
              ))
            )}

          </div>

          {/* 🔽 PAGINATION */}
          <div className="flex justify-center items-center mt-6 gap-2">

            {/* Prev */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm"
            >
              Prev
            </button>

            {/* Pages */}
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;

              if (
                page === 1 ||
                page === totalPages ||
                Math.abs(currentPage - page) <= 1
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {page}
                  </button>
                );
              }

              if (
                page === currentPage - 2 ||
                page === currentPage + 2
              ) {
                return <span key={page}>...</span>;
              }

              return null;
            })}

            {/* Next */}
            <button
              onClick={() =>
                setCurrentPage(prev => Math.min(prev + 1, totalPages))
              }
              className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm"
            >
              Next
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}