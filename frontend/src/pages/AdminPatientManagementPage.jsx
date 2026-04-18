import React, { useState, useMemo } from "react";
import {
  FaSearch,
  FaTrash,
  FaUserSlash,
  FaUserCheck,
  FaUsers,
  FaUser,
  FaUserTimes,
  FaUserAlt
} from "react-icons/fa";

export default function AdminPatientManagementPage() {

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [patients, setPatients] = useState([
    { id: 1, name: "Kasun Perera", email: "kasunperera@gmail.com", status: "Active", joined: "2025-08-12" },
    { id: 2, name: "Nimali Fernando", email: "nimalifernando@gmail.com", status: "Suspended", joined: "2025-06-20" },
    { id: 3, name: "Ravindu Silva", email: "ravindusilva@gmail.com", status: "Active", joined: "2026-01-05" },
    { id: 4, name: "Tharindu Jayasuriya", email: "tharindujayasuriya@gmail.com", status: "Active", joined: "2025-09-01" },
    { id: 5, name: "Dilini Perera", email: "diliniperera@gmail.com", status: "Active", joined: "2025-10-11" },
    { id: 6, name: "Sachin Wickram", email: "sachinwickram@gmail.com", status: "Suspended", joined: "2025-07-22" },
    { id: 7, name: "Isuru Bandara", email: "isurubandara@gmail.com", status: "Active", joined: "2025-03-18" },
    { id: 8, name: "Kavindi Silva", email: "kavindisilva@gmail.com", status: "Active", joined: "2025-05-09" },
    { id: 9, name: "Manoj Fernando", email: "manojfernando@gmail.com", status: "Suspended", joined: "2025-02-14" },
    { id: 10, name: "Yasara Kumari", email: "yasarakumari@gmail.com", status: "Active", joined: "2025-11-30" },
    { id: 11, name: "Praveen Dissanayake", email: "praveendissanayake@gmail.com", status: "Active", joined: "2025-01-25" },
    { id: 12, name: "Hansi Madushani", email: "hansimadushani@gmail.com", status: "Suspended", joined: "2025-04-19" },
    { id: 13, name: "Nuwan Chathuranga", email: "nuwanchathuranga@gmail.com", status: "Active", joined: "2025-06-02" },
    { id: 14, name: "Hiruni Fernando", email: "nimalifernando@gmail.com", status: "Suspended", joined: "2025-06-20" },
    { id: 15, name: "Satheesha Silva", email: "ravindusilva@gmail.com", status: "Active", joined: "2026-01-05" },
    { id: 16, name: "Viraj Jayasuriya", email: "tharindujayasuriya@gmail.com", status: "Active", joined: "2025-09-01" },
    { id: 17, name: "Dinithi Perera", email: "diliniperera@gmail.com", status: "Active", joined: "2025-10-11" }
  ]);

  const [logs, setLogs] = useState([]);

  // 🆕 deleted counter
  const [deletedCount, setDeletedCount] = useState(0);

  const filteredPatients = useMemo(() => {
    return patients.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [patients, search]);

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);

const paginatedPatients = useMemo(() => {
  const start = (currentPage - 1) * itemsPerPage;
  return filteredPatients.slice(start, start + itemsPerPage);
}, [filteredPatients, currentPage]);

  const handleSearch = () => setSearch(searchInput);

  const addLog = (action) => {
    const timestamp = new Date().toLocaleString();
    setLogs(prev => [{ action, timestamp }, ...prev]);
  };

  const toggleStatus = (id) => {
    setPatients(prev =>
      prev.map(p => {
        if (p.id === id) {
          const newStatus = p.status === "Active" ? "Suspended" : "Active";
          addLog(`${p.name} was ${newStatus}`);
          return { ...p, status: newStatus };
        }
        return p;
      })
    );
  };

  const deletePatient = (id) => {
    const patient = patients.find(p => p.id === id);

    if (window.confirm(`Delete ${patient.name}?`)) {
      setPatients(prev => prev.filter(p => p.id !== id));
      setDeletedCount(prev => prev + 1);
      addLog(`${patient.name} was removed`);
    }
  };

  // 📊 LIVE STATS
  const totalPatients = patients.length;
  const activePatients = patients.filter(p => p.status === "Active").length;
  const suspendedPatients = patients.filter(p => p.status === "Suspended").length;

  return (
    <div className="min-h-screen bg-[#c3cfe4] p-6 md:p-10">

      <h1 className="text-3xl font-bold mt-0 mb-10">Admin Patient Management</h1>

      {/* 📊 KPI CARDS (NEW) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">

        {/* Total */}
        <div className="relative bg-white rounded-xl shadow border p-5 overflow-hidden flex justify-between items-center">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-800"></div>
          <div>
            <p className="text-sm text-gray-500">Total patients</p>
            <p className="text-3xl font-bold">{totalPatients}</p>
          </div>
          <FaUsers className="text-3xl text-gray-700" />
        </div>

        {/* Active */}
        <div className="relative bg-white rounded-xl shadow border p-5 overflow-hidden flex justify-between items-center">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
          <div>
            <p className="text-sm text-gray-500">Active patients</p>
            <p className="text-3xl font-bold text-green-600">{activePatients}</p>
          </div>
          <FaUserCheck className="text-3xl text-green-600" />
        </div>

        {/* Suspended */}
        <div className="relative bg-white rounded-xl shadow border p-5 overflow-hidden flex justify-between items-center">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500"></div>
          <div>
            <p className="text-sm text-gray-500">Suspended</p>
            <p className="text-3xl font-bold text-yellow-600">{suspendedPatients}</p>
          </div>
          <FaUserSlash className="text-3xl text-yellow-600" />
        </div>

        {/* Deleted */}
        <div className="relative bg-white rounded-xl shadow border p-5 overflow-hidden flex justify-between items-center">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
          <div>
            <p className="text-sm text-gray-500">Deleted</p>
            <p className="text-3xl font-bold text-red-600">{deletedCount}</p>
          </div>
          <FaUserTimes className="text-3xl text-red-600" />
        </div>

      </div>

      <div className="grid md:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-md border">

          {/* Search */}
          <div className="flex gap-3 mb-5">

            <input
              type="text"
              placeholder="Search Patient by name or email ..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 border px-4 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
            />

            <button
              onClick={handleSearch}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold"
            >
              <FaSearch />
              Search
            </button>

            <button
              onClick={() => {
                setSearch("");
                setSearchInput("");
              }}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg text-sm font-semibold"
            >
              Reset
            </button>

          </div>

          {/* Table Header */}
          <div className="grid grid-cols-[2fr_2fr_1fr_1fr_2fr] bg-[#c3cfe4] px-4 py-3 rounded-lg text-base font-bold border">
            <p>Name</p>
            <p>Email</p>
            <p>Status</p>
            <p>Joined</p>
            <p className="text-center">Actions</p>
          </div>

          {/* Rows */}
          <div className="mt-2 space-y-2">

            {paginatedPatients.map(p => (
              <div
                key={p.id}
                className="grid grid-cols-[2fr_2fr_1fr_1fr_2fr] items-center border px-4 py-3 rounded-lg hover:bg-gray-50 transition"
              >
                <p>{p.name}</p>
                <p className="text-sm text-gray-600">{p.email}</p>

                <p className={`text-sm font-semibold px-2 py-1 rounded-lg w-fit ${
                  p.status === "Active"
                    ? "bg-green-100 text-green-600"
                    : "bg-yellow-100 text-yellow-600"
                }`}>
                  {p.status}
                </p>

                <p className="text-sm">
                  {new Date(p.joined).toLocaleDateString()}
                </p>

                <div className="flex justify-center gap-2">

                  <button
                    onClick={() => toggleStatus(p.id)}
                    className={`flex items-center gap-1 px-3.5 py-1.5 text-sm rounded-lg font-semibold text-white ${
                      p.status === "Active"
                        ? "bg-yellow-500 hover:bg-yellow-400"
                        : "bg-green-600 hover:bg-green-500"
                    }`}
                  >
                    {p.status === "Active" ? <FaUserSlash /> : <FaUserCheck />}
                    {p.status === "Active" ? "Suspend" : "Activate"}
                  </button>

                  <button
                    onClick={() => deletePatient(p.id)}
                    className="flex items-center gap-1 px-3 py-1 text-xs rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold"
                  >
                    <FaTrash />
                    Delete
                  </button>

                </div>

              </div>
            ))}

          </div>

          {/* 📄 PAGINATION */}
<div className="flex justify-center items-center mt-6 gap-2">

  {/* Prev */}
  <button
    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
    className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm"
  >
    Prev
  </button>

  {/* Page Numbers */}
  {[...Array(totalPages)].map((_, index) => {
    const page = index + 1;

    // show only nearby pages (clean UI)
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

    // dots
    if (
      page === currentPage - 2 ||
      page === currentPage + 2
    ) {
      return <span key={page} className="px-2">...</span>;
    }

    return null;
  })}

  {/* Next */}
  <button
    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
    className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm"
  >
    Next
  </button>

</div>
        </div>

        {/* RIGHT - LOGS */}
        <div className="bg-white rounded-2xl p-6 shadow-md border">

          <h2 className="text-lg font-semibold mb-4">Activity Log</h2>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">

            {logs.length === 0 ? (
              <p className="text-sm text-gray-500">No actions yet</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-3">
                  <p className="text-sm">{log.action}</p>
                  <p className="text-xs text-gray-400">{log.timestamp}</p>
                </div>
              ))
            )}

          </div>

        </div>

      </div>
    </div>
  );
}