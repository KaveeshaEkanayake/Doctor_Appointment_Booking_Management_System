import React from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import { FiUsers, FiCheckCircle, FiXCircle } from "react-icons/fi";

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <p className="text-gray-500 text-sm mb-1">Hi, Admin User</p>
        <h1 className="text-2xl font-bold text-gray-800 mb-8">
          Doctor Approval Management
        </h1>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => navigate("/admin/doctors")}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition text-left"
          >
            <div className="w-11 h-11 bg-orange-100 rounded-xl flex items-center justify-center">
              <FiUsers className="text-orange-500 text-xl" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Pending Approvals</p>
              <p className="text-2xl font-bold text-gray-800">—</p>
            </div>
          </button>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-center gap-4">
            <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center">
              <FiCheckCircle className="text-green-500 text-xl" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Approved Doctors</p>
              <p className="text-2xl font-bold text-gray-800">—</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-center gap-4">
            <div className="w-11 h-11 bg-red-100 rounded-xl flex items-center justify-center">
              <FiXCircle className="text-red-400 text-xl" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Rejected Doctors</p>
              <p className="text-2xl font-bold text-gray-800">—</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-sm text-gray-400">
          More analytics coming in a future sprint.
        </div>
      </div>
    </AdminLayout>
  );
}