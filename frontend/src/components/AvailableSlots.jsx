import { useState, useEffect }       from "react";
import axios                         from "axios";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const API = import.meta.env.VITE_API_URL;

const DAY_MAP = {
  0: "SUNDAY",    1: "MONDAY",    2: "TUESDAY",
  3: "WEDNESDAY", 4: "THURSDAY",  5: "FRIDAY",  6: "SATURDAY",
};

const getLocalDateStr = (date) => {
  const year  = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day   = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function AvailableSlots({ doctorId, selectedDate, onSelectTime, selectedTime }) {
  const [availability, setAvailability] = useState([]);
  const [bookedSlots,  setBookedSlots]  = useState([]);
  const [duration,     setDuration]     = useState(30);
  const [loading,      setLoading]      = useState(false);

  useEffect(() => {
    if (!doctorId) return;
    axios.get(`${API}/api/doctors/${doctorId}/availability`)
      .then(res => {
        setAvailability(res.data.availability ?? []);
        setDuration(res.data.appointmentDuration ?? 30);
      })
      .catch(err => console.error("Error fetching availability:", err));
  }, [doctorId]);

  useEffect(() => {
    if (!doctorId || !selectedDate) return;
    setLoading(true);

    const d       = new Date(selectedDate);
    const dateStr = getLocalDateStr(d);

    axios.get(`${API}/api/appointments/booked-slots/${doctorId}/${dateStr}`)
      .then(res => setBookedSlots(res.data.bookedSlots ?? []))
      .catch(err => console.error("Error fetching booked slots:", err))
      .finally(() => setLoading(false));
  }, [doctorId, selectedDate]);

  const generateSlots = (startTime, endTime, durationMins) => {
    const slots = [];
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH,   endM]   = endTime.split(":").map(Number);
    let current = startH * 60 + startM;
    const end   = endH   * 60 + endM;
    while (current + durationMins <= end) {
      const h    = Math.floor(current / 60);
      const m    = current % 60;
      const ampm = h >= 12 ? "PM" : "AM";
      const h12  = h % 12 || 12;
      slots.push(`${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`);
      current += durationMins;
    }
    return slots;
  };

  const getSlotsForDate = () => {
    if (!selectedDate) return [];
    const dayOfWeek       = DAY_MAP[new Date(selectedDate).getDay()];
    const dayAvailability = availability.filter((a) => a.day === dayOfWeek);
    return dayAvailability.flatMap((a) => generateSlots(a.startTime, a.endTime, duration));
  };

  const slots = getSlotsForDate();

  if (!selectedDate) return (
    <div className="bg-white p-6 rounded-xl border border-gray-100">
      <h2 className="text-gray-700 font-semibold mb-2">Available Slots</h2>
      <p className="text-gray-400 text-sm">Please select a date to see available slots.</p>
    </div>
  );

  if (loading) return (
    <div className="flex items-center gap-2 text-gray-400 py-4">
      <AiOutlineLoading3Quarters className="animate-spin" />
      <span className="text-sm">Loading slots...</span>
    </div>
  );

  if (slots.length === 0) return (
    <div className="bg-white p-6 rounded-xl border border-gray-100">
      <h2 className="text-gray-700 font-semibold mb-2">Available Slots</h2>
      <p className="text-gray-400 text-sm">No slots available for this day.</p>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100">
      <h2 className="text-gray-700 font-semibold mb-4">Available Slots</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {slots.map((slot) => {
          const isBooked   = bookedSlots.includes(slot);
          const isSelected = selectedTime === slot;
          return (
            <button
              key={slot}
              onClick={() => !isBooked && onSelectTime(slot)}
              disabled={isBooked}
              className={`px-3 py-2 rounded-lg border text-sm transition ${
                isBooked
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                  : isSelected
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white text-gray-700 hover:border-blue-400 hover:text-blue-600 border-gray-200"
              }`}
            >
              {slot}
              {isBooked && (
                <span className="block text-[9px] text-gray-300 mt-0.5">Booked</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}