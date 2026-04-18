import React, { useState, useMemo } from "react";
//import Sidebar from "../components/SideBar(patient)";
//import Header from "../components/Header(patient)";

export default function ViewAppointmentHistory() {

  const [doctorFilter, setDoctorFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [appointments] = useState([
    {
      
      id: 1,
      doctorName: "Dr. Sandun Perera",
      date: "2026-02-15",
      time: "09:00 AM",
      notes: "Follow-up consultation successful.",
      status: "Completed"
    },
    {
      id: 2,
      doctorName: "Dr. Nimal Surendra",
      date: "2025-10-08",
      time: "11:00 AM",
      notes: "Flu diagnosed. Prescribed medication.",
      status: "Completed"
    },
    {
      id: 3,
      doctorName: "Dr. Nimal Jayaweera",
      date: "2025-11-30",
      time: "01:30 PM",
      notes: "General check-up.",
      status: "Completed"
    }
  ]);

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

  return (
    <div className="flex h-screen bg-[#F6FAFF]">

      {/*<Sidebar />*/}

      <div className="flex-1 flex flex-col p-6 md:p-10 overflow-y-auto">

        {/*<Header title="Appointment History" notificationsCount={0} />*/}

        <h1 className="text-2xl font-bold mb-6">Appointment History</h1>

        <div className="bg-white border rounded-2xl p-6">

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">

            <input
              type="text"
              placeholder="Search doctor..."
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="border px-3 py-2 rounded-lg text-sm"
            />

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border px-3 py-2 rounded-lg text-sm"
            />

            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border px-3 py-2 rounded-lg text-sm"
            />

            <button
              onClick={() => {
                setDoctorFilter("");
                setStartDate(""); 
                setEndDate("");
              }}
              className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm text-white font-semibold"
            >
              Reset
            </button>

          </div>

          {/* Table */}
          <div className="grid grid-cols-[2fr_1.5fr_1fr_2.5fr] bg-gray-300 px-4 py-3 rounded-lg text-sm font-bold">
            <p>Doctor</p>
            <p>Date</p>
            <p>Time</p>
            <p>Notes</p>
          </div>

          <div className="mt-2 space-y-2">
             {filteredAppointments.length === 0 ? (
              <p className="text-center text-gray-500 py-6">
                No appointments found 😐
              </p>
            ) : (
             filteredAppointments.map(a => (
              <div key={a.id} className="grid grid-cols-[2fr_1.5fr_1fr_2.5fr] border px-4 py-3 rounded-lg">
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

        </div>

      </div>
    </div>
  );
}