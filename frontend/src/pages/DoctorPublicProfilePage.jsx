import React, { useState, useEffect } from "react";
import { useParams, useNavigate }      from "react-router-dom";
import axios                           from "axios";
import Navbar                          from "../components/Navbar";
import Footer                          from "../components/Footer";
import { AiOutlineLoading3Quarters }   from "react-icons/ai";
import {
  FiCheckCircle, FiCalendar,
  FiClock, FiAward, FiBookOpen
} from "react-icons/fi";

const API = import.meta.env.VITE_API_URL;

const DAYS     = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const DAY_FULL = {
  MON: "MONDAY", TUE: "TUESDAY", WED: "WEDNESDAY",
  THU: "THURSDAY", FRI: "FRIDAY", SAT: "SATURDAY", SUN: "SUNDAY"
};

const getStars = (id) => {
  const ratings = [3, 4, 5, 4, 5, 3, 4, 5, 4, 3];
  return ratings[id % ratings.length] || 4;
};

const StarRating = ({ count }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <span key={star} className={`text-lg ${star <= count ? "text-yellow-400" : "text-gray-200"}`}>
        ★
      </span>
    ))}
  </div>
);

const generateTimeSlots = (startTime, endTime, duration = 30) => {
  const slots = [];
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH,   endM]   = endTime.split(":").map(Number);
  let current = startH * 60 + startM;
  const end   = endH   * 60 + endM;
  while (current + duration <= end) {
    const h    = Math.floor(current / 60);
    const m    = current % 60;
    const ampm = h >= 12 ? "PM" : "AM";
    const h12  = h % 12 || 12;
    slots.push(`${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`);
    current += duration;
  }
  return slots;
};

const getNext7Days = () => {
  const days  = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayAbbr = DAYS[d.getDay() === 0 ? 6 : d.getDay() - 1];
    days.push({ abbr: dayAbbr, full: DAY_FULL[dayAbbr], date: d.getDate() });
  }
  return days;
};

