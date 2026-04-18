import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import AdminLayout from "../layouts/AdminLayout";
import {
  FaSearch, FaTrash, FaUserSlash, FaUserCheck,
  FaUsers, FaUserTimes
} from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const API = import.meta.env.VITE_API_URL;

export default function AdminPatientManagementPage() {

  const [patients,      setPatients]      = useState([]);
  const [logs,          setLogs]          = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [logsLoading,   setLogsLoading]   = useState(true);
  const [searchInput,   setSearchInput]   = useState("");
  const [search,        setSearch]        = useState("");
  const [currentPage,   setCurrentPage]   = useState(1);
  const [toast,         setToast]         = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const itemsPerPage = 5;

  const token = localStorage.getItem("token");

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/admin/patients`, {
        headers: { Authorization: `Bearer ${token}` },
        params:  { search },
      });
      setPatients(res.data.patients || []);
    } catch {
      showToast("Failed to load patients", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await axios.get(`${API}/api/admin/patients/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(res.data.logs || []);
    } catch {
      setLogs([]);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchLogs();
  }, []);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchPatients();
  };

  const handleReset = () => {
    setSearch("");
    setSearchInput("");
    setCurrentPage(1);
    fetchPatients();
  };

  const toggleStatus = async (patient) => {
    setActionLoading(patient.id);
    try {
      const res = await axios.patch(
        `${API}/api/admin/patients/${patient.id}/suspend`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast(res.data.message);
      await fetchPatients();
      await fetchLogs();
    } catch (err) {
      showToast(err.response?.data?.message || "Action failed", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (patient) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${patient.name}?`)) return;
    setActionLoading(patient.id);
    try {
      await axios.delete(
        `${API}/api/admin/patients/${patient.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast(`${patient.name} has been deleted`);
      await fetchPatients();
      await fetchLogs();
    } catch (err) {
      showToast(err.response?.data?.message || "Delete failed", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredPatients = useMemo(() => {
    return patients.filter((p) =>
      p.name.toLowerCase().includes(searchInput.toLowerCase()) ||
      p.email.toLowerCase().includes(searchInput.toLowerCase())
    );
  }, [patients, searchInput]);

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);

  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPatients.slice(start, start + itemsPerPage);
  }, [filteredPatients, currentPage]);

  const totalPatients     = patients.length;
  const activePatients    = patients.filter((p) => p.status === "ACTIVE").length;
  const suspendedPatients = patients.filter((p) => p.status === "SUSPENDED").length;

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm text-gray-500">Hi, Admin</p>
          <h1 className="text-2xl font-bold text-gray-800">Patient Management</h1>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div className="relative bg-white rounded-xl shadow border p-5 flex justify-between items-center overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-800" />
            <div>
              <p className="text-sm text-gray-500">Total Patients</p>
              <p className="text-3xl font-bold">{totalPatients}</p>
            </div>
            <FaUsers className="text-3xl text-gray-700" />
          </div>

          <div className="relative bg-white rounded-xl shadow border p-5 flex justify-between items-center overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500" />
            <div>
              <p className="text-sm text-gray-500">Active Patients</p>
              <p className="text-3xl font-bold text-green-600">{activePatients}</p>
            </div>
            <FaUserCheck className="text-3xl text-green-600" />
          </div>

          <div className="relative bg-white rounded-xl shadow border p-5 flex justify-between items-center overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500" />
            <div>
              <p className="text-sm text-gray-500">Suspended</p>
              <p className="text-3xl font-bold text-yellow-600">{suspendedPatients}</p>
            </div>
            <FaUserSlash className="text-3xl text-yellow-600" />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">

          {/* Patient List */}
          <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-md border">

            {/* Search */}
            <div className="flex gap-3 mb-5">
              <input
                type="text"
                placeholder="Search patient by name or email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1 border px-4 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
              />
              <button
                onClick={handleSearch}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
              >
                <FaSearch /> Search
              </button>
              <button
                onClick={handleReset}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg text-sm font-semibold transition"
              >
                Reset
              </button>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-[2fr_2fr_1fr_1fr_2fr] bg-gray-100 px-4 py-2.5 rounded-lg text-xs font-semibold text-gray-600 gap-x-4">
              <p>Name</p>
              <p>Email</p>
              <p>Status</p>
              <p>Joined</p>
              <p className="text-center">Actions</p>
            </div>

            {/* Rows */}
            <div className="mt-2 space-y-2 min-h-[200px]">
              {loading ? (
                <div className="flex justify-center py-12">
                  <AiOutlineLoading3Quarters className="animate-spin text-2xl text-blue-500" />
                </div>
              ) : paginatedPatients.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <FaUsers className="text-4xl mx-auto mb-3" />
                  <p className="text-sm">No patients found</p>
                </div>
              ) : (
                paginatedPatients.map((p) => (
                  <div
                    key={p.id}
                    className="grid grid-cols-[2fr_2fr_1fr_1fr_2fr] items-center border px-4 py-3 rounded-lg hover:bg-gray-50 transition"
                  >
                    <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                    <p className="text-xs text-gray-500 truncate">{p.email}</p>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-lg w-fit ${
                      p.status === "ACTIVE"
                        ? "bg-green-100 text-green-600"
                        : "bg-yellow-100 text-yellow-600"
                    }`}>
                      {p.status}
                    </span>
                    <p className="text-xs text-gray-500">
                      {new Date(p.joined).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric"
                      })}
                    </p>
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => toggleStatus(p)}
                        disabled={actionLoading === p.id}
                        className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg font-semibold text-white transition disabled:opacity-50 ${
                          p.status === "ACTIVE"
                            ? "bg-yellow-500 hover:bg-yellow-600"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        {actionLoading === p.id ? (
                          <AiOutlineLoading3Quarters className="animate-spin" />
                        ) : p.status === "ACTIVE" ? (
                          <><FaUserSlash /> Suspend</>
                        ) : (
                          <><FaUserCheck /> Activate</>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        disabled={actionLoading === p.id}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition disabled:opacity-50"
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
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

          {/* Activity Log */}
          <div className="bg-white rounded-2xl p-6 shadow-md border">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Activity Log</h2>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {logsLoading ? (
                <div className="flex justify-center py-8">
                  <AiOutlineLoading3Quarters className="animate-spin text-blue-500" />
                </div>
              ) : logs.length === 0 ? (
                <p className="text-sm text-gray-400">No actions yet</p>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="border-l-4 border-blue-500 pl-3">
                    <p className="text-sm text-gray-700">{log.action}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(log.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium z-50 ${
          toast.type === "error" ? "bg-red-500" : "bg-green-500"
        }`}>
          {toast.message}
        </div>
      )}

    </AdminLayout>
  );
}