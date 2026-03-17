import { useLocation } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DoctorCard from "../components/DoctorCard";
import DateSelector from "../components/DateSelector";
import AvailableSlots from "../components/AvailableSlots";
import ReasonForVisit from "../components/ReasonForVisit";
import ActionButtons from "../components/ActionButtons";

export default function AppointmentPage() {
  const navigate = useNavigate();

  const [selectedDoctor] = useState({
    id: 1,
    name: "Dr. Michael Brown",
    specialty: "Cardiologist • MD, FACC",
    imageUrl: "/assets/Doc01.png",
    status: "online",
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    navigate("/appointment-review", {
      state: {
        doctor: selectedDoctor,
        date: selectedDate,
        time: selectedTime,
        reason,
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl p-8 space-y-8">
      <h1 className="text-2xl font-bold text-blue-600 text-center">MediCare</h1>

      <DoctorCard doctor={selectedDoctor} />

      <DateSelector onSelectDate={setSelectedDate} />

      <AvailableSlots
        doctorId={selectedDoctor.id}
        selectedDate={selectedDate}
        onSelectTime={setSelectedTime}
      />

      <ReasonForVisit value={reason} onChange={setReason} />

      <ActionButtons onBack={() => navigate(-1)} onConfirm={handleConfirm} />
    </div>
  );
}

