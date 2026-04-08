import { useState } from "react";

export default function DateSelector({ selectedDate, onSelectDate }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getWeekDays = (date) => {
    const start  = new Date(date);
    const day    = start.getDay();
    const diff   = start.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(start);
    monday.setDate(diff);
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
    setCurrentDate(new Date(Number(year), Number(month) - 1, 1));
  };

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return (
    <div className="bg-white rounded-xl space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-sm font-semibold text-gray-700">Select new date</p>
        <input
          type="month"
          value={`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`}
          onChange={changeMonthYear}
          className="border rounded px-2 py-1 text-gray-600 text-xs"
        />
      </div>

      <div className="border border-gray-100 rounded-xl p-4">
        <div className="flex justify-between items-center mb-3">
          <button
            onClick={prevWeek}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm"
          >
            ‹
          </button>
          <p className="text-xs font-medium text-gray-500">
            {week[0].toLocaleString("default", { month: "long" })} {week[0].getDate()} — {week[6].toLocaleString("default", { month: "long" })} {week[6].getDate()}, {week[6].getFullYear()}
          </p>
          <button
            onClick={nextWeek}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm"
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {week.map((d) => {
            const dayLabel   = d.toLocaleDateString("default", { weekday: "short" });
            const dateNum    = d.getDate();
            const isSelected = selectedDate?.toDateString() === d.toDateString();
            const isPast     = d < now;
            const isToday    = d.toDateString() === now.toDateString();

            return (
              <button
                key={d.toDateString()}
                onClick={() => !isPast && onSelectDate(new Date(d))}
                disabled={isPast}
                className={`flex flex-col items-center py-2 rounded-lg transition ${
                  isPast
                    ? "opacity-30 cursor-not-allowed"
                    : isSelected
                    ? "bg-blue-600 text-white"
                    : isToday
                    ? "border border-blue-400 text-blue-600 hover:bg-blue-50"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <span className={`text-[10px] font-medium ${isSelected ? "text-blue-100" : "text-gray-400"}`}>
                  {dayLabel}
                </span>
                <span className={`text-sm font-bold mt-0.5 ${isSelected ? "text-white" : ""}`}>
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