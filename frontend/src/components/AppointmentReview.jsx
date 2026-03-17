import { useLocation, useNavigate } from "react-router-dom";

export default function AppointmentReview() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) return <p>No appointment data found.</p>;

  const { doctor, date, time, reason } = state;

  const handleConfirmBooking = () => {
    navigate("/appointment-confirmation", {
      state: {
        reason,
        date,
        time,
        provider: doctor.name, // or doctor.specialty if you prefer
      },
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="rounded-lg w-full max-w-3xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Review Appointment
        </h2>

        <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-8">
          {/* Doctor details */}
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-4 justify-end">
              <img
                src={doctor.imageUrl}
                alt={doctor.name}
                className="w-20 h-20 object-cover border"
              />
              <div className="text-left">
                <h3 className="text-xs font-semibold text-blue-500 uppercase mb-2">
                  Selected Specialist
                </h3>
                <p className="text-lg font-bold text-gray-900">{doctor.name}</p>
                <p className="text-sm text-gray-600">{doctor.specialty}</p>
              </div>
            </div>
          </div>

          {/* Date & Time vs Reason */}
          <div className="grid grid-cols-2 gap-6 mb-1 border-t py-6">
            <div className="pr-6 border-r text-center">
              <h3 className="text-xs font-semibold text-blue-500 uppercase mb-2">
                📅 Date & Time
              </h3>
              <p className="text-sm text-gray-700">
                {date}, {time}
              </p>
            </div>

            <div className="pl-6 text-center">
              <h3 className="text-xs font-semibold text-blue-500 uppercase mb-2">
                📋 Reason for Visit
              </h3>
              <p className="text-sm text-gray-700">{reason}</p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => navigate(-1)}
            className="w-1/3 py-2 rounded-md bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
          >
            Back
          </button>
          <button
            onClick={handleConfirmBooking}
            className="w-1/3 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
}
