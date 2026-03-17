import { useNavigate } from "react-router-dom";
export default function ReasonForVisit({ value, onChange }) {
  return (
    <div className="bg-white rounded-xl space-y-4">
      <h2 className="text-gray-700 font-semibold">Reason for Visit</h2>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Please describe your symptoms or reason for the appointment..."
        className="w-full border border-gray-300 rounded-lg px-3 py-2 h-28 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
    </div>
  );
}

