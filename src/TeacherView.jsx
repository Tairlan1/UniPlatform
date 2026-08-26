import React, { useMemo } from "react";
import { Users, FileText, ChevronRight } from "lucide-react";
import { ShyndyqBadge } from "./Shyndyq";
import { buildReport } from "./shynClient";

export const TEACHER = {
  fullName: "Ким Руслан Сергеевич",
  department: "Кафедра информационных систем",
  group: "ИС-21-1",
};

// Роспись группы по заданию «Задание 2: Верстка адаптивной страницы» (a3).
// Разный набор профилей специально подобран так, чтобы на одном экране
// преподаватель видел весь спектр: норма / расхождение / внимание / нет данных.
export const ROSTER = [
  {
    id: "s1", studentName: "Ахметов Нурлан Ерланович", studentId: "21О-1147",
    studentEmail: "n.akhmetov@damqor.edu",
    submittedAt: "23.08.2026, 20:14", grade: 85, maxScore: 100,
    reportSeed: "a3-s1", priorWorksCount: 5, profile: "high",
  },
  {
    id: "s2", studentName: "Сералиева Динара Асхатовна", studentId: "21О-1102",
    studentEmail: "d.seralieva@damqor.edu",
    submittedAt: "23.08.2026, 18:02", grade: 91, maxScore: 100,
    reportSeed: "a3-s2", priorWorksCount: 6, profile: "high",
  },
  {
    id: "s3", studentName: "Садыков Ержан Болатович", studentId: "21О-1139",
    studentEmail: "e.sadykov@damqor.edu",
    submittedAt: "24.08.2026, 09:47", grade: 78, maxScore: 100,
    reportSeed: "a3-s3", priorWorksCount: 4, profile: "mid",
  },
  {
    id: "s4", studentName: "Богданов Тимур Викторович", studentId: "21О-1155",
    studentEmail: "t.bogdanov@damqor.edu",
    submittedAt: "24.08.2026, 23:51", grade: null, maxScore: 100,
    reportSeed: "a3-s4", priorWorksCount: 5, profile: "low",
  },
  {
    id: "s5", studentName: "Ли Виктор Сергеевич", studentId: "21О-1161",
    studentEmail: "v.li@damqor.edu",
    submittedAt: "25.08.2026, 00:12", grade: null, maxScore: 100,
    reportSeed: "a3-s5", priorWorksCount: 4, profile: "flagged",
  },
  {
    id: "s6", studentName: "Нуртаева Аружан Кайратовна", studentId: "24П-0087",
    studentEmail: "a.nurtaeva@damqor.edu",
    submittedAt: "24.08.2026, 21:30", grade: null, maxScore: 100,
    reportSeed: "a3-s6", priorWorksCount: 1, profile: "high", // переведена в этом семестре — истории почти нет
  },
];

export function TeacherDashboard({ onOpenReport }) {
  const rows = useMemo(
    () =>
      ROSTER.map((s) => ({
        ...s,
        report: buildReport({ submissionId: s.reportSeed, priorWorksCount: s.priorWorksCount, profile: s.profile }),
      })),
    []
  );

  const flaggedCount = rows.filter((r) => r.report.status === "ready" && r.report.verdict !== "green").length;

  return (
    <div>
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-5">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
            <Users size={18} className="text-violet-600" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Задание 2: Верстка адаптивной страницы</h2>
            <p className="text-xs text-slate-500">Web-программирование · Группа {TEACHER.group} · {rows.length} сдач</p>
          </div>
        </div>
        {flaggedCount > 0 && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-4 w-fit">
            {flaggedCount} {flaggedCount === 1 ? "сдача требует" : "сдачи требуют"} внимания по индикатору Shyndyq
          </p>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b border-slate-100">
          <span>Студент</span>
          <span>Сдано</span>
          <span>Оценка</span>
          <span>Shyndyq</span>
          <span></span>
        </div>
        <div className="divide-y divide-slate-100">
          {rows.map((r) => (
            <button
              key={r.id}
              onClick={() => onOpenReport(r)}
              disabled={r.report.status !== "ready"}
              className="w-full text-left grid grid-cols-2 sm:grid-cols-[1fr_auto_auto_auto_auto] gap-2 sm:gap-3 items-center px-4 py-3 hover:bg-slate-50 transition-colors disabled:hover:bg-white disabled:cursor-default"
            >
              <div className="min-w-0 col-span-2 sm:col-span-1">
                <p className="text-sm font-semibold text-slate-800 truncate">{r.studentName}</p>
                <p className="text-[11px] text-slate-400">{r.studentId}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <FileText size={12} className="text-slate-300" /> {r.submittedAt}
              </div>
              <span className="text-sm font-semibold text-slate-700">
                {r.grade !== null ? `${r.grade}/${r.maxScore}` : <span className="text-slate-400 font-normal">не оценено</span>}
              </span>
              <div>
                <ShyndyqBadge report={r.report} />
              </div>
              <ChevronRight size={16} className="text-slate-300 justify-self-end hidden sm:block" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
