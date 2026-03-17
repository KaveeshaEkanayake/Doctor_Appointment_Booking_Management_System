import { useNavigate } from "react-router-dom";
export default function ActionButtons({ onBack, onConfirm }) {
  return (
    <div className="flex justify-between mt-6">
      <button
        onClick={onBack}
        className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
      >
        Back
      </button>

      <button
        onClick={onConfirm}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Confirm Appointment
      </button>
    </div>
  );
}
