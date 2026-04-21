import React, { useState, useEffect } from "react";
import AdminLayout                     from "../layouts/AdminLayout";
import { AiOutlineLoading3Quarters }   from "react-icons/ai";
import { FiCheckCircle, FiXCircle, FiRefreshCw, FiUsers, FiEye } from "react-icons/fi";
import { FaUserMd, FaUserCheck, FaUserSlash, FaTrash, FaUsers } from "react-icons/fa";

const API = import.meta.env.VITE_API_URL;

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
              <p className="text-gray-700">{doctor.consultationFee ? `Rs ${doctor.consultationFee}` : "—"}</p>
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

export default function DoctorManagement() {
  const [tab,             setTab]             = useState("all");
  const [doctors,         setDoctors]         = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [actionLoading,   setActionLoading]   = useState(null);
  const [search,          setSearch]          = useState("");
  const [profileTab,      setProfileTab]      = useState("Pending Review");
  const [profileDoctors,  setProfileDoctors]  = useState([]);
  const [profileLoading,  setProfileLoading]  = useState(true);
  const [selectedDoctor,  setSelectedDoctor]  = useState(null);
  const [profileUpdating, setProfileUpdating] = useState(false);
  const [toasts,          setToasts]          = useState([]);

  const token = localStorage.getItem("token");

  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const statuses = ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"];
      const results  = await Promise.all(
        statuses.map((s) =>
          fetch(`${API}/api/admin/doctors?status=${s}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((r) => r.json())
        )
      );
      const all = results.flatMap((r) => r.doctors || []);
      setDoctors(all);
    } catch {
      addToast("Failed to load doctors", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchProfileDoctors = async (tab = profileTab) => {
    setProfileLoading(true);
    try {
      const res  = await fetch(
        `${API}/api/admin/profiles?profileStatus=${PROFILE_TABS[tab]}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setProfileDoctors(data.doctors || []);
    } catch {
      addToast("Failed to load profiles", "error");
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => { fetchDoctors(); }, []);
  useEffect(() => { fetchProfileDoctors(profileTab); }, [profileTab]);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      const res  = await fetch(`${API}/api/admin/doctors/${id}/status`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ status: "APPROVED" }),
      });
      const data = await res.json();
      if (data.success) { addToast("Doctor approved successfully!"); fetchDoctors(); }
      else addToast(data.message || "Failed", "error");
    } catch { addToast("Action failed", "error"); }
    finally { setActionLoading(null); }
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      const res  = await fetch(`${API}/api/admin/doctors/${id}/status`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ status: "REJECTED" }),
      });
      const data = await res.json();
      if (data.success) { addToast("Doctor rejected"); fetchDoctors(); }
      else addToast(data.message || "Failed", "error");
    } catch { addToast("Action failed", "error"); }
    finally { setActionLoading(null); }
  };

  const handleSuspend = async (id) => {
    setActionLoading(id);
    try {
      const res  = await fetch(`${API}/api/admin/doctors/${id}/suspend`, {
        method:  "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) { addToast(data.message); fetchDoctors(); }
      else addToast(data.message || "Failed", "error");
    } catch { addToast("Action failed", "error"); }
    finally { setActionLoading(null); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Permanently delete Dr. ${name}?`)) return;
    setActionLoading(id);
    try {
      const res  = await fetch(`${API}/api/admin/doctors/${id}`, {
        method:  "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) { addToast("Doctor deleted successfully"); fetchDoctors(); }
      else addToast(data.message || "Failed", "error");
    } catch { addToast("Action failed", "error"); }
    finally { setActionLoading(null); }
  };

  const handleProfileAction = async (doctor, newProfileStatus) => {
    setProfileUpdating(true);
    try {
      const res  = await fetch(`${API}/api/admin/doctors/${doctor.id}/profileStatus`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ profileStatus: newProfileStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setProfileDoctors((prev) => prev.filter((d) => d.id !== doctor.id));
        setSelectedDoctor(null);
        addToast(
          newProfileStatus === "APPROVED"
            ? `Dr. ${doctor.firstName} ${doctor.lastName}'s profile is now live.`
            : `Dr. ${doctor.firstName} ${doctor.lastName}'s profile was rejected.`,
          newProfileStatus === "APPROVED" ? "success" : "error"
        );
      } else addToast(data.message || "Failed", "error");
    } catch { addToast("Failed to update profile", "error"); }
    finally { setProfileUpdating(false); }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const matchesTab =
      tab === "all"       ? true :
      tab === "pending"   ? doc.status === "PENDING"   :
      tab === "active"    ? doc.status === "APPROVED"  :
      tab === "suspended" ? doc.status === "SUSPENDED" :
      tab === "rejected"  ? doc.status === "REJECTED"  : true;

    const matchesSearch =
      `${doc.firstName} ${doc.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      doc.email.toLowerCase().includes(search.toLowerCase()) ||
      doc.specialisation?.toLowerCase().includes(search.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const counts = {
    total:     doctors.length,
    pending:   doctors.filter((d) => d.status === "PENDING").length,
    approved:  doctors.filter((d) => d.status === "APPROVED").length,
    suspended: doctors.filter((d) => d.status === "SUSPENDED").length,
  };

  const getStatusBadge = (status) => {
    const map = {
      PENDING:   "bg-orange-100 text-orange-600",
      APPROVED:  "bg-green-100 text-green-600",
      SUSPENDED: "bg-yellow-100 text-yellow-600",
      REJECTED:  "bg-red-100 text-red-600",
    };
    return map[status] || "bg-gray-100 text-gray-600";
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm text-gray-500">Hi, Admin</p>
          <h1 className="text-2xl font-bold text-gray-800">Doctor Management</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="relative bg-white rounded-xl shadow border p-4 flex justify-between items-center overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
            <div><p className="text-xs text-gray-500">Total</p><p className="text-2xl font-bold">{counts.total}</p></div>
            <FaUsers className="text-2xl text-blue-500" />
          </div>
          <div className="relative bg-white rounded-xl shadow border p-4 flex justify-between items-center overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-400" />
            <div><p className="text-xs text-gray-500">Pending</p><p className="text-2xl font-bold text-orange-500">{counts.pending}</p></div>
            <FaUserMd className="text-2xl text-orange-400" />
          </div>
          <div className="relative bg-white rounded-xl shadow border p-4 flex justify-between items-center overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500" />
            <div><p className="text-xs text-gray-500">Active</p><p className="text-2xl font-bold text-green-600">{counts.approved}</p></div>
            <FaUserCheck className="text-2xl text-green-500" />
          </div>
          <div className="relative bg-white rounded-xl shadow border p-4 flex justify-between items-center overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500" />
            <div><p className="text-xs text-gray-500">Suspended</p><p className="text-2xl font-bold text-yellow-600">{counts.suspended}</p></div>
            <FaUserSlash className="text-2xl text-yellow-500" />
          </div>
        </div>

        {/* ── Section 1: Doctor Accounts ── */}
        <div className="bg-white rounded-2xl shadow border p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800">Doctor Accounts</h2>
            <button onClick={fetchDoctors} className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <FiRefreshCw className={`text-sm ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <input
              type="text"
              placeholder="Search by name, email or specialisation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border px-4 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
            />
            <div className="flex gap-2 flex-wrap">
              {["all", "pending", "active", "suspended", "rejected"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                    tab === t ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <AiOutlineLoading3Quarters className="animate-spin text-2xl text-blue-500" />
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FaUserMd className="text-4xl mx-auto mb-3" />
              <p className="text-sm">No doctors found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-100 text-xs text-gray-600 font-semibold">
                    <th className="px-4 py-3 rounded-l-lg">Doctor</th>
                    <th className="px-4 py-3">Specialisation</th>
                    <th className="px-4 py-3">Experience</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 rounded-r-lg text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredDoctors.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {doc.profilePhoto ? (
                            <img src={doc.profilePhoto} alt={doc.firstName} className="w-10 h-10 rounded-full object-cover border" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                              {doc.firstName?.[0]}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-800">Dr. {doc.firstName} {doc.lastName}</p>
                            <p className="text-xs text-gray-400">{doc.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-blue-500 text-xs font-semibold uppercase">{doc.specialisation}</td>
                      <td className="px-4 py-3 text-gray-600">{doc.experience || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getStatusBadge(doc.status)}`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2 flex-wrap">
                          {actionLoading === doc.id ? (
                            <AiOutlineLoading3Quarters className="animate-spin text-blue-500" />
                          ) : (
                            <>
                              {doc.status === "PENDING" && (
                                <>
                                  <button onClick={() => handleApprove(doc.id)} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition">
                                    <FiCheckCircle className="inline mr-1" />Approve
                                  </button>
                                  <button onClick={() => handleReject(doc.id)} className="border border-red-400 text-red-500 hover:bg-red-500 hover:text-white px-3 py-1 rounded-lg text-xs font-medium transition">
                                    <FiXCircle className="inline mr-1" />Reject
                                  </button>
                                </>
                              )}
                              {doc.status === "APPROVED" && (
                                <>
                                  <button onClick={() => handleSuspend(doc.id)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition">
                                    <FaUserSlash className="inline mr-1" />Suspend
                                  </button>
                                  <button onClick={() => handleDelete(doc.id, `${doc.firstName} ${doc.lastName}`)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition">
                                    <FaTrash className="inline mr-1" />Delete
                                  </button>
                                </>
                              )}
                              {doc.status === "SUSPENDED" && (
                                <>
                                  <button onClick={() => handleApprove(doc.id)} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition">
                                    <FaUserCheck className="inline mr-1" />Activate
                                  </button>
                                  <button onClick={() => handleDelete(doc.id, `${doc.firstName} ${doc.lastName}`)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition">
                                    <FaTrash className="inline mr-1" />Delete
                                  </button>
                                </>
                              )}
                              {doc.status === "REJECTED" && (
                                <button onClick={() => handleDelete(doc.id, `${doc.firstName} ${doc.lastName}`)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition">
                                  <FaTrash className="inline mr-1" />Delete
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-3 border-t text-xs text-gray-400">
                Showing {filteredDoctors.length} record{filteredDoctors.length !== 1 ? "s" : ""}
              </div>
            </div>
          )}
        </div>

        {/* ── Section 2: Profile Approvals ── */}
        <div className="bg-white rounded-2xl shadow border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800">Profile Approvals</h2>
            <button onClick={() => fetchProfileDoctors(profileTab)} className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <FiRefreshCw className={`text-sm ${profileLoading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>

          {/* Profile Tabs */}
          <div className="flex gap-2 mb-4">
            {Object.keys(PROFILE_TABS).map((t) => (
              <button
                key={t}
                onClick={() => setProfileTab(t)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${
                  profileTab === t ? "bg-red-500 text-white" : "text-gray-500 hover:text-gray-700 bg-gray-100"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {profileLoading ? (
            <div className="flex justify-center py-12">
              <AiOutlineLoading3Quarters className="animate-spin text-2xl text-blue-500" />
            </div>
          ) : profileDoctors.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FiUsers className="text-4xl mx-auto mb-3" />
              <p className="text-sm">No {profileTab.toLowerCase()} profiles found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-100 text-xs text-gray-600 font-semibold">
                    <th className="px-4 py-3 rounded-l-lg">Doctor</th>
                    <th className="px-4 py-3">Specialisation</th>
                    <th className="px-4 py-3">Experience</th>
                    <th className="px-4 py-3 rounded-r-lg text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {profileDoctors.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {doc.profilePhoto ? (
                            <img src={doc.profilePhoto} alt={doc.firstName} className="w-10 h-10 rounded-full object-cover border" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                              {doc.firstName?.[0]}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-800">Dr. {doc.firstName} {doc.lastName}</p>
                            <p className="text-xs text-gray-400">{doc.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-blue-500 text-xs font-semibold uppercase">{doc.specialisation}</td>
                      <td className="px-4 py-3 text-gray-600">{doc.experience || "—"}</td>
                      <td className="px-4 py-3 text-center">
                        {profileTab === "Pending Review" ? (
                          <button
                            onClick={() => setSelectedDoctor(doc)}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold rounded-lg border border-blue-200 transition mx-auto"
                          >
                            <FiEye /> View Profile
                          </button>
                        ) : (
                          <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                            doc.profileStatus === "APPROVED" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                          }`}>
                            {doc.profileStatus}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Profile Modal */}
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
              <p className="font-semibold">{toast.type === "success" ? "Success!" : "Action"}</p>
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