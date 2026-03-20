import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import { FiUsers, FiCheckCircle, FiXCircle, FiFileText } from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [counts,  setCounts]  = useState({ pending: 0, approved: 0, rejected: 0, pendingProfiles: 0 });
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const { data } = await axios.get(`${API}/api/admin/doctors/counts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCounts(data.counts);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, []);

  return (
    <AdminLayout>
      <div className="p-8">
        <p className="text-gray-500 text-sm mb-1">Hi, Admin User</p>
        <h1 className="text-2xl font-bold text-gray-800 mb-8">
          Doctor Approval Management
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Pending account approvals */}
          <div
            
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-center gap-4 cursor-pointer hover:shadow-md transition"
          >
            <div className="w-11 h-11 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <FiUsers className="text-orange-500 text-xl" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Pending Account Requests</p>
              {loading
                ? <AiOutlineLoading3Quarters className="animate-spin text-gray-400 mt-1" />
                : <p className="text-3xl font-bold text-gray-800">{counts.pending}</p>
              }
            </div>
          </div>

          {/* Pending profile approvals — highlighted if > 0 */}
          <div
            
            className={`rounded-xl border shadow-sm p-6 flex items-center gap-4 cursor-pointer hover:shadow-md transition ${
              counts.pendingProfiles > 0
                ? "bg-blue-50 border-blue-200"
                : "bg-white border-gray-100"
            }`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
              counts.pendingProfiles > 0 ? "bg-blue-100" : "bg-gray-100"
            }`}>
              <FiFileText className={`text-xl ${counts.pendingProfiles > 0 ? "text-blue-500" : "text-gray-400"}`} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Pending Profile Reviews</p>
              {loading
                ? <AiOutlineLoading3Quarters className="animate-spin text-gray-400 mt-1" />
                : (
                  <div className="flex items-center gap-2">
                    <p className={`text-3xl font-bold ${counts.pendingProfiles > 0 ? "text-blue-600" : "text-gray-800"}`}>
                      {counts.pendingProfiles}
                    </p>
                    {counts.pendingProfiles > 0 && (
                      <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full font-medium">
                        New
                      </span>
                    )}
                  </div>
                )
              }
            </div>
          </div>

          {/* Approved */}
          <div
            
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-center gap-4 cursor-pointer hover:shadow-md transition"
          >
            <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <FiCheckCircle className="text-green-500 text-xl" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Approved Doctors</p>
              {loading
                ? <AiOutlineLoading3Quarters className="animate-spin text-gray-400 mt-1" />
                : <p className="text-3xl font-bold text-gray-800">{counts.approved}</p>
              }
            </div>
          </div>

          {/* Rejected */}
          <div
            
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-center gap-4 cursor-pointer hover:shadow-md transition"
          >
            <div className="w-11 h-11 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <FiXCircle className="text-red-400 text-xl" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Rejected Doctors</p>
              {loading
                ? <AiOutlineLoading3Quarters className="animate-spin text-gray-400 mt-1" />
                : <p className="text-3xl font-bold text-gray-800">{counts.rejected}</p>
              }
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}