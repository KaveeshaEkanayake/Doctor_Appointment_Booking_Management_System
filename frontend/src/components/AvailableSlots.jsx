import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function AvailableSlots({ doctorId, selectedDate }) {
  const [selectedTime, setSelectedTime] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);

  // Fetch booked slots from backend
  useEffect(() => {
    if (!doctorId || !selectedDate) return;
    const fetchSlots = async () => {
      try {
        const res = await fetch(`/api/appointments/${doctorId}/${selectedDate}`);
        const data = await res.json();
        setBookedSlots(data);
      } catch (err) {
        console.error("Error fetching slots:", err);
      }
    };
    fetchSlots();
  }, [doctorId, selectedDate]);

  // Generate slots in 15-min intervals
  const generateSlots = (startHour, endHour) => {
    const slots = [];
    for (let hour = startHour; hour < endHour; hour++) {
      for (let min = 0; min < 60; min += 15) {
        const date = new Date();
        date.setHours(hour, min, 0, 0);
        slots.push(
          date.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
        );
      }
    }
    return slots;
  };

  const slots = {
    morning: generateSlots(8, 12),
    afternoon: generateSlots(13, 18),
    evening: generateSlots(18, 23),
  };

  const renderSlots = (label, icon, times) => (
    <div className="mb-6">
      <p className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
        <span>{icon}</span> {label.toUpperCase()} SLOTS
      </p>
      <div className="grid grid-cols-4 gap-3">
        {times.map((slot) => {
          const isBooked = bookedSlots.includes(slot);
          const isSelected = selectedTime === slot;

          return (
            <button
              key={slot}
              onClick={() => !isBooked && setSelectedTime(slot)}
              disabled={isBooked}
              className={`px-4 py-2 rounded-lg border transition text-sm ${
                isBooked
                  ? "bg-gray-300 text-gray-500 shadow-inner cursor-not-allowed"
                  : isSelected
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {slot}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6">
      <h2 className="text-gray-700 font-semibold mb-4">Available Slots</h2>
      {renderSlots("Morning", "🌞", slots.morning)}
      {renderSlots("Afternoon", "🌞", slots.afternoon)}
      {renderSlots("Evening", "🌙", slots.evening)}
    </div>
  );
}




