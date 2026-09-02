import React from "react";
import { COURSES, COLOR_MAP } from "../data/university";
import { scoreToGrade } from "../utils/format";

function Grades({ assignments }) {
  const rows = COURSES.map((course) => {
    const graded = assignments.filter((a) => a.courseId === course.id && a.status === "graded");
    const pct = graded.length ? Math.round(graded.reduce((s, a) => s + (a.grade / a.maxScore) * 100, 0) / graded.length) : null;
    return { course, graded, pct };
  });
  const overallGraded = assignments.filter((a) => a.status === "graded");
  const overallPct = overallGraded.length
    ? Math.round(overallGraded.reduce((s, a) => s + (a.grade / a.maxScore) * 100, 0) / overallGraded.length)
    : null;
  const overallGpa = overallPct !== null ? scoreToGrade(overallPct) : null;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-wrap items-center gap-6">
        <div>
          <p className="text-xs text-slate-400 font-medium">Средний балл (GPA)</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">{overallGpa ? overallGpa.gpa.toFixed(2) : "—"}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 font-medium">Буквенная оценка</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">{overallGpa ? overallGpa.letter : "—"}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 font-medium">Средний процент</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">{overallPct !== null ? `${overallPct}%` : "—"}</p>
        </div>
      </div>

      <div className="space-y-3">
        {rows.map(({ course, graded, pct }) => {
          const c = COLOR_MAP[course.color];
          const gradeInfo = pct !== null ? scoreToGrade(pct) : null;
          return (
            <div key={course.id} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${c.bg}`} />
                  <span className="font-semibold text-slate-800 text-sm">{course.title}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-slate-900">{pct !== null ? `${pct}%` : "нет оценок"}</span>
                  {gradeInfo && <span className="text-xs text-slate-400 ml-2">({gradeInfo.letter} · GPA {gradeInfo.gpa.toFixed(2)})</span>}
                </div>
              </div>
              {pct !== null && (
                <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
                  <div className={`h-full ${c.bg}`} style={{ width: `${pct}%` }} />
                </div>
              )}
              {graded.length > 0 && (
                <div className="mt-3 space-y-1">
                  {graded.map((a) => (
                    <div key={a.id} className="flex items-center justify-between text-xs text-slate-500">
                      <span>{a.title}</span>
                      <span className="font-semibold text-slate-700">{a.grade}/{a.maxScore}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Grades;
