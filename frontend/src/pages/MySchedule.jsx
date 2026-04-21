import React, { useEffect, useState } from "react";
import DoctorLayout from "../layouts/DoctorLayout";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const TIME_SLOTS = Array.from({ length: 11 }, (_, i) => 8 + i);

const formatHourLabel = (hour) => {
  if (hour === 12) return "12:00 PM";
  if (hour < 12)  return `${hour}:00 AM`;
  return `${hour - 12}:00 PM`;
};

export default function MySchedule()  {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate]       = useState(new Date());
  const [weekDates, setWeekDates]           = useState([]);
  const [appointments, setAppointments]     = useState([]);
  const [blockedSlots, setBlockedSlots]     = useState([]);
  const [selected, setSelected]             = useState(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockForm, setBlockForm]           = useState({ day: 0, time: 8, duration: 1, reason: "" });
  const [blockError, setBlockError]         = useState("");
  const [loading, setLoading]               = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const start  = new Date(currentDate);
    const day    = start.getDay();
    const diff   = start.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(start.setDate(diff));
    let week = [];
    for (let i = 0; i < 7; i++) {
      let d = new Date(monday);
      d.setDate(monday.getDate() + i);
      week.push(d);
    }
    setWeekDates(week);
  }, [currentDate]);

  useEffect(() => {
    if (weekDates.length === 0) return;
    fetchSchedule();
  }, [weekDates]);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const startDate = formatDate(weekDates[0]);
      const endDate   = formatDate(weekDates[6]);
      const res = await axios.get(
        `${API}/api/doctor/schedule?startDate=${startDate}&endDate=${endDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppointments(res.data.appointments || []);
      setBlockedSlots(res.data.blockedSlots || []);
    } catch (err) {
      console.error("Failed to fetch schedule:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    const year  = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day   = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const changeWeek = (dir) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + dir * 7);
    setCurrentDate(d);
  };

  const getAppointmentsAt = (col, hour) => {
    const cellDate = weekDates[col];
    if (!cellDate) return [];
    const dateStr = formatDate(cellDate);

    return appointments.filter((a) => {
      const apptDate = formatDate(new Date(a.date));
      if (apptDate !== dateStr) return false;

      const timeStr = a.time.trim();
      let apptHour;

      if (timeStr.includes("AM") || timeStr.includes("PM")) {
        const [time, period] = timeStr.split(" ");
        const [h] = time.split(":");
        apptHour = parseInt(h);
        if (period === "PM" && apptHour !== 12) apptHour += 12;
        if (period === "AM" && apptHour === 12) apptHour = 0;
      } else {
        apptHour = parseInt(timeStr.split(":")[0]);
      }

      return apptHour === hour;
    });
  };

  const getBlockAt = (col, hour) => {
    const cellDate = weekDates[col];
    if (!cellDate) return null;
    const dateStr = formatDate(cellDate);
    const hourStr = `${String(hour).padStart(2, "0")}:00`;
    return blockedSlots.find((b) => {
      const blockDate = formatDate(new Date(b.date));
      return blockDate === dateStr && b.startTime === hourStr;
    });
  };

  const isContinuation = (col, hour) => {
    const cellDate = weekDates[col];
    if (!cellDate) return false;
    const dateStr = formatDate(cellDate);
    return blockedSlots.some((b) => {
      const blockDate = formatDate(new Date(b.date));
      const startHour = parseInt(b.startTime.split(":")[0]);
      const endHour   = parseInt(b.endTime.split(":")[0]);
      return blockDate === dateStr && hour > startHour && hour < endHour;
    });
  };

  const handleBlockSubmit = async () => {
    setBlockError("");
    if (!blockForm.reason.trim()) {
      setBlockError("Please enter a reason for blocking this slot.");
      return;
    }
    const cellDate  = weekDates[blockForm.day];
    const dateStr   = formatDate(cellDate);
    const startTime = `${String(blockForm.time).padStart(2, "0")}:00`;
    const endTime   = `${String(blockForm.time + blockForm.duration).padStart(2, "0")}:00`;
    try {
      await axios.post(
        `${API}/api/doctor/schedule/block`,
        { date: dateStr, startTime, endTime, reason: blockForm.reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowBlockModal(false);
      setBlockForm({ day: 0, time: 8, duration: 1, reason: "" });
      await fetchSchedule();
    } catch (err) {
      setBlockError(err.response?.data?.message || "Failed to block slot. Please try again.");
    }
  };

  const handleUnblock = async (blockId) => {
    try {
      await axios.delete(
        `${API}/api/doctor/schedule/block/${blockId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchSchedule();
    } catch (err) {
      console.error("Failed to unblock:", err);
    }
  };

  const getStatusStyle = (status) => {
    if (status === "CONFIRMED") return "border-green-500 bg-green-50";
    if (status === "PENDING")   return "border-blue-500 bg-blue-50";
    if (status === "COMPLETED") return "border-gray-400 bg-gray-50";
    return "border-blue-500 bg-gray-100";
  };

  return (
    <DoctorLayout>
      <div className="p-4 sm:p-6 md:p-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">My Schedule</h1>
        </div>

        {/* Controls Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => changeWeek(-1)} className="p-1 hover:bg-gray-100 rounded">◀</button>
            <span className="text-sm font-medium">
              {weekDates[0]?.toLocaleDateString("en-US", { month: "short", day: "numeric" })} –{" "}
              {weekDates[6]?.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
            <button onClick={() => changeWeek(1)} className="p-1 hover:bg-gray-100 rounded">▶</button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              className="px-3 py-1 bg-black text-white rounded text-sm hover:opacity-90"
              onClick={() => {
                setBlockError("");
                setBlockForm({ day: 0, time: 8, duration: 1, reason: "" });
                setShowBlockModal(true);
              }}
            >
              + Block Slot
            </button>
            <button
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              onClick={() => navigate("/doctor/availability")}
            >
              Edit Availability
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white border rounded overflow-x-auto">
          <div className="grid grid-cols-7 border-b text-center text-sm font-medium">
            {weekDates.map((d, i) => (
              <div key={i} className="p-2 border-r last:border-r-0">
                <p>{d.toLocaleDateString("en-US", { weekday: "short" })}</p>
                <p className="text-xs text-gray-400">
                  {d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20 text-gray-400">
              Loading schedule...
            </div>
          ) : (
            TIME_SLOTS.map((hour, row) => (
              <div key={row} className="grid grid-cols-7 border-b last:border-b-0">
                {weekDates.map((_, col) => {
                  const items        = getAppointmentsAt(col, hour);
                  const block        = getBlockAt(col, hour);
                  const continuation = isContinuation(col, hour);

                  return (
                    <div
                      key={col}
                      className={`h-24 border-r last:border-r-0 relative p-1 text-xs ${continuation ? "bg-red-50" : ""}`}
                    >
                      {!continuation && (
                        <span className="absolute top-1 left-1 text-gray-400 text-[10px]">
                          {formatHourLabel(hour)}
                        </span>
                      )}

                      {block && (
                        <div
                          className="mt-4 p-2 rounded border-l-4 bg-red-100 border-red-500 group cursor-pointer"
                          title={`Blocked: ${block.reason}`}
                        >
                          <p className="font-medium truncate text-red-700">Blocked</p>
                          <p className="text-[10px] text-red-500 truncate">{block.reason}</p>
                          <button
                            onClick={() => handleUnblock(block.id)}
                            className="text-[10px] text-red-600 underline mt-1 hidden group-hover:block"
                          >
                            Unblock
                          </button>
                        </div>
                      )}

                      {items.map((a) => (
                        <div
                          key={a.id}
                          onClick={() => setSelected(a)}
                          className={`mt-4 p-2 rounded border-l-4 cursor-pointer ${getStatusStyle(a.status)}`}
                        >
                          <p className="font-medium truncate">{a.patientName}</p>
                          <p className="text-[10px] capitalize">{a.status.toLowerCase()}</p>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* BLOCK SLOT MODAL */}
        {showBlockModal && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white w-[90%] max-w-md rounded-xl shadow-lg">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-lg font-bold">Block a Time Slot</h2>
                <button onClick={() => setShowBlockModal(false)} className="text-gray-500 hover:text-black">✕</button>
              </div>

              <div className="p-4 space-y-4 text-sm">
                <div>
                  <label className="block font-medium mb-1">Day</label>
                  <select
                    value={blockForm.day}
                    onChange={(e) => setBlockForm({ ...blockForm, day: parseInt(e.target.value) })}
                    className="w-full border rounded p-2"
                  >
                    {weekDates.map((d, i) => (
                      <option key={i} value={i}>
                        {d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-1">Start Time</label>
                  <select
                    value={blockForm.time}
                    onChange={(e) => setBlockForm({ ...blockForm, time: parseInt(e.target.value) })}
                    className="w-full border rounded p-2"
                  >
                    {TIME_SLOTS.map((h) => (
                      <option key={h} value={h}>{formatHourLabel(h)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-1">Duration</label>
                  <select
                    value={blockForm.duration}
                    onChange={(e) => setBlockForm({ ...blockForm, duration: parseInt(e.target.value) })}
                    className="w-full border rounded p-2"
                  >
                    {[1, 2, 3, 4].map((h) => (
                      <option key={h} value={h}>{h} hour{h > 1 ? "s" : ""}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-1">
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lunch break, Personal, Meeting…"
                    value={blockForm.reason}
                    onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                    className="w-full border rounded p-2"
                  />
                </div>

                {blockError && <p className="text-red-600 text-xs">{blockError}</p>}

                {weekDates.length > 0 && (
                  <div className="bg-gray-50 border rounded p-3 text-xs text-gray-600">
                    <strong>Preview:</strong> Blocking{" "}
                    {weekDates[blockForm.day]?.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}{" "}
                    from {formatHourLabel(blockForm.time)} to {formatHourLabel(blockForm.time + blockForm.duration)}
                    {blockForm.reason && ` — "${blockForm.reason}"`}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 p-4 border-t">
                <button onClick={() => setShowBlockModal(false)} className="px-4 py-1 bg-gray-200 rounded">Cancel</button>
                <button onClick={handleBlockSubmit} className="px-4 py-1 bg-black text-white rounded hover:opacity-90">Block Slot</button>
              </div>
            </div>
          </div>
        )}

        {/* APPOINTMENT DETAIL MODAL */}
        {selected && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white w-[90%] max-w-lg rounded-xl shadow-lg">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-lg font-bold">Appointment Details</h2>
                <button onClick={() => setSelected(null)}>✕</button>
              </div>

              <div className="p-4 space-y-4 text-sm">
                <p><strong>Patient :</strong> <span className="text-blue-600 ml-1">{selected.patientName}</span></p>
                <p>
                  <strong>Date :</strong>{" "}
                  {new Date(selected.date).toLocaleDateString("en-US", {
                    weekday: "long", year: "numeric", month: "long", day: "numeric"
                  })}{" "}
                  | {selected.time}
                </p>
                <p><strong>Reason :</strong> <span className="ml-1">{selected.reason || "—"}</span></p>
                <p><strong>Status :</strong> <span className="ml-1 capitalize">{selected.status?.toLowerCase()}</span></p>
                {selected.notes && (
                  <div>
                    <strong>Notes :</strong>
                    <ul className="list-disc ml-6 mt-2">
                      <li>{selected.notes}</li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 p-4 border-t">
                <button
                  onClick={() => setSelected(null)}
                  className="px-4 py-1 bg-gray-200 rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DoctorLayout>
  );
}