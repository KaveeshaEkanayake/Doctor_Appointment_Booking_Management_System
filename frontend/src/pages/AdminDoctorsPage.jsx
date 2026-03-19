import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../layouts/AdminLayout";
import { FiCheckCircle, FiXCircle, FiRefreshCw, FiUsers } from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const API = import.meta.env.VITE_API_URL;

const TAB_STATUS = {
  "Pending":        "PENDING",
  "Approved":       "APPROVED",
  "Recently Denied":"REJECTED",
};

export default function AdminDoctorsPage() {
  const [activeTab, setActiveTab] = useState("Pending");
  const [doctors,   setDoctors]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [updating,  setUpdating]  = useState(null);
  const [toasts,    setToasts]    = useState([]);

  const token = localStorage.getItem("token");

  const addToast = (message, type) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  const fetchDoctors = async (tab = activeTab) => {
    setLoading(true);
    setError("");
    try {
      const status = TAB_STATUS[tab];
      const { data } = await axios.get(`${API}/api/admin/doctors?status=${status}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDoctors(data.doctors);
    } catch {
      setError("Failed to load doctors. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDoctors(activeTab); }, [activeTab]);

  const handleAction = async (doctor, newStatus) => {
    setUpdating(doctor.id);
    try {
      await axios.patch(
        `${API}/api/admin/doctors/${doctor.id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDoctors((prev) => prev.filter((d) => d.id !== doctor.id));

      if (newStatus === "APPROVED") {
        addToast(`Dr. ${doctor.firstName} ${doctor.lastName} has been approved.`, "success");
      } else {
        addToast(`Application for Dr. ${doctor.firstName} ${doctor.lastName} was declined.`, "error");
      }
    } catch {
      addToast("Failed to update status. Please try again.", "error");
    } finally {
      setUpdating(null);
    }
  };

  const isPendingTab = activeTab === "Pending";

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-gray-500 text-sm mb-1">Hi, Admin User</p>
            <h1 className="text-2xl font-bold text-gray-800">
              Doctor Approval Management
            </h1>
          </div>
          <button
            onClick={() => fetchDoctors(activeTab)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <FiRefreshCw className={`text-sm ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Tabs + stat cards row */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {/* Tab strip */}
          <div className="flex items-center gap-1">
            {Object.keys(TAB_STATUS).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                  activeTab === tab
                    ? "bg-red-500 text-white"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {/* Table card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
              <AiOutlineLoading3Quarters className="animate-spin text-xl" />
              <span className="text-sm">Loading...</span>
            </div>
          ) : doctors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <FiUsers className="text-4xl mb-2" />
              <p className="text-sm">No {activeTab.toLowerCase()} doctors found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Doctor Information
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Specialization
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Experience
                    </th>
                    {isPendingTab && (
                      <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {doctors.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">

                      {/* Doctor info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {doc.profilePhoto ? (
                            <img
                              src={doc.profilePhoto}
                              alt={doc.firstName}
                              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center flex-shrink-0">
                              {doc.firstName[0]}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-800">
                              Dr. {doc.firstName} {doc.lastName}
                            </p>
                            <p className="text-xs text-gray-400">{doc.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Specialization — coloured like screenshot */}
                      <td className="px-6 py-4">
                        <span className="text-blue-500 text-xs font-semibold uppercase tracking-wide">
                          {doc.specialisation}
                        </span>
                      </td>

                      {/* Experience */}
                      <td className="px-6 py-4 text-gray-600">
                        {doc.experience ?? "—"}
                      </td>

                      {/* Actions — only on Pending tab */}
                      {isPendingTab && (
                        <td className="px-6 py-4">
                          {updating === doc.id ? (
                            <AiOutlineLoading3Quarters className="animate-spin text-gray-400" />
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleAction(doc, "APPROVED")}
                                className="flex items-center gap-1.5 px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition"
                              >
                                <FiCheckCircle className="text-sm" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleAction(doc, "REJECTED")}
                                className="flex items-center gap-1.5 px-4 py-1.5 bg-white hover:bg-red-50 text-red-500 text-xs font-semibold rounded-lg border border-red-200 transition"
                              >
                                <FiXCircle className="text-sm" />
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Footer */}
              <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-400">
                Showing {doctors.length} {activeTab.toLowerCase()} registration{doctors.length !== 1 ? "s" : ""}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast notifications — bottom right, matches screenshot */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm max-w-xs animate-fadeIn ${
              toast.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {toast.type === "success"
              ? <FiCheckCircle className="text-lg flex-shrink-0 mt-0.5" />
              : <FiXCircle    className="text-lg flex-shrink-0 mt-0.5" />
            }
            <div>
              <p className="font-semibold">
                {toast.type === "success" ? "Success!" : "Registration Rejected"}
              </p>
              <p className="text-white/80 text-xs">{toast.message}</p>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="ml-auto text-white/70 hover:text-white"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}