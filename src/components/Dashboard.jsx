import React, { useMemo } from "react";
import { BarChart3, ClipboardList, CheckCircle2, AlertCircle } from "lucide-react";
import { courseById, ANNOUNCEMENTS, COLOR_MAP } from "../data/university";
import { effectiveStatus, deadlineLabel, fmtDate } from "../utils/format";

function Dashboard({ assignments, onOpenAssignment, onGoTo, student }) {
  const upcoming = useMemo(() => {
    return assignments
      .filter((a) => effectiveStatus(a) !== "graded")
      .filter((a) => !a.submission || effectiveStatus(a) === "overdue")
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 5);
  }, [assignments]);

  const gradedCount = assignments.filter((a) => a.status === "graded").length;
  const pendingCount = assignments.filter((a) => effectiveStatus(a) === "new" || effectiveStatus(a) === "review").length;
  const overdueCount = assignments.filter((a) => effectiveStatus(a) === "overdue").length;
  const avg = useMemo(() => {
    const graded = assignments.filter((a) => a.status === "graded");
    if (!graded.length) return null;
    return Math.round(graded.reduce((s, a) => s + (a.grade / a.maxScore) * 100, 0) / graded.length);
  }, [assignments]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 to-cyan-900 rounded-2xl p-6 text-white">
        <p className="text-slate-300 text-sm">Добро пожаловать,</p>
        <h2 className="text-2xl font-bold mt-0.5">{student.firstName}!</h2>
        <p className="text-slate-300 text-sm mt-2 max-w-xl">
          Группа {student.group} · {student.specialty}. Хорошего учебного дня — не забудьте о ближайших дедлайнах ниже.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Средний балл" value={avg !== null ? `${avg}%` : "—"} icon={BarChart3} color="cyan" />
        <StatCard label="Ожидают сдачи" value={pendingCount} icon={ClipboardList} color="amber" />
        <StatCard label="Проверено" value={gradedCount} icon={CheckCircle2} color="emerald" />
        <StatCard label="Просрочено" value={overdueCount} icon={AlertCircle} color="rose" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900">Ближайшие дедлайны</h3>
            <button onClick={() => onGoTo("assignments")} className="text-xs font-medium text-cyan-700 hover:underline">Все задания</button>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-sm text-slate-500">Активных дедлайнов нет — всё сдано!</p>
          ) : (
            <div className="space-y-2">
              {upcoming.map((a) => {
                const course = courseById(a.courseId);
                const dl = deadlineLabel(new Date(a.deadline));
                return (
                  <button
                    key={a.id}
                    onClick={() => onOpenAssignment(a.id)}
                    className="w-full text-left flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-cyan-200 hover:bg-cyan-50/40 transition-colors"
                  >
                    <div className={`w-2 h-10 rounded-full ${COLOR_MAP[course.color].bg}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 truncate">{a.title}</p>
                      <p className="text-xs text-slate-500 truncate">{course.title}</p>
                    </div>
                    <span className={`text-xs font-medium shrink-0 ${dl.urgent ? "text-red-600" : "text-slate-500"}`}>{dl.text}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900">Последние объявления</h3>
            <button onClick={() => onGoTo("announcements")} className="text-xs font-medium text-cyan-700 hover:underline">Все объявления</button>
          </div>
          <div className="space-y-3">
            {ANNOUNCEMENTS.slice(0, 4).map((n) => (
              <div key={n.id} className="p-3 rounded-lg border border-slate-100">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full">{n.scope}</span>
                  <span className="text-[11px] text-slate-400">{fmtDate(n.date)}</span>
                </div>
                <p className="text-sm font-semibold text-slate-800 mt-1.5">{n.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  const c = COLOR_MAP[color] || COLOR_MAP.cyan;
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg ${c.light} ${c.text} flex items-center justify-center shrink-0`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold text-slate-900 leading-tight">{value}</p>
        <p className="text-[11px] text-slate-500 leading-tight truncate">{label}</p>
      </div>
    </div>
  );
}

/* ============================== МОИ ДИСЦИПЛИНЫ ============================== */


export default Dashboard;
