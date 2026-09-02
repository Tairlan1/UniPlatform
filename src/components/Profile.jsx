import React from "react";
import { TEACHER } from "../TeacherView";

function Profile({ role, student }) {
  if (role === "teacher") {
    const fields = [
      { label: "ФИО", value: TEACHER.fullName },
      { label: "Кафедра", value: TEACHER.department },
      { label: "Курируемая группа", value: TEACHER.group },
      { label: "Дисциплина", value: "Web-программирование" },
    ];
    return (
      <div className="max-w-2xl">
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-amber-400 text-slate-900 font-extrabold text-xl flex items-center justify-center shrink-0">КР</div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{TEACHER.fullName}</h2>
            <p className="text-sm text-slate-500">{TEACHER.department}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 mt-4 divide-y divide-slate-100">
          {fields.map((f) => (
            <div key={f.label} className="flex items-center justify-between px-5 py-3">
              <span className="text-sm text-slate-500">{f.label}</span>
              <span className="text-sm font-medium text-slate-800 text-right">{f.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!student) return null;

  const fields = [
    { label: "ФИО", value: student.fullName },
    { label: "Студенческий ID", value: student.studentId },
    { label: "Группа", value: student.group },
    { label: "Факультет", value: student.faculty },
    { label: "Специальность", value: student.specialty },
    { label: "Курс обучения", value: `${student.course} курс` },
    { label: "Форма обучения", value: student.form },
    { label: "Эдвайзер", value: student.advisor },
    { label: "Email", value: student.email },
    { label: "Телефон", value: student.phone },
  ];
  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-amber-400 text-slate-900 font-extrabold text-xl flex items-center justify-center shrink-0">{student.initials}</div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">{student.fullName}</h2>
          <p className="text-sm text-slate-500">{student.specialty}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 mt-4 divide-y divide-slate-100">
        {fields.map((f) => (
          <div key={f.label} className="flex items-center justify-between px-5 py-3">
            <span className="text-sm text-slate-500">{f.label}</span>
            <span className="text-sm font-medium text-slate-800 text-right">{f.value}</span>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-slate-400 mt-4">
        Для изменения персональных данных обратитесь в деканат факультета.
      </p>
    </div>
  );
}

export default Profile;
