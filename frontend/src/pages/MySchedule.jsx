import React, { useEffect, useState } from "react";
import DoctorLayout from "../layouts/DoctorLayout";
import doctorprofile from "../assets/doctorprofile.jpg";

export default function MyAvailability() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const start = new Date(currentDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(start.setDate(diff));

    let week = [];
    for (let i = 0; i < 5; i++) {
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

  return (
    <DoctorLayout>
      <div className="p-4 sm:p-6 md:p-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">My Schedule</h1>
        </div>

        {/* Controls Row (moved down) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">

          {/* Left: Week + Actions */}
          <div className="flex flex-wrap gap-2">
            <button className="px-3 py-1 border rounded text-sm hover:bg-gray-100" onClick={() => changeWeek(0)}>
              Week
            </button>

            <button
              className="px-3 py-1 bg-black text-white rounded text-sm hover:opacity-90"
              onClick={() => alert('Block Slot clicked (connect modal later)')}
            >
              + Block Slot
            </button>

            <button
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              onClick={() => alert('Edit Availability clicked (connect logic later)')}
            >
              Edit Availability
            </button>
          </div>

          {/* Right: Icons */}
          <div className="flex items-center gap-4">

            {/* Calendar Icon */}
            <button
              onClick={() => alert('Calendar clicked')}
              className="p-2 rounded-full hover:bg-gray-100 transition"
            >
              📅
            </button>

            {/* Notification */}
            <button
              onClick={() => alert('Notifications clicked')}
              className="relative p-2 rounded-full hover:bg-gray-100 transition"
            >
              🔔
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile */}
            <div
              onClick={() => alert('Go to profile')}
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

        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => changeWeek(-1)}>◀</button>
          <span>
            {weekDates[0]?.toDateString()} - {weekDates[4]?.toDateString()}
          </span>
          <button onClick={() => changeWeek(1)}>▶</button>
        </div>

        <div className="bg-white border rounded overflow-x-auto">

          <div className="grid grid-cols-5 border-b text-center text-sm font-medium">
            {weekDates.map((d, i) => (
              <div key={i} className="p-2">
                {d.toLocaleDateString("en-US", { weekday: "long" })}
              </div>
            ))}
          </div>

          {[...Array(8)].map((_, row) => (
            <div key={row} className="grid grid-cols-5 border-b">
              {weekDates.map((_, col) => {
                const hour = 8 + row;
                const items = appointments.filter(
                  (a) => a.day === col && a.time === hour
                );

                return (
                  <div key={col} className="h-24 border-r relative p-1 text-xs">
                    <span className="absolute top-1 left-1 text-gray-400 text-[10px]">
                      {hour}:00
                    </span>

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

        {/* MODAL */}
        {selected && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white w-[90%] max-w-lg rounded-xl shadow-lg">

              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-lg font-bold">Appointment Details</h2>
                <button onClick={() => setSelected(null)}>✕</button>
              </div>

              {/* Content */}
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
                  <strong>Date :</strong> Wednesday, April 8, 2026 | {selected.time}:00
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

              {/* Footer */}
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
