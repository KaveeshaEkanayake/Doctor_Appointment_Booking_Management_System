import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect }       from "react";
import axios                         from "axios";
import Navbar                        from "../components/Navbar";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FiCalendar, FiFileText }    from "react-icons/fi";

const API = import.meta.env.VITE_API_URL;

export default function AppointmentReviewPage() {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [reason,   setReason]   = useState(state?.reason || "");
  const [doctor,   setDoctor]   = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!state?.doctorId) return;
    axios.get(`${API}/api/doctors/${state.doctorId}`)
      .then(res => setDoctor(res.data.doctor))
      .catch(() => {});
  }, [state?.doctorId]);

  if (!state) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F6FAFF]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">No appointment data found.</p>
        </div>
      </div>
    );
  }

  const { doctorId, date, time } = state;

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });

  const handleConfirmBooking = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(
        `${API}/api/appointments`,
        { doctorId, date, time, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate("/appointments/confirmation", {
        state: {
          reason,
          date:     new Date(date).toLocaleDateString("en-US", {
            month: "long", day: "numeric", year: "numeric"
          }),
          time,
          provider: `Dr. ${res.data.appointment.doctor.firstName} ${res.data.appointment.doctor.lastName}`,
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to book appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6FAFF]">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
          Review Appointment
        </h2>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">

          {/* Doctor info */}
          {doctor && (
            <div className="px-8 py-5 border-b border-gray-100 flex items-center gap-4">
              {doctor.profilePhoto ? (
                <img
                  src={doctor.profilePhoto}
                  alt={`Dr. ${doctor.firstName}`}
                  className="w-14 h-14 rounded-full object-cover border border-gray-100"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-2xl font-bold text-blue-300 border border-blue-100">
                  {doctor.firstName?.[0]}
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-0.5">
                  Selected Specialist
                </p>
                <p className="text-base font-bold text-gray-800">
                  Dr. {doctor.firstName} {doctor.lastName}
                </p>
                <p className="text-sm text-gray-500">{doctor.specialisation}</p>
              </div>
            </div>
          )}

          {/* Date & Time + Reason row */}
          <div className="grid grid-cols-2 divide-x divide-gray-100">
            <div className="px-8 py-6">
              <div className="flex items-center gap-2 mb-2">
                <FiCalendar className="text-blue-500 text-sm" />
                <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider">
                  Date & Time
                </p>
              </div>
              <p className="text-sm text-gray-800 font-medium">{formattedDate}</p>
              <p className="text-sm text-gray-500 mt-0.5">{time}</p>
            </div>

            <div className="px-8 py-6">
              <div className="flex items-center gap-2 mb-2">
                <FiFileText className="text-blue-500 text-sm" />
                <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider">
                  Reason for Visit
                </p>
              </div>
              <p className="text-sm text-gray-800 font-medium">
                {reason || <span className="text-gray-400 italic">Not provided</span>}
              </p>
            </div>
          </div>

          {/* Reason textarea */}
          <div className="px-8 py-6 border-t border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Add / Edit Reason for Visit
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please describe your symptoms or reason for the appointment..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 h-24 resize-none"
            />
          </div>

          {error && (
            <div className="mx-8 mb-6 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition shadow-sm"
          >
            Back
          </button>
          <button
            onClick={handleConfirmBooking}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
          >
            {loading && <AiOutlineLoading3Quarters className="animate-spin text-sm" />}
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
}