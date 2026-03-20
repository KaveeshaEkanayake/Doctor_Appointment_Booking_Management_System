import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import AdminLayout from "../layouts/AdminLayout";
import { FiCheckCircle, FiXCircle, FiRefreshCw, FiUsers, FiEye } from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const API = import.meta.env.VITE_API_URL;

const ACCOUNT_TABS = {
  "Pending":        "PENDING",
  "Approved":       "APPROVED",
  "Recently Denied":"REJECTED",
};

const PROFILE_TABS = {
  "Pending Review": "PENDING_REVIEW",
  "Approved":       "APPROVED",
  "Rejected":       "REJECTED",
};

// Profile detail modal
function ProfileModal({ doctor, onClose, onApprove, onReject, updating }) {
  if (!doctor) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-y-auto max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Profile Review</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div className="p-6 space-y-4">
          {/* Doctor info */}
          <div className="flex items-center gap-4">
            {doctor.profilePhoto ? (
              <img src={doctor.profilePhoto} alt={doctor.firstName} className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-xl">
                {doctor.firstName[0]}
              </div>
            )}
            <div>
              <p className="font-bold text-gray-800 text-lg">Dr. {doctor.firstName} {doctor.lastName}</p>
              <p className="text-sm text-gray-400">{doctor.email}</p>
              <span className="text-xs font-semibold text-blue-500 uppercase">{doctor.specialisation}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">Experience</p>
              <p className="text-gray-700">{doctor.experience ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">Consultation Fee</p>
              <p className="text-gray-700">
                {doctor.consultationFee ? `Rs ${doctor.consultationFee}` : "—"}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-400 font-medium mb-1">Qualifications</p>
            <p className="text-sm text-gray-700">{doctor.qualifications ?? "—"}</p>
          </div>

          <div>
            <p className="text-xs text-gray-400 font-medium mb-1">Bio</p>
            <p className="text-sm text-gray-700 leading-relaxed">{doctor.bio ?? "—"}</p>
          </div>
        </div>

        {/* Actions */}
        {doctor.profileStatus === "PENDING_REVIEW" && (
          <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
            {updating ? (
              <AiOutlineLoading3Quarters className="animate-spin text-gray-400 text-xl" />
            ) : (
              <>
                <button
                  onClick={() => onReject(doctor)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-red-50 text-red-500 text-sm font-semibold rounded-lg border border-red-200 transition"
                >
                  <FiXCircle /> Reject
                </button>
                <button
                  onClick={() => onApprove(doctor)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition"
                >
                  <FiCheckCircle /> Approve
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDoctorsPage() {
  const [searchParams]   = useSearchParams();
  const initialTab       = Object.keys(ACCOUNT_TABS).find(
    (k) => ACCOUNT_TABS[k] === searchParams.get("status")
  ) || "Pending";

  // Account approval section
  const [activeTab,   setActiveTab]   = useState(initialTab);
  const [doctors,     setDoctors]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [updating,    setUpdating]    = useState(null);

  // Profile review section
  const [profileTab,      setProfileTab]      = useState("Pending Review");
  const [profileDoctors,  setProfileDoctors]  = useState([]);
  const [profileLoading,  setProfileLoading]  = useState(true);
  const [profileError,    setProfileError]    = useState("");
  const [selectedDoctor,  setSelectedDoctor]  = useState(null);
  const [profileUpdating, setProfileUpdating] = useState(false);

  const [toasts, setToasts] = useState([]);
  const token = localStorage.getItem("token");

  const addToast = (message, type) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  // Fetch account doctors
  const fetchDoctors = async (tab = activeTab) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(
        `${API}/api/admin/doctors?status=${ACCOUNT_TABS[tab]}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDoctors(data.doctors);
    } catch {
      setError("Failed to load doctors.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch profile doctors
  const fetchProfileDoctors = async (tab = profileTab) => {
    setProfileLoading(true);
    setProfileError("");
    try {
      const { data } = await axios.get(
        `${API}/api/admin/profiles?profileStatus=${PROFILE_TABS[tab]}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfileDoctors(data.doctors);
    } catch {
      setProfileError("Failed to load profiles.");
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => { fetchDoctors(activeTab);       }, [activeTab]);
  useEffect(() => { fetchProfileDoctors(profileTab); }, [profileTab]);

  // Account approve/reject
  const handleAccountAction = async (doctor, newStatus) => {
    setUpdating(doctor.id);
    try {
      await axios.patch(
        `${API}/api/admin/doctors/${doctor.id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDoctors((prev) => prev.filter((d) => d.id !== doctor.id));
      addToast(
        newStatus === "APPROVED"
          ? `Dr. ${doctor.firstName} ${doctor.lastName} account approved.`
          : `Dr. ${doctor.firstName} ${doctor.lastName} account rejected.`,
        newStatus === "APPROVED" ? "success" : "error"
      );
    } catch {
      addToast("Failed to update status.", "error");
    } finally {
      setUpdating(null);
    }
  };

  // Profile approve/reject
  const handleProfileAction = async (doctor, newProfileStatus) => {
    setProfileUpdating(true);
    try {
      await axios.patch(
        `${API}/api/admin/doctors/${doctor.id}/profileStatus`,
        { profileStatus: newProfileStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfileDoctors((prev) => prev.filter((d) => d.id !== doctor.id));
      setSelectedDoctor(null);
      addToast(
        newProfileStatus === "APPROVED"
          ? `Dr. ${doctor.firstName} ${doctor.lastName}'s profile is now live.`
          : `Dr. ${doctor.firstName} ${doctor.lastName}'s profile was rejected.`,
        newProfileStatus === "APPROVED" ? "success" : "error"
      );
    } catch {
      addToast("Failed to update profile status.", "error");
    } finally {
      setProfileUpdating(false);
    }
  };

  const isPendingTab        = activeTab  === "Pending";
  const isPendingProfileTab = profileTab === "Pending Review";

  const TableSection = ({ title, tabs, activeTabState, setActiveTabState, data, isLoading, err, isPending, onAction, updatingId, onView }) => (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        <button
          onClick={() => isPending ? fetchDoctors(activeTabState) : fetchProfileDoctors(activeTabState)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
        >
          <FiRefreshCw className={`text-sm ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-4">
        {Object.keys(tabs).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTabState(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              activeTabState === tab ? "bg-red-500 text-white" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {err && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm rounded-lg px-4 py-3 mb-4">
          {err}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
            <AiOutlineLoading3Quarters className="animate-spin text-xl" />
            <span className="text-sm">Loading...</span>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <FiUsers className="text-4xl mb-2" />
            <p className="text-sm">No {activeTabState.toLowerCase()} records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Doctor Information</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Specialization</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Experience</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {doc.profilePhoto ? (
                          <img src={doc.profilePhoto} alt={doc.firstName} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center flex-shrink-0">
                            {doc.firstName[0]}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-800">Dr. {doc.firstName} {doc.lastName}</p>
                          <p className="text-xs text-gray-400">{doc.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-blue-500 text-xs font-semibold uppercase tracking-wide">{doc.specialisation}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{doc.experience ?? "—"}</td>
                    <td className="px-6 py-4">
                      {onView ? (
                        // Profile section — view button opens modal
                        <button
                          onClick={() => setSelectedDoctor(doc)}
                          className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold rounded-lg border border-blue-200 transition"
                        >
                          <FiEye className="text-sm" /> View Profile
                        </button>
                      ) : isPending ? (
                        // Account section — approve/reject inline
                        updatingId === doc.id ? (
                          <AiOutlineLoading3Quarters className="animate-spin text-gray-400" />
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onAction(doc, "APPROVED")}
                              className="flex items-center gap-1.5 px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition"
                            >
                              <FiCheckCircle className="text-sm" /> Approve
                            </button>
                            <button
                              onClick={() => onAction(doc, "REJECTED")}
                              className="flex items-center gap-1.5 px-4 py-1.5 bg-white hover:bg-red-50 text-red-500 text-xs font-semibold rounded-lg border border-red-200 transition"
                            >
                              <FiXCircle className="text-sm" /> Reject
                            </button>
                          </div>
                        )
                      ) : (
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          doc.status === "APPROVED" || doc.profileStatus === "APPROVED"
                            ? "bg-green-50 text-green-600"
                            : "bg-red-50 text-red-500"
                        }`}>
                          {doc.status ?? doc.profileStatus}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-400">
              Showing {data.length} record{data.length !== 1 ? "s" : ""}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="p-8">
        <p className="text-gray-500 text-sm mb-1">Hi, Admin User</p>
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Doctor Approval Management</h1>

        {/* Section 1 — Account Approvals */}
        <TableSection
          title="Account Approvals"
          tabs={ACCOUNT_TABS}
          activeTabState={activeTab}
          setActiveTabState={setActiveTab}
          data={doctors}
          isLoading={loading}
          err={error}
          isPending={isPendingTab}
          onAction={handleAccountAction}
          updatingId={updating}
          onView={null}
        />

        {/* Section 2 — Profile Approvals */}
        <TableSection
          title="Profile Approvals"
          tabs={PROFILE_TABS}
          activeTabState={profileTab}
          setActiveTabState={setProfileTab}
          data={profileDoctors}
          isLoading={profileLoading}
          err={profileError}
          isPending={isPendingProfileTab}
          onAction={null}
          updatingId={null}
          onView={true}
        />
      </div>

      {/* Profile detail modal */}
      {selectedDoctor && (
        <ProfileModal
          doctor={selectedDoctor}
          onClose={() => setSelectedDoctor(null)}
          onApprove={(doc) => handleProfileAction(doc, "APPROVED")}
          onReject={(doc)  => handleProfileAction(doc, "REJECTED")}
          updating={profileUpdating}
        />
      )}

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm max-w-xs ${
              toast.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {toast.type === "success"
              ? <FiCheckCircle className="text-lg flex-shrink-0 mt-0.5" />
              : <FiXCircle     className="text-lg flex-shrink-0 mt-0.5" />
            }
            <div>
              <p className="font-semibold">{toast.type === "success" ? "Success!" : "Rejected"}</p>
              <p className="text-white/80 text-xs">{toast.message}</p>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="ml-auto text-white/70 hover:text-white"
            >×</button>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
