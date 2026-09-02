import React, { useState } from "react";
import { ChevronLeft, Paperclip } from "lucide-react";
import { COURSES, COLOR_MAP, ANNOUNCEMENTS } from "../data/university";
import { effectiveStatus, fmtDate } from "../utils/format";
import AssignmentRow from "./AssignmentRow";

function CoursesList({ onOpenCourse, assignments }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {COURSES.map((course) => {
        const c = COLOR_MAP[course.color];
        const courseAssignments = assignments.filter((a) => a.courseId === course.id);
        const pending = courseAssignments.filter((a) => effectiveStatus(a) === "new" || effectiveStatus(a) === "review").length;
        return (
          <button
            key={course.id}
            onClick={() => onOpenCourse(course.id)}
            className="text-left bg-white rounded-xl border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all overflow-hidden"
          >
            <div className={`h-2 ${c.bg}`} />
            <div className="p-4">
              <h3 className="font-bold text-slate-900">{course.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{course.teacher}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${c.light} ${c.text}`}>{course.credits} кредита</span>
                {pending > 0 && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">{pending} к сдаче</span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function CourseDetail({ course, assignments, onBack, onOpenAssignment }) {
  const [tab, setTab] = useState("overview");
  const c = COLOR_MAP[course.color];
  const tabs = [
    { key: "overview", label: "Обзор" },
    { key: "lectures", label: "Лекции" },
    { key: "materials", label: "Материалы" },
    { key: "labs", label: "Практика/Лабы" },
    { key: "assignments", label: "Задания" },
    { key: "grades", label: "Оценки" },
    { key: "announcements", label: "Объявления" },
  ];

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-4">
        <ChevronLeft size={16} /> К дисциплинам
      </button>

      <div className={`rounded-xl ${c.bg} text-white p-5 mb-4`}>
        <h2 className="text-xl font-bold">{course.title}</h2>
        <p className="text-sm text-white/80 mt-1">{course.teacher} · {course.credits} кредита</p>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-slate-200 mb-5">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3.5 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === t.key ? `${c.border.replace("border-", "border-")} text-slate-900 border-b-2` : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
            style={tab === t.key ? { borderBottomColor: "currentColor" } : {}}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <p className="text-sm text-slate-700 leading-relaxed">{course.overview}</p>}

      {tab === "lectures" && (
        <div className="space-y-2">
          {course.lectures.length === 0 && <p className="text-sm text-slate-500">Лекции для этой дисциплины не запланированы.</p>}
          {course.lectures.map((l, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white">
              <span className="text-sm font-medium text-slate-800">{l.title}</span>
              <span className="text-xs text-slate-500">{l.date}</span>
            </div>
          ))}
        </div>
      )}

      {tab === "materials" && (
        <div className="space-y-2">
          {course.materials.map((m, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white">
              <Paperclip size={16} className="text-slate-400 shrink-0" />
              <span className="text-sm font-medium text-slate-800 flex-1">{m.name}</span>
              <span className="text-xs text-slate-400">{m.size}</span>
            </div>
          ))}
        </div>
      )}

      {tab === "labs" && (
        <div className="space-y-2">
          {course.labs.map((l, i) => (
            <div key={i} className="flex items-center p-3 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-800">
              {l.title}
            </div>
          ))}
        </div>
      )}

      {tab === "assignments" && (
        <div className="space-y-2">
          {assignments.length === 0 && <p className="text-sm text-slate-500">По этой дисциплине заданий нет.</p>}
          {assignments.map((a) => (
            <AssignmentRow key={a.id} a={a} onClick={() => onOpenAssignment(a.id)} />
          ))}
        </div>
      )}

      {tab === "grades" && (
        <div className="space-y-2">
          {assignments.filter((a) => a.status === "graded").length === 0 && (
            <p className="text-sm text-slate-500">Оценок по этой дисциплине пока нет.</p>
          )}
          {assignments.filter((a) => a.status === "graded").map((a) => (
            <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white">
              <span className="text-sm font-medium text-slate-800">{a.title}</span>
              <span className="text-sm font-bold text-slate-900">{a.grade} / {a.maxScore}</span>
            </div>
          ))}
        </div>
      )}

      {tab === "announcements" && (
        <div className="space-y-3">
          {ANNOUNCEMENTS.filter((n) => n.scope === course.title).length === 0 && (
            <p className="text-sm text-slate-500">Объявлений от преподавателя пока нет.</p>
          )}
          {ANNOUNCEMENTS.filter((n) => n.scope === course.title).map((n) => (
            <div key={n.id} className="p-3 rounded-lg border border-slate-200 bg-white">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                <span className="text-[11px] text-slate-400">{fmtDate(n.date)}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{n.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================== РАСПИСАНИЕ ============================== */


export { CoursesList, CourseDetail };
