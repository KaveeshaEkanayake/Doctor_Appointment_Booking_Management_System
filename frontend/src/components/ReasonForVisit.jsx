export default function ReasonForVisit({ value, onChange }) {
  return (
    <div className="bg-white rounded-xl space-y-3">
      <h2 className="text-gray-700 font-semibold">Reason for Visit</h2>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Please describe your symptoms or reason for the appointment..."
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm h-28 focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none"
      />
    </div>
  );
}