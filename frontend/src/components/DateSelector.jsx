import { useState } from "react";

export default function DateSelector({ selectedDate, onSelectDate }) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);

  const getWeekDays = (date) => {
    const start = new Date(date);
    const day   = start.getDay();
    const diff  = start.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(start.setDate(diff));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const week = getWeekDays(currentDate);

  const prevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const nextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  const changeMonthYear = (e) => {
    const [year, month] = e.target.value.split("-");
    setCurrentDate(new Date(year, month - 1, 1));
  };

  return (
    <div className="bg-white rounded-xl space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-gray-700 font-semibold">Select Date</h2>
        <input
          type="month"
          value={`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`}
          onChange={changeMonthYear}
          className="border rounded px-2 py-1 text-gray-700 text-sm"
        />
      </div>

      <div className="shadow-md p-6 rounded-lg border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <button onClick={prevWeek} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">←</button>
          <p className="text-gray-700 text-center font-medium text-sm">
            Week of {week[0].toLocaleString("default", { month: "long" })} {week[0].getDate()} - {week[6].getDate()}
          </p>
          <button onClick={nextWeek} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">→</button>
        </div>

        <div className="flex flex-wrap md:flex-nowrap justify-between px-4 pb-4 gap-2">
          {week.map((d) => {
            const dayLabel  = d.toLocaleDateString("default", { weekday: "short" }).toUpperCase();
            const dateNum   = d.getDate();
            const isSelected = selectedDate?.toDateString() === d.toDateString();
            const isPast    = d < new Date(today.setHours(0,0,0,0));

            return (
              <button
                key={d.toDateString()}
                onClick={() => !isPast && onSelectDate(new Date(d))}
                disabled={isPast}
                className={`flex flex-col items-center px-3 py-2 rounded-lg transition flex-1 md:flex-none ${
                  isPast
                    ? "opacity-40 cursor-not-allowed"
                    : isSelected
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                <span className={`font-medium text-xs ${isSelected ? "text-white" : "text-gray-400"}`}>
                  {dayLabel}
                </span>
                <span className={`font-bold text-sm ${isSelected ? "text-white" : "text-gray-700"}`}>
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