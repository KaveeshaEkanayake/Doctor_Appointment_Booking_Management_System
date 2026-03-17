

import { useLocation, useNavigate } from "react-router-dom";

const AppointmentConfirmation = () => {
  const { state } = useLocation();   // read the state passed from navigate()
  const navigate = useNavigate();

  if (!state) return <p>No appointment details found.</p>;

  const appointment = state; // contains reason, date, time, provider

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white border border-gray-200 shadow-md rounded-lg w-[400px] text-center">
        
        {/* Success Icon */}
        <div className="h-[200px] bg-blue-50">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 rounded-full mt-16 p-3">
              <svg
                className="w-12 h-12 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Appointment Booked Successfully!
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Your appointment has been confirmed. You will receive a notification shortly.
          </p>
        </div>

        {/* Appointment Details */}
        <div className="text-sm mb-6 w-[400px]">
          <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-center mr-10 ml-10">
            <p className="font-semibold text-gray-700 text-left">Reason:</p>
            <p className="text-gray-800 text-right">{appointment.reason}</p>

            <p className="font-semibold text-gray-700 text-left">Date:</p>
            <p className="text-gray-800 text-right">{appointment.date}</p>

            <p className="font-semibold text-gray-700 text-left">Time:</p>
            <p className="text-gray-800 text-right">{appointment.time}</p>

            <p className="font-semibold text-gray-700 text-left">Provider:</p>
            <p className="text-gray-800 text-right">{appointment.provider}</p>
          </div>
        </div>

        {/* OK Button */}
        <div className="p-6">
          <button
            className="bg-blue-600 text-white px-40 py-2 shadow-md rounded-md hover:bg-blue-700 transition"
            onClick={() => navigate("/appointment")} // go back to appointment page
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentConfirmation;
