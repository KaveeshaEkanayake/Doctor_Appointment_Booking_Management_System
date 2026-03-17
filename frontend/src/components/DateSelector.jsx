import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function DateSelector() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today); // controls displayed week
  const [selectedDay, setSelectedDay] = useState(today.toDateString());

  // Helper: get start of week (Monday)
  const getWeekDays = (date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(start.setDate(diff));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const week = getWeekDays(currentDate);

  // Navigation handlers
  const prevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const changeMonthYear = (e) => {
    const [year, month] = e.target.value.split("-");
    const newDate = new Date(year, month - 1, 1);
    setCurrentDate(newDate);
  };

  return (
    <div className="bg-white rounded-xl space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-gray-700 font-semibold">Select Date</h2>
        {/* Month-Year Picker */}
        <input
          type="month"
          value={`${currentDate.getFullYear()}-${String(
            currentDate.getMonth() + 1
          ).padStart(2, "0")}`}
          onChange={changeMonthYear}
          className="border rounded px-2 py-1 text-gray-700"
        />
      </div>

      {/* Week Navigation */}
      <div className="shadow-md p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          {/* Left Arrow */}
          <button
            onClick={prevWeek}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            ←
          </button>

          {/* Week Range Text */}
          <p className="text-gray-700 text-center font-medium">
            Week of {week[0].toLocaleString("default", { month: "long" })}{" "}
            {week[0].getDate()} - {week[6].getDate()}
          </p>

          {/* Right Arrow */}
          <button
            onClick={nextWeek}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            →
          </button>
        </div>


        {/* Week Row */}
        <div className="flex flex-wrap md:flex-nowrap justify-between px-4 pb-4 gap-2">
          {week.map((d) => {
            const dayLabel = d
              .toLocaleDateString("default", { weekday: "short" })
              .toUpperCase();
            const dateNum = d.getDate();
            const dateStr = d.toDateString();
            const isSelected = selectedDay === dateStr;

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDay(dateStr)}
                className="flex flex-col items-center px-3 py-2 rounded-lg transition hover:bg-gray-200 flex-1 md:flex-none"
              >
                {/* Day label */}
                <span className="font-medium text-gray-400">{dayLabel}</span>

                {/* Date number with circle highlight */}
                <span
                  className={
                    isSelected
                      ? "text-white font-bold rounded-lg w-10 bg-blue-500"
                      : "text-gray-700"
                  }
                >
                  {dateNum}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

