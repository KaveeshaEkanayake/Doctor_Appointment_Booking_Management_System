import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function DoctorCard({ docId }) {
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await fetch(`/api/doctors/${docId}`);
        const data = await res.json();
        setDoctor(data);
      } catch (err) {
        console.error("Error fetching doctor:", err);
      }
    };
    fetchDoctor();
  }, [docId]);

  if (!doctor) return <p>Loading...</p>;

  return (
    <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow">
      {/* Doctor Image with Online Status */}
      <div className="relative">
        <img
          src={doctor.imageUrl}
          alt={doctor.name}
          className="w-20 h-20 object-cover rounded-full border border-gray-200"
        />
        {doctor.status === "online" && (
          <span className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
        )}
      </div>

      {/* Doctor Info */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800">{doctor.name}</h2>
        <p className="text-blue-400">{doctor.specialty}</p>
      </div>
    </div>
  );
}

