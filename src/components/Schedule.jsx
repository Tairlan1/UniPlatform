import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { SCHEDULE, EXTRA_EVENTS, TODAY } from "../data/university";

function Schedule() {
  return (
    <div className="space-y-4">
      {SCHEDULE.map((d) => (
        <div key={d.day} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 text-white px-4 py-2.5 text-sm font-bold">{d.day}</div>
          <div className="divide-y divide-slate-100">
            {d.items.map((it, i) => (
              <div key={i} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
                <span className="text-sm font-semibold text-slate-800 w-28 shrink-0">{it.time}</span>
                <span className="text-sm text-slate-800 flex-1 min-w-[160px]">{it.course}</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 shrink-0">{it.type}</span>
                <span className="text-xs text-slate-500 flex items-center gap-1 shrink-0"><MapPin size={12} />{it.room}</span>
                <span className="text-xs text-slate-400 shrink-0">{it.teacher}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================== КАЛЕНДАРЬ ============================== */

function CalendarView({ assignments, onOpenAssignment }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(null);

  const viewDate = new Date(TODAY.getFullYear(), TODAY.getMonth() + monthOffset, 1);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const events = useMemo(() => {
    const list = [];
    assignments.forEach((a) => list.push({ date: new Date(a.deadline), title: a.title, type: "assignment", id: a.id }));
    EXTRA_EVENTS.forEach((e) => list.push({ date: e.date, title: e.title, type: e.type }));
    return list;
  }, [assignments]);

  const firstDayIdx = (new Date(year, month, 1).getDay() + 6) % 7; // понедельник = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDayIdx; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const eventsForDay = (d) => events.filter((e) => e.date.getFullYear() === year && e.date.getMonth() === month && e.date.getDate() === d);
  const selectedEvents = selectedDay ? eventsForDay(selectedDay) : [];
  const isToday = (d) => d === TODAY.getDate() && month === TODAY.getMonth() && year === TODAY.getFullYear();

  const TYPE_DOT = { assignment: "bg-cyan-500", exam: "bg-red-500", event: "bg-amber-500" };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setMonthOffset((m) => m - 1)} className="p-1.5 rounded-lg hover:bg-slate-100"><ChevronLeft size={18} /></button>
          <h3 className="font-bold text-slate-900 capitalize">{viewDate.toLocaleDateString("ru-RU", { month: "long", year: "numeric" })}</h3>
          <button onClick={() => setMonthOffset((m) => m + 1)} className="p-1.5 rounded-lg hover:bg-slate-100"><ChevronRight size={18} /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-400 mb-1">
          {["Пн","Вт","Ср","Чт","Пт","Сб","Вс"].map((d) => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (d === null) return <div key={i} />;
            const dEvents = eventsForDay(d);
            return (
              <button
                key={i}
                onClick={() => setSelectedDay(d)}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 text-sm border transition-colors ${
                  selectedDay === d ? "border-cyan-500 bg-cyan-50" : "border-transparent hover:bg-slate-50"
                } ${isToday(d) ? "font-bold text-cyan-700" : "text-slate-700"}`}
              >
                {d}
                <div className="flex gap-0.5">
                  {dEvents.slice(0, 3).map((e, idx) => (
                    <span key={idx} className={`w-1.5 h-1.5 rounded-full ${TYPE_DOT[e.type]}`} />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h3 className="font-bold text-slate-900 mb-3">
          {selectedDay ? `События · ${selectedDay} ${viewDate.toLocaleDateString("ru-RU", { month: "long" })}` : "Выберите день"}
        </h3>
        {selectedDay && selectedEvents.length === 0 && <p className="text-sm text-slate-500">На эту дату событий нет.</p>}
        <div className="space-y-2">
          {selectedEvents.map((e, i) => (
            <button
              key={i}
              onClick={() => e.type === "assignment" && onOpenAssignment(e.id)}
              className={`w-full text-left p-3 rounded-lg border border-slate-100 ${e.type === "assignment" ? "hover:border-cyan-300 hover:bg-cyan-50/40" : ""}`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${TYPE_DOT[e.type]}`} />
                <span className="text-[11px] font-medium text-slate-400">
                  {e.type === "assignment" ? "Дедлайн задания" : e.type === "exam" ? "Экзамен / контроль" : "Событие"}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-800 mt-1">{e.title}</p>
            </button>
          ))}
        </div>
        {!selectedDay && (
          <div className="text-xs text-slate-400 space-y-1.5 mt-2">
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-cyan-500" /> Дедлайн задания</div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500" /> Экзамен / контроль</div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500" /> Учебное событие</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================== ЗАДАНИЯ (список) ============================== */


export { Schedule, CalendarView };
