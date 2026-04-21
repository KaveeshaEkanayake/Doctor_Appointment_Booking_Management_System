import React, { useState, useEffect } from "react";

const DoctorManagement = () => {
  const [tab, setTab] = useState("pending");
  const [doctors, setDoctors] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const API_URL = "http://localhost:5000/api/doctors";
  const IMAGE_BASE_URL = "http://localhost:5000/uploads/";

  /* ================= FETCH FROM BACKEND ================= */
  const fetchDoctors = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setDoctors(data); // ✅ no mapping, no local images
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  /* ================= NOTIFICATIONS ================= */
  const addNotification = (type, message) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };

  /* ================= ACTIONS ================= */
  const handleApprove = async (id) => {
    await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "active" }),
    });

    addNotification("success", "Success! Doctor has been approved and notified.");
    fetchDoctors();
  };

  const handleReject = async (id) => {
    const doctor = doctors.find((d) => d.id === id);

    await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    addNotification("error", `Registration Rejected. The application for ${doctor?.name} was declined.`);
    fetchDoctors();
  };

  const handleSuspend = async (id) => {
    const doctor = doctors.find((d) => d.id === id);

    await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "suspended" }),
    });

    addNotification("error", `Account Suspended. ${doctor?.name} was suspended.`);
    fetchDoctors();
  };

  const handleDelete = async (id) => {
    const doctor = doctors.find((d) => d.id === id);

    await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    addNotification("error", `Profile Deleted. ${doctor?.name}'s profile was deleted.`);
    fetchDoctors();
  };

  /* ================= FILTER ================= */
  const filteredDoctors = doctors.filter((doc) => {
    if (tab === "all") return true;
    return doc.status === tab;
  });

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white p-6">
        <h2 className="text-2xl font-bold mb-6">MediCare</h2>
        <nav className="space-y-4">
          <a href="#" className="block hover:text-blue-300">Dashboard</a>
          <a href="#" className="block hover:text-blue-300">Doctors</a>
          <a href="#" className="block hover:text-blue-300">Logout</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Doctor Approval Management</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-blue-400 text-white rounded-lg p-4 shadow">
            <div className="text-sm">Total Doctors</div>
            <div className="text-2xl font-bold">{doctors.length}</div>
          </div>

          <div className="bg-orange-400 text-white rounded-lg p-4 shadow">
            <div className="text-sm">Pending Approval</div>
            <div className="text-2xl font-bold">
              {doctors.filter((d) => d.status === "pending").length}
            </div>
          </div>

          <div className="bg-green-400 text-white rounded-lg p-4 shadow">
            <div className="text-sm">Active Doctors</div>
            <div className="text-2xl font-bold">
              {doctors.filter((d) => d.status === "active").length}
            </div>
          </div>

          <div className="bg-red-400 text-white rounded-lg p-4 shadow">
            <div className="text-sm">Suspended</div>
            <div className="text-2xl font-bold">
              {doctors.filter((d) => d.status === "suspended").length}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <input
            type="text"
            placeholder="Search by name, email, specialty..."
            className="w-full md:w-1/2 px-4 py-2 border rounded-lg mb-4 md:mb-0"
          />

          <div className="flex space-x-2">
            {["all", "pending", "active", "suspended"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded ${
                  tab === t ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="fixed bottom-4 right-4 space-y-2 z-50">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded shadow-lg w-80 ${
                n.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {n.message}
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Doctor Information</th>
                <th className="px-4 py-2">Specialization</th>
                <th className="px-4 py-2">Experience</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredDoctors.map((doc) => (
                <tr key={doc.id} className="border-b">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          doc.imageUrl
                            ? `${IMAGE_BASE_URL}${doc.imageUrl}`
                            : "https://via.placeholder.com/100"
                        }
                        alt={doc.name}
                        className="w-12 h-12 rounded-full object-cover border"
                      />
                      <div>
                        <div className="font-semibold">{doc.name}</div>
                        <div className="text-sm text-gray-500">{doc.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-2">{doc.specialization}</td>
                  <td className="px-4 py-2">{doc.experience}</td>

                  <td className="px-4 py-2 capitalize">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        doc.status === "active"
                          ? "bg-green-50 text-green-600"
                          : doc.status === "pending"
                          ? "bg-orange-50 text-orange-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {doc.status}
                    </span>
                  </td>

                  <td className="px-4 py-2 flex gap-2">
                    {/* (UNCHANGED ACTION BUTTONS) */}
                    {doc.status === "pending" && (
                      <>
                        <button onClick={() => handleApprove(doc.id)} className="bg-green-500 text-white px-3 py-1 rounded">
                          Approve
                        </button>
                        <button onClick={() => handleReject(doc.id)} className="border text-red-500 px-3 py-1 rounded">
                          Reject
                        </button>
                      </>
                    )}

                    {doc.status === "active" && (
                      <>
                        <button onClick={() => handleSuspend(doc.id)} className="bg-yellow-500 text-white px-3 py-1 rounded">
                          Suspend
                        </button>
                        <button onClick={() => handleDelete(doc.id)} className="border text-red-500 px-3 py-1 rounded">
                          Delete
                        </button>
                      </>
                    )}

                    {doc.status === "suspended" && (
                      <>
                        <button onClick={() => handleApprove(doc.id)} className="bg-green-500 text-white px-3 py-1 rounded">
                          Approve
                        </button>
                        <button onClick={() => handleDelete(doc.id)} className="border text-red-500 px-3 py-1 rounded">
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default DoctorManagement;