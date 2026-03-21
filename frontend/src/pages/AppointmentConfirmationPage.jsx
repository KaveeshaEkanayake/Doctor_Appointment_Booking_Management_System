import { useLocation, useNavigate } from "react-router-dom";
import Navbar                        from "../components/Navbar";

export default function AppointmentConfirmationPage() {
  const { state }  = useLocation();
  const navigate   = useNavigate();

  if (!state) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F6FAFF]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">No appointment details found.</p>
        </div>
      </div>
    );
  }

  const { reason, date, time, provider } = state;

  return (
    <div className="min-h-screen bg-[#F6FAFF] flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md overflow-hidden">

          {/* Success header */}
          <div className="bg-gradient-to-b from-blue-50 to-white px-8 pt-10 pb-6 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4 shadow-sm">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-1 text-center">
              Appointment Booked Successfully!
            </h2>
            <p className="text-sm text-gray-400 text-center">
              Your appointment has been confirmed. You will receive a notification shortly.
            </p>
          </div>

          {/* Appointment details */}
          <div className="px-8 py-6 space-y-4 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Reason</span>
              <span className="text-sm font-medium text-gray-800">{reason || "—"}</span>
            </div>
            <div className="h-px bg-gray-100" />
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</span>
              <span className="text-sm font-medium text-gray-800">{date}</span>
            </div>
            <div className="h-px bg-gray-100" />
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Time</span>
              <span className="text-sm font-medium text-gray-800">{time}</span>
            </div>
            <div className="h-px bg-gray-100" />
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Provider</span>
              <span className="text-sm font-medium text-gray-800 flex items-center gap-1">
                ✦ {provider}
              </span>
            </div>
          </div>

          {/* OK button */}
          <div className="px-8 pb-8">
            <button
              onClick={() => navigate("/my-appointments")}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition shadow-sm"
            >
              View My Appointments
            </button>
            <button
              onClick={() => navigate("/doctors")}
              className="w-full mt-3 bg-white border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
            >
              Browse More Doctors
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}