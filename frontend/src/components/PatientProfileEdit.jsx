import { useEffect, useState } from "react";
import axios from "axios";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const API = import.meta.env.VITE_API_URL;

export default function PatientProfileEdit({ onCancel }) {
  const [formData,      setFormData]      = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [error,         setError]         = useState("");
  const [successMsg,    setSuccessMsg]    = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get(`${API}/api/patient/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setFormData(res.data.patient))
      .catch(() => setError("Failed to load profile."))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await axios.put(
        `${API}/api/patient/profile`,
        {
          firstName:   formData.firstName,
          lastName:    formData.lastName,
          phone:       formData.phone,
          address:     formData.address,
          dateOfBirth: formData.dateOfBirth
            ? formData.dateOfBirth.substring(0, 10)
            : undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMsg("Profile updated successfully!");
      // Update localStorage name if changed
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({
        ...user,
        firstName: res.data.patient.firstName,
        lastName:  res.data.patient.lastName,
      }));
      setTimeout(() => onCancel(), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24 text-gray-400 gap-2">
      <AiOutlineLoading3Quarters className="animate-spin text-xl" />
      <span>Loading...</span>
    </div>
  );

  return (
    <div className="bg-white shadow-md rounded-lg p-6 md:p-10 space-y-6">

      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-500">
          {formData?.firstName?.[0]}
        </div>
        <div>
          <p className="font-bold text-gray-800">
            {formData?.firstName} {formData?.lastName}
          </p>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            🔒 {formData?.email}
          </p>
        </div>
      </div>

      <h3 className="text-xl font-bold">Edit Personal Information</h3>

      {/* Full Name */}
      <div>
        <label className="block text-gray-700 font-semibold mb-1">Full Name</label>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="firstName"
            value={formData?.firstName || ""}
            onChange={handleChange}
            placeholder="First name"
            className="w-full border rounded-lg p-2"
          />
          <input
            type="text"
            name="lastName"
            value={formData?.lastName || ""}
            onChange={handleChange}
            placeholder="Last name"
            className="w-full border rounded-lg p-2"
          />
        </div>
      </div>

      {/* Phone + DOB */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-700 font-semibold mb-1">Phone Number</label>
          <input
            type="text"
            name="phone"
            value={formData?.phone || ""}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-1">Date of Birth</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData?.dateOfBirth ? formData.dateOfBirth.substring(0, 10) : ""}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          />
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-gray-700 font-semibold mb-1">Address</label>
        <input
          type="text"
          name="address"
          value={formData?.address || ""}
          onChange={handleChange}
          className="w-full border rounded-lg p-2"
        />
      </div>

      {/* Email — read only */}
      <div>
        <label className="block text-gray-700 font-semibold mb-1">Email Address</label>
        <input
          type="email"
          value={formData?.email || ""}
          disabled
          className="w-full border rounded-lg p-2 bg-gray-50 text-gray-400 cursor-not-allowed"
        />
        <p className="text-xs text-gray-400 mt-1">
          Your email address cannot be changed
        </p>
      </div>

      {/* Messages */}
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
      {successMsg && (
        <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 border border-green-200 rounded-lg px-4 py-2">
          ✅ {successMsg}
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-end space-x-4 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100 transition"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
        >
          {saving && <AiOutlineLoading3Quarters className="animate-spin text-sm" />}
          Save Changes
        </button>
      </div>
    </div>
  );
}