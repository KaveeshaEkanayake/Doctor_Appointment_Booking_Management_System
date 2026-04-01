import { useEffect, useState }       from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const API = import.meta.env.VITE_API_URL;

export default function DoctorCard({ docId }) {
  const [doctor,  setDoctor]  = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!docId) return;
    fetch(`${API}/api/doctors/${docId}`)
      .then(res => res.json())
      .then(data => setDoctor(data.doctor))
      .catch(err => console.error("Error fetching doctor:", err))
      .finally(() => setLoading(false));
  }, [docId]);

  if (loading) return (
    <div className="flex items-center gap-2 text-gray-400 py-4">
      <AiOutlineLoading3Quarters className="animate-spin" />
      <span className="text-sm">Loading doctor...</span>
    </div>
  );

  if (!doctor) return (
    <p className="text-red-500 text-sm">Doctor not found.</p>
  );

  return (
    <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      {doctor.profilePhoto ? (
        <img
          src={doctor.profilePhoto}
          alt={`Dr. ${doctor.firstName}`}
          className="w-20 h-20 object-cover rounded-full border border-gray-200"
        />
      ) : (
        <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-3xl font-bold text-blue-200 border border-blue-100">
          {doctor.firstName?.[0]}
        </div>
      )}
      <div>
        <h2 className="text-xl font-semibold text-gray-800">
          Dr. {doctor.firstName} {doctor.lastName}
        </h2>
        <p className="text-blue-500 text-sm">{doctor.specialisation}</p>
        {doctor.consultationFee && (
          <p className="text-gray-400 text-xs mt-1">Rs {doctor.consultationFee} per visit</p>
        )}
      </div>
    </div>
  );
}