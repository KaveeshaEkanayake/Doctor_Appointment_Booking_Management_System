import React, { useState, useEffect } from "react";
import axios from "axios";
import DoctorLayout from "../layouts/DoctorLayout";
import { FiPlus, FiTrash2 } from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL;

const DAYS = [
  { key: "MONDAY", label: "Monday" },
  { key: "TUESDAY", label: "Tuesday" },
  { key: "WEDNESDAY", label: "Wednesday" },
  { key: "THURSDAY", label: "Thursday" },
  { key: "FRIDAY", label: "Friday" },
  { key: "SATURDAY", label: "Saturday" },
  { key: "SUNDAY", label: "Sunday" },
];

const DURATIONS = [15, 30, 60];

const DEFAULT_SLOT = { startTime: "09:00", endTime: "17:00" };

export default function DoctorAvailabilityPage() {
  const [daySlots, setDaySlots] = useState(() => {
    const initial = {};
    DAYS.forEach((d) => {
      initial[d.key] = { isActive: false, slots: [{ ...DEFAULT_SLOT }] };
    });
    return initial;
  });

  const [appointmentDuration, setAppointmentDuration] = useState(30);
  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [availRes, profileRes] = await Promise.all([
        axios.get(`${API_URL}/api/doctor/availability`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/doctor/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Set profile info
      const doctor = profileRes.data.doctor;
      setDoctorName(doctor.firstName || "");
      setProfilePhoto(doctor.profilePhoto || "");

      // Set availability
      const { availability, appointmentDuration: duration } = availRes.data;

      const newDaySlots = {};
      DAYS.forEach((d) => {
        const dayAvailability = availability.filter((a) => a.day === d.key);
        if (dayAvailability.length > 0) {
          newDaySlots[d.key] = {
            isActive: dayAvailability.some((a) => a.isActive),
            slots: dayAvailability.map((a) => ({
              startTime: a.startTime,
              endTime: a.endTime,
            })),
          };
        } else {
          newDaySlots[d.key] = {
            isActive: false,
            slots: [{ ...DEFAULT_SLOT }],
          };
        }
      });

      setDaySlots(newDaySlots);
      setAppointmentDuration(duration || 30);
      setOriginalData({
        daySlots: JSON.parse(JSON.stringify(newDaySlots)),
        appointmentDuration: duration || 30,
      });
    } catch (err) {
      setStatusMessage("Failed to load availability");
      setStatusType("error");
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (dayKey) => {
    setDaySlots((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        isActive: !prev[dayKey].isActive,
      },
    }));
  };

  const updateSlotTime = (dayKey, slotIndex, field, value) => {
    setDaySlots((prev) => {
      const updated = { ...prev };
      const slots = [...updated[dayKey].slots];
      slots[slotIndex] = { ...slots[slotIndex], [field]: value };
      updated[dayKey] = { ...updated[dayKey], slots };
      return updated;
    });
  };

  const addSlot = (dayKey) => {
    setDaySlots((prev) => {
      const updated = { ...prev };
      const lastSlot = updated[dayKey].slots[updated[dayKey].slots.length - 1];
      updated[dayKey] = {
        ...updated[dayKey],
        slots: [
          ...updated[dayKey].slots,
          { startTime: lastSlot.endTime, endTime: "18:00" },
        ],
      };
      return updated;
    });
  };

  const removeSlot = (dayKey, slotIndex) => {
    setDaySlots((prev) => {
      const updated = { ...prev };
      const slots = updated[dayKey].slots.filter((_, i) => i !== slotIndex);
      updated[dayKey] = {
        ...updated[dayKey],
        slots: slots.length > 0 ? slots : [{ ...DEFAULT_SLOT }],
      };
      return updated;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setStatusMessage("");

    const availability = [];
    DAYS.forEach((d) => {
      const day = daySlots[d.key];
      day.slots.forEach((slot) => {
        availability.push({
          day: d.key,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isActive: day.isActive,
        });
      });
    });

    try {
      await axios.put(
        `${API_URL}/api/doctor/availability`,
        { availability, appointmentDuration },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOriginalData({
        daySlots: JSON.parse(JSON.stringify(daySlots)),
        appointmentDuration,
      });
      setStatusMessage("Availability updated successfully!");
      setStatusType("success");
    } catch (err) {
      if (err.response?.data?.message) {
        setStatusMessage(err.response.data.message);
      } else {
        setStatusMessage("Failed to update availability. Please try again.");
      }
      setStatusType("error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (originalData) {
      setDaySlots(JSON.parse(JSON.stringify(originalData.daySlots)));
      setAppointmentDuration(originalData.appointmentDuration);
      setStatusMessage("");
    }
  };

  const handleReset = () => {
    const resetSlots = {};
    DAYS.forEach((d) => {
      resetSlots[d.key] = { isActive: false, slots: [{ ...DEFAULT_SLOT }] };
    });
    setDaySlots(resetSlots);
    setAppointmentDuration(30);
    setStatusMessage("");
  };

  if (loading) {
    return (
      <DoctorLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 sm:mb-8">
          <div>
            <p className="text-gray-500 text-sm sm:text-base">
              Hi, Dr. {doctorName}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              My Availability
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-medium">
                  {doctorName?.[0]}
                </div>
              )}
            </div>
            <span className="text-sm font-medium text-gray-700">
              Dr. {doctorName}
            </span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 lg:p-8">
          {/* Weekly Availability */}
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Set Your Weekly Availability
          </h2>

          <div className="space-y-4 sm:space-y-5">
            {DAYS.map((day) => {
              const dayData = daySlots[day.key];
              return (
                <div key={day.key}>
                  {(dayData.isActive ? dayData.slots : [dayData.slots[0]]).map((slot, slotIndex) => (
                    <div
                      key={`${day.key}-${slotIndex}`}
                      className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 ${
                        slotIndex > 0 ? "mt-3 sm:ml-24" : ""
                      }`}
                    >
                      {slotIndex === 0 && (
                        <div className="flex items-center gap-3 w-full sm:w-32 shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleDay(day.key)}
                            className={`relative w-11 h-6 rounded-full transition-colors ${
                              dayData.isActive ? "bg-blue-600" : "bg-gray-300"
                            }`}
                            aria-label={`Toggle ${day.label}`}
                          >
                            <span
                              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                                dayData.isActive ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                          <span
                            className={`text-sm font-medium ${
                              dayData.isActive ? "text-gray-900" : "text-gray-400"
                            }`}
                          >
                            {day.label}
                          </span>
                        </div>
                      )}

                      {slotIndex > 0 && (
                        <div className="hidden sm:block w-32 shrink-0" />
                      )}

                      {dayData.isActive ? (
                        <div className="flex items-center gap-2 sm:gap-3 flex-1">
                          <input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) =>
                              updateSlotTime(day.key, slotIndex, "startTime", e.target.value)
                            }
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 w-32 sm:w-36"
                            aria-label={`${day.label} start time${slotIndex > 0 ? ` slot ${slotIndex + 1}` : ""}`}
                          />
                          <span className="text-sm text-gray-400">to</span>
                          <input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) =>
                              updateSlotTime(day.key, slotIndex, "endTime", e.target.value)
                            }
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 w-32 sm:w-36"
                            aria-label={`${day.label} end time${slotIndex > 0 ? ` slot ${slotIndex + 1}` : ""}`}
                          />

                          {dayData.slots.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSlot(day.key, slotIndex)}
                              className="text-red-400 hover:text-red-600 transition p-1"
                              aria-label={`Remove ${day.label} slot ${slotIndex + 1}`}
                            >
                              <FiTrash2 className="text-sm" />
                            </button>
                          )}

                          {slotIndex === dayData.slots.length - 1 && (
                            <button
                              type="button"
                              onClick={() => addSlot(day.key)}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 ml-auto transition whitespace-nowrap"
                              aria-label={`Add slot for ${day.label}`}
                            >
                              <FiPlus className="text-xs" />
                              Add Slot
                            </button>
                          )}
                        </div>
                      ) : (
                        slotIndex === 0 && (
                          <span className="text-sm text-gray-400 italic">
                            Unavailable
                          </span>
                        )
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 my-6 sm:my-8" />

          {/* Appointment Settings */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Appointment Settings
            </h2>
            <p className="text-sm text-gray-500 mb-4">Appointment Duration</p>
            <div className="flex gap-3">
              {DURATIONS.map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setAppointmentDuration(dur)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium border transition ${
                    appointmentDuration === dur
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {dur} mins
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 my-6 sm:my-8" />

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">
            <button
              type="button"
              onClick={handleReset}
              className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : null}
              Save Availability
            </button>
          </div>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`mt-4 sm:mt-6 p-3 sm:p-4 rounded-xl text-xs sm:text-sm text-center font-medium ${
              statusType === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {statusType === "success" && <span className="mr-2">✅</span>}
            {statusMessage}
          </div>
        )}
      </div>
    </DoctorLayout>
  );
}