export default function DoctorPublicProfilePage() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [doctor,              setDoctor]              = useState(null);
  const [availability,        setAvailability]        = useState([]);
  const [appointmentDuration, setAppointmentDuration] = useState(30);
  const [loading,             setLoading]             = useState(true);
  const [error,               setError]               = useState("");
  const [selectedDay,         setSelectedDay]         = useState(null);
  const [selectedSlot,        setSelectedSlot]        = useState(null);

  const token     = localStorage.getItem("token");
  const role      = localStorage.getItem("role");
  const next7Days = getNext7Days();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [docRes, availRes] = await Promise.all([
          axios.get(`${API}/api/doctors/${id}`),
          axios.get(`${API}/api/doctors/${id}/availability`),
        ]);

        setDoctor(docRes.data.doctor);

        const availabilityData = availRes.data.availability ?? [];
        setAvailability(availabilityData);
        setAppointmentDuration(availRes.data.appointmentDuration ?? 30);

        const firstAvail = next7Days.find((d) =>
          availabilityData.some((a) => a.day === d.full)
        );
        if (firstAvail) setSelectedDay(firstAvail);
      } catch {
        setError("Failed to load doctor profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleBookAppointment = () => {
    if (!token)            { navigate("/login"); return; }
    if (role === "doctor") { alert("Please use a patient account to book appointments."); return; }
    if (role === "admin")  { alert("Admins cannot book appointments."); return; }
    if (!selectedSlot)     { alert("Please select a time slot first."); return; }
    navigate("/appointments/book", { state: { doctorId: id, selectedDay, selectedSlot } });
  };

  const slotsForDay = selectedDay
    ? availability
        .filter((a) => a.day === selectedDay.full)
        .flatMap((a) => generateTimeSlots(a.startTime, a.endTime, appointmentDuration))
    : [];

  const dayHasSlots = (dayFull) =>
    availability.some((a) => a.day === dayFull);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-gray-400 gap-2">
          <AiOutlineLoading3Quarters className="animate-spin text-2xl" />
          <span>Loading doctor profile...</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center py-24">
          <p className="text-5xl mb-4">🩺</p>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Doctor Not Found</h2>
          <p className="text-gray-400 text-sm mb-6">{error || "This doctor profile is not available."}</p>
          <button
            onClick={() => navigate("/doctors")}
            className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition"
          >
            Back to Doctors
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const stars = getStars(doctor.id);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* ── Hero header with wave blobs ── */}
      <div className="relative bg-gradient-to-b from-blue-50 to-white overflow-hidden">

        {/* Left wave blob */}
        <div className="absolute left-0 top-0 w-48 h-32 opacity-40">
          <svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,0 C40,20 80,0 120,30 C160,60 180,100 200,120 L200,0 Z" fill="#BFDBFE" />
          </svg>
        </div>

        {/* Right wave blob */}
        <div className="absolute right-0 top-0 w-48 h-32 opacity-40">
          <svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
            <path d="M200,0 C160,20 120,0 80,30 C40,60 20,100 0,120 L0,0 Z" fill="#BFDBFE" />
          </svg>
        </div>

        {/* Decorative dots */}
        <div className="absolute top-6  left-32  w-2 h-2 rounded-full bg-blue-300 opacity-50" />
        <div className="absolute top-16 left-12  w-1.5 h-1.5 rounded-full bg-blue-200 opacity-40" />
        <div className="absolute top-8  right-32 w-2 h-2 rounded-full bg-blue-300 opacity-50" />
        <div className="absolute top-20 right-16 w-1.5 h-1.5 rounded-full bg-blue-200 opacity-40" />
        <div className="absolute top-4  left-1/2 w-1.5 h-1.5 rounded-full bg-blue-200 opacity-30" />
        <div className="absolute top-20 left-2/3 w-2 h-2 rounded-full bg-blue-300 opacity-30" />

        <div className="relative max-w-6xl mx-auto px-6 py-10 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-4">
            <button
              onClick={() => navigate("/")}
              className="hover:text-blue-600 transition"
              aria-label="Home"
            >
              🏠
            </button>
            <span>›</span>
            <span className="text-gray-600">Doctor Profile</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Doctor Profile</h1>
        </div>
      </div>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">

        {/* ── Profile card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8">

            {/* Photo */}
            <div className="flex-shrink-0">
              {doctor.profilePhoto ? (
                <img
                  src={doctor.profilePhoto}
                  alt={`Dr. ${doctor.firstName}`}
                  className="w-44 h-52 rounded-2xl object-cover border border-gray-100 shadow-sm"
                />
              ) : (
                <div className="w-44 h-52 rounded-2xl bg-blue-50 flex items-center justify-center text-7xl font-bold text-blue-200 border border-blue-100">
                  {doctor.firstName?.[0]}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <p className="text-blue-600 text-sm font-semibold mb-1">✦ Medical Professional</p>
              <h2 className="text-3xl font-bold text-gray-800 mb-3">
                Dr. {doctor.firstName} {doctor.lastName}
              </h2>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-blue-50 text-blue-600 text-sm font-medium px-3 py-1 rounded-full border border-blue-100">
                  {doctor.specialisation}
                </span>
                {doctor.qualifications && (
                  <span className="bg-gray-50 text-gray-600 text-sm font-medium px-3 py-1 rounded-full border border-gray-200">
                    {doctor.qualifications}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <StarRating count={stars} />
                  <span className="text-sm text-gray-500">{stars}.0 (2,450+ Reviews)</span>
                </div>
                <span className="text-gray-200">|</span>
                <div className="flex items-center gap-1 text-sm text-blue-600 font-medium">
                  <FiCheckCircle className="text-base" />
                  Verified Profile
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                {doctor.qualifications && (
                  <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-4 py-2.5">
                    <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <FiBookOpen className="text-blue-500 text-xs" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">Qualifications</p>
                      <p className="text-xs font-semibold text-gray-700">{doctor.qualifications}</p>
                    </div>
                  </div>
                )}
                {doctor.experience && (
                  <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-4 py-2.5">
                    <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <FiAward className="text-blue-500 text-xs" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">Experience</p>
                      <p className="text-xs font-semibold text-gray-700">{doctor.experience}</p>
                    </div>
                  </div>
                )}
                {doctor.consultationFee && (
                  <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-4 py-2.5">
                    <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <span className="text-blue-500 text-[10px] font-bold">Rs</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">Consultation Fee</p>
                      <p className="text-xs font-semibold text-gray-700">Rs {doctor.consultationFee}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── About + Education ── */}
        <div className="bg-gray-50 rounded-2xl border border-gray-100 shadow-sm p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 mb-4">About the Doctor</h3>
              {doctor.bio ? (
                <p className="text-gray-600 text-sm leading-relaxed">{doctor.bio}</p>
              ) : (
                <p className="text-gray-400 text-sm">No bio available.</p>
              )}
            </div>

            <div className="hidden md:block w-px bg-gray-200" />

            <div className="w-full md:w-72">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Education & Honors</h3>
              {doctor.qualifications ? (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 border border-blue-100">
                    <FiAward className="text-blue-500 text-sm" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Qualifications</p>
                    <p className="text-xs text-gray-400">{doctor.qualifications}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No education info available.</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Appointment + CTA ── */}
        <div className="flex flex-col md:flex-row gap-6">

          <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-2">
              <FiCalendar className="text-sm" /> Appointment
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">Available Time Slots</h3>
            <p className="text-gray-400 text-sm mb-5">
              Select a slot and click Book Appointment to secure your visit.
            </p>

            {/* Day selector */}
            <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
              {next7Days.map((d) => {
                const hasSlots   = dayHasSlots(d.full);
                const isSelected = selectedDay?.abbr === d.abbr;
                return (
                  <button
                    key={d.abbr}
                    onClick={() => {
                      if (!hasSlots) return;
                      setSelectedDay(d);
                      setSelectedSlot(null);
                    }}
                    disabled={!hasSlots}
                    className={`flex flex-col items-center px-3 py-2 rounded-xl text-xs font-semibold min-w-[52px] transition ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-sm"
                        : hasSlots
                        ? "bg-white text-gray-700 hover:bg-blue-50 border border-gray-200"
                        : "bg-white text-gray-300 cursor-not-allowed border border-gray-100"
                    }`}
                  >
                    <span className="text-[10px] font-medium">{d.abbr}</span>
                    <span className="text-lg font-bold">{d.date}</span>
                  </button>
                );
              })}
            </div>

            {/* Time slots */}
            {selectedDay && slotsForDay.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-5">
                {slotsForDay.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`px-2 py-2 rounded-lg text-xs font-medium border transition ${
                      selectedSlot === slot
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400 text-sm mb-5 bg-white rounded-xl border border-gray-200">
                {selectedDay
                  ? "No slots available for this day."
                  : "Please select a day to see available slots."}
              </div>
            )}

            {/* Note */}
            <div className="bg-white rounded-xl px-4 py-3 text-xs text-gray-500 mb-5 flex items-start gap-2 border border-gray-200">
              <FiClock className="flex-shrink-0 mt-0.5 text-gray-400" />
              Note: You will be prompted to Register / Log in to complete your booking.
              A confirmation email will be sent once the doctor approves the request.
            </div>

            <button
              onClick={handleBookAppointment}
              className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
            >
              Confirm & Book Appointment
            </button>
          </div>

          {/* CTA card */}
          <div className="w-full md:w-72 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3 leading-snug">
                Experience Better Care with{" "}
                <span className="text-blue-600">MediCare</span> Today
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Join over 50,000+ patients who trust us for their healthcare needs.
                Personalized, accessible, and high-quality care is just a click away.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/doctors")}
                className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
              >
                Meet Our Doctors
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="w-full bg-white text-gray-700 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition"
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}