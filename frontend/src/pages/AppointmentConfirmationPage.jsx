import React from "react";
import { useLocation } from "react-router-dom";
import AppointmentConfirmation from "../components/AppointmentConfirmation";

export default function AppointmentConfirmationPage() {
  const mockAppointment = {
    reason: "General Consultation",
    date: "October 24, 2023",
    time: "10:30 AM",
    provider: "Dr. Sarah Johnson",
  };

  return (
    <div>
      <AppointmentConfirmation  />
    </div>
  );
}
