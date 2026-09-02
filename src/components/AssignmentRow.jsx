import React from "react";
import { courseById, COLOR_MAP, STATUS_META } from "../data/university";
import { effectiveStatus, deadlineLabel, fmtDate } from "../utils/format";
import { ShyndyqBadge } from "../Shyndyq";

function AssignmentRow({ a, report, onClick }) {
  const course = courseById(a.courseId);
  const status = effectiveStatus(a);
  const meta = STATUS_META[status];
  const StatusIcon = meta.icon;
  const dl = deadlineLabel(new Date(a.deadline));
  const showShyndyq = status === "review" || status === "graded";
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") onClick(); }}
      className="w-full text-left flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-cyan-300 hover:shadow-sm transition-all cursor-pointer"
    >
      <div className={`w-1.5 self-stretch rounded-full ${COLOR_MAP[course.color].bg}`} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800 truncate">{a.title}</p>
        <p className="text-xs text-slate-500 truncate">{course.title} · до {fmtDate(new Date(a.deadline))}</p>
      </div>
      {status === "graded" ? (
        <span className="text-sm font-bold text-emerald-700 shrink-0">{a.grade}/{a.maxScore}</span>
      ) : (
        <span className={`text-xs font-medium shrink-0 hidden sm:inline ${dl.urgent ? "text-red-600" : "text-slate-400"}`}>{dl.text}</span>
      )}
      <div className="flex items-center gap-1.5 shrink-0">
        {showShyndyq && <ShyndyqBadge report={report} loading={report === "loading"} compact />}
        <span className={`text-[11px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full border flex items-center gap-1 ${meta.classes}`}>
          <StatusIcon size={12} /> {meta.label}
        </span>
      </div>
    </div>
  );
}

export default AssignmentRow;
