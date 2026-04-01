export default function ActionButtons({ onBack, onConfirm }) {
  return (
    <div className="flex gap-4 mt-6">
      <button
        onClick={onBack}
        className="flex-1 bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
      >
        Back
      </button>
      <button
        onClick={onConfirm}
        className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition shadow-sm"
      >
        Confirm Appointment
      </button>
    </div>
  );
}