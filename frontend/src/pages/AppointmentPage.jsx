import { useLocation, useNavigate } from "react-router-dom";
import { useState }                 from "react";
import DoctorCard                   from "../components/DoctorCard";
import DateSelector                 from "../components/DateSelector";
import AvailableSlots               from "../components/AvailableSlots";
import ReasonForVisit               from "../components/ReasonForVisit";
import ActionButtons                from "../components/ActionButtons";
import Navbar                       from "../components/Navbar";

export default function AppointmentPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const doctorId        = location.state?.doctorId;
  const preselectedDay  = location.state?.selectedDay;
  const preselectedSlot = location.state?.selectedSlot;

  const [selectedDate, setSelectedDate] = useState(
    preselectedDay?.dateObj ? new Date(preselectedDay.dateObj) : null
  );
  const [selectedTime, setSelectedTime] = useState(preselectedSlot || null);
  const [reason,       setReason]       = useState("");

  if (!doctorId) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F6FAFF]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center py-24">
          <p className="text-5xl mb-4">🩺</p>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">No Doctor Selected</h2>
          <p className="text-gray-400 text-sm mb-6">Please select a doctor first.</p>
          <button
            onClick={() => navigate("/doctors")}
            className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm hover:bg-blue-700 transition"
          >
            Browse Doctors
          </button>
        </div>
      </div>
    );
  }

  const handleConfirm = () => {
    if (!selectedDate) { alert("Please select a date."); return; }
    if (!selectedTime) { alert("Please select a time slot."); return; }

    navigate("/appointments/review", {
      state: {
        doctorId,
        date:   selectedDate.toISOString(),
        time:   selectedTime,
        reason,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#F6FAFF]">
      <Navbar />
      <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 space-y-8 my-8 shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-blue-600 text-center">Book an Appointment</h1>

        <DoctorCard docId={doctorId} />

        <DateSelector
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        <AvailableSlots
          doctorId={doctorId}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onSelectTime={setSelectedTime}
        />

        <ReasonForVisit value={reason} onChange={setReason} />

        <ActionButtons onBack={() => navigate(-1)} onConfirm={handleConfirm} />
      </div>
    </div>
  );
}