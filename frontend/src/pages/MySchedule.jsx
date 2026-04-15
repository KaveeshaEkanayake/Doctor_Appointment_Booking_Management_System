import React, { useEffect, useState } from "react";
import DoctorLayout from "../layouts/DoctorLayout";
import doctorprofile from "../assets/doctorprofile.jpg";
import { FaCalendarAlt, FaBell } from "react-icons/fa";

const TIME_SLOTS = Array.from({ length: 8 }, (_, i) => 8 + i); // 8:00 to 15:00

export default function MyAvailability() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Block Slot modal state
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [blockForm, setBlockForm] = useState({
    day: 0,
    time: 8,
    duration: 1,
    reason: "",
  });
  const [blockError, setBlockError] = useState("");

  useEffect(() => {
    const start = new Date(currentDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
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
    setAppointments([
      {
        id: 1,
        day: 0,
        time: 9,
        name: "Nimali Rathnayake",
        status: "Confirmed",
        reason: "Annual Checkup",
        notes: "Discuss recent lab results and update medication plan.",
      },
    ]);
  }, []);

  const changeWeek = (dir) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + dir * 7);
    setCurrentDate(d);
  };

  const handleSave = () => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === selected.id ? selected : a))
    );
    setEditMode(false);
    setSelected(null);
  };

  // Check if a slot is already booked or blocked
  const isSlotOccupied = (day, time) => {
    const hasAppointment = appointments.some(
      (a) => a.day === day && a.time === time
    );
    const hasBlock = blockedSlots.some(
      (b) =>
        b.day === day &&
        time >= b.time &&
        time < b.time + b.duration
    );
    return hasAppointment || hasBlock;
  };

  const handleBlockSubmit = () => {
    setBlockError("");

    // Validate reason
    if (!blockForm.reason.trim()) {
      setBlockError("Please enter a reason for blocking this slot.");
      return;
    }

    // Check for conflicts across all hours covered by the duration
    for (let i = 0; i < blockForm.duration; i++) {
      const hour = blockForm.time + i;
      if (isSlotOccupied(blockForm.day, hour)) {
        setBlockError(
          `Slot at ${hour}:00 on ${weekDates[blockForm.day]?.toLocaleDateString(
            "en-US",
            { weekday: "long" }
          )} is already occupied.`
        );
        return;
      }
    }

    const newBlock = {
      id: Date.now(),
      day: blockForm.day,
      time: blockForm.time,
      duration: blockForm.duration,
      reason: blockForm.reason,
    };

    setBlockedSlots((prev) => [...prev, newBlock]);
    setShowBlockModal(false);
    setBlockForm({ day: 0, time: 8, duration: 1, reason: "" });
  };

  const handleUnblock = (blockId) => {
    setBlockedSlots((prev) => prev.filter((b) => b.id !== blockId));
  };

  // Get the block that starts at a given cell
  const getBlockAt = (col, hour) =>
    blockedSlots.find((b) => b.day === col && b.time === hour);

  // Check if a cell is a continuation of a multi-hour block (not the first hour)
  const isContinuation = (col, hour) =>
    blockedSlots.some(
      (b) => b.day === col && hour > b.time && hour < b.time + b.duration
    );

  return (
    <DoctorLayout>
      <div className="p-4 sm:p-6 md:p-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">My Schedule</h1>

          {/* Right: Icons + Profile */}
          <div className="flex items-center gap-4">
            {/* Calendar */}
            <button
              onClick={() => navigate("/doctor/schedule")} // ✅ direct to calendar page
              className="p-2 rounded-full hover:bg-gray-100 transition"
            >
              <FaCalendarAlt className="text-xl" />
            </button>

            {/* Notifications */}
            <button
              onClick={() => navigate("/doctor/notifications")} // ✅ direct to notifications page
              className="relative p-2 rounded-full hover:bg-gray-100 transition"
            >
              <FaBell className="text-xl" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile */}
            <div
              onClick={() => navigate("/doctor/profile")} // ✅ direct to profile page
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-lg transition"
            >
              <img
                src={doctorprofile}
                alt="profile"
                className="w-8 h-8 rounded-full object-cover border"
              />
            </div>
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => changeWeek(-1)}>◀</button>
            <span>
              {weekDates[0]?.toDateString()} - {weekDates[6]?.toDateString()}
            </span>
            <button onClick={() => changeWeek(1)}>▶</button>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* <button
              className="px-3 py-1 border rounded text-sm hover:bg-gray-100"
              onClick={() => changeWeek(0)}
            >
              Week
            </button> */}

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
              onClick={() => navigate("/doctor/availability")} // ✅ direct to page
            >
              Edit Availability
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white border rounded overflow-x-auto">
          <div className="grid grid-cols-7 border-b text-center text-sm font-medium">
            {weekDates.map((d, i) => (
              <div key={i} className="p-2">
                {d.toLocaleDateString("en-US", { weekday: "long" })}
              </div>
            ))}
          </div>

          {TIME_SLOTS.map((hour, row) => (
            <div key={row} className="grid grid-cols-7 border-b">
              {weekDates.map((_, col) => {
                const items = appointments.filter(
                  (a) => a.day === col && a.time === hour
                );
                const block = getBlockAt(col, hour);
                const continuation = isContinuation(col, hour);

                return (
                  <div
                    key={col}
                    className={`h-24 border-r relative p-1 text-xs ${continuation ? "bg-red-50" : ""
                      }`}
                  >
                    {!continuation && (
                      <span className="absolute top-1 left-1 text-gray-400 text-[10px]">
                        {hour}:00
                      </span>
                    )}

                    {/* Blocked slot indicator */}
                    {block && (
                      <div
                        className="mt-4 p-2 rounded border-l-4 bg-red-100 cursor-pointer border-red-500 group"
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

                    {/* Appointment cards */}
                    {items.map((a) => (
                      <div
                        key={a.id}
                        onClick={() => setSelected(a)}
                        className="mt-4 p-2 rounded border-l-4 bg-gray-100 cursor-pointer border-blue-500"
                      >
                        <p className="font-medium truncate">{a.name}</p>
                        <p className="text-[10px]">{a.status}</p>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* BLOCK SLOT MODAL  */}
        {showBlockModal && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white w-[90%] max-w-md rounded-xl shadow-lg">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-lg font-bold">Block a Time Slot</h2>
                <button
                  onClick={() => setShowBlockModal(false)}
                  className="text-gray-500 hover:text-black"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 space-y-4 text-sm">
                {/* Day selector */}
                <div>
                  <label className="block font-medium mb-1">Day</label>
                  <select
                    value={blockForm.day}
                    onChange={(e) =>
                      setBlockForm({ ...blockForm, day: parseInt(e.target.value) })
                    }
                    className="w-full border rounded p-2"
                  >
                    {weekDates.map((d, i) => (
                      <option key={i} value={i}>
                        {d.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "short",
                          day: "numeric",
                        })}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Start time selector */}
                <div>
                  <label className="block font-medium mb-1">Start Time</label>
                  <select
                    value={blockForm.time}
                    onChange={(e) =>
                      setBlockForm({ ...blockForm, time: parseInt(e.target.value) })
                    }
                    className="w-full border rounded p-2"
                  >
                    {TIME_SLOTS.map((h) => (
                      <option key={h} value={h}>
                        {h}:00
                      </option>
                    ))}
                  </select>
                </div>

                {/* Duration selector */}
                <div>
                  <label className="block font-medium mb-1">Duration</label>
                  <select
                    value={blockForm.duration}
                    onChange={(e) =>
                      setBlockForm({
                        ...blockForm,
                        duration: parseInt(e.target.value),
                      })
                    }
                    className="w-full border rounded p-2"
                  >
                    {[1, 2, 3, 4].map((h) => (
                      <option key={h} value={h}>
                        {h} hour{h > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reason input */}
                <div>
                  <label className="block font-medium mb-1">
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lunch break, Personal, Meeting…"
                    value={blockForm.reason}
                    onChange={(e) =>
                      setBlockForm({ ...blockForm, reason: e.target.value })
                    }
                    className="w-full border rounded p-2"
                  />
                </div>

                {/* Error message */}
                {blockError && (
                  <p className="text-red-600 text-xs">{blockError}</p>
                )}

                {/* Preview summary */}
                {weekDates.length > 0 && (
                  <div className="bg-gray-50 border rounded p-3 text-xs text-gray-600">
                    <strong>Preview:</strong> Blocking{" "}
                    {weekDates[blockForm.day]?.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    from {blockForm.time}:00 to{" "}
                    {blockForm.time + blockForm.duration}:00
                    {blockForm.reason && ` — "${blockForm.reason}"`}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 p-4 border-t">
                <button
                  onClick={() => setShowBlockModal(false)}
                  className="px-4 py-1 bg-gray-200 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBlockSubmit}
                  className="px-4 py-1 bg-black text-white rounded hover:opacity-90"
                >
                  Block Slot
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── APPOINTMENT DETAIL MODAL ── */}
        {selected && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white w-[90%] max-w-lg rounded-xl shadow-lg">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-lg font-bold">Appointment Details</h2>
                <button onClick={() => setSelected(null)}>✕</button>
              </div>

              <div className="p-4 space-y-4 text-sm">
                <p>
                  <strong>Patient :</strong>{" "}
                  {editMode ? (
                    <input
                      value={selected.name}
                      onChange={(e) =>
                        setSelected({ ...selected, name: e.target.value })
                      }
                      className="border p-1 ml-2"
                    />
                  ) : (
                    selected.name
                  )}
                </p>

                <p>
                  <strong>Date :</strong> Wednesday, April 8, 2026 |{" "}
                  {selected.time}:00
                </p>

                <p>
                  <strong>Reason :</strong>{" "}
                  {editMode ? (
                    <input
                      value={selected.reason}
                      onChange={(e) =>
                        setSelected({ ...selected, reason: e.target.value })
                      }
                      className="border p-1 ml-2"
                    />
                  ) : (
                    selected.reason
                  )}
                </p>

                <div>
                  <strong>Notes :</strong>
                  {editMode ? (
                    <textarea
                      value={selected.notes}
                      onChange={(e) =>
                        setSelected({ ...selected, notes: e.target.value })
                      }
                      className="border p-2 w-full mt-2"
                    />
                  ) : (
                    <ul className="list-disc ml-6 mt-2">
                      <li>{selected.notes}</li>
                    </ul>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 p-4 border-t">
                <button
                  onClick={() => setSelected(null)}
                  className="px-4 py-1 bg-gray-200 rounded"
                >
                  Close
                </button>

                {editMode ? (
                  <button
                    onClick={handleSave}
                    className="px-4 py-1 bg-blue-600 text-white rounded"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-4 py-1 bg-blue-600 text-white rounded"
                  >
                    Edit Appointment
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DoctorLayout>
  );
}