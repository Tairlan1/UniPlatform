import React, { useState } from "react";
import {
  AlertCircle, CheckCircle2, ChevronDown, ChevronLeft, Clock, FileText,
  Loader2, Paperclip, RotateCcw, Upload, X,
} from "lucide-react";
import { COURSES, COLOR_MAP, STATUS_META, courseById } from "../data/university";
import { effectiveStatus, deadlineLabel, fmtDate, fmtDateTime } from "../utils/format";
import { ShyndyqBadge } from "../Shyndyq";
import AssignmentRow from "./AssignmentRow";

function AssignmentsList({ assignments, shynReports, onOpen }) {
  const [courseFilter, setCourseFilter] = useState("all");
  const [open, setOpen] = useState(false);

  const activeCourse = courseFilter === "all" ? null : courseById(courseFilter);
  const filtered = assignments
    .filter((a) => courseFilter === "all" || a.courseId === courseFilter)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  return (
    <div>
      <div className="relative mb-5">
        <button
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border border-slate-200 bg-white hover:border-slate-300 shadow-sm transition-colors text-sm font-semibold text-slate-800"
        >
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${activeCourse ? COLOR_MAP[activeCourse.color].bg : "bg-slate-900"}`}>
            {activeCourse ? activeCourse.title[0] : "∀"}
          </span>
          <span className="uppercase tracking-wide">{activeCourse ? activeCourse.title : "Все"}</span>
          <ChevronDown size={14} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute z-20 mt-2 w-64 bg-white rounded-xl border border-slate-200 shadow-lg py-1.5 left-0 overflow-hidden">
              <button
                onClick={() => { setCourseFilter("all"); setOpen(false); }}
                className={`w-full text-left flex items-center gap-2.5 px-3.5 py-2 text-sm hover:bg-slate-50 transition-colors ${courseFilter === "all" ? "font-semibold text-slate-900" : "text-slate-600"}`}
              >
                <span className="w-2 h-2 rounded-full bg-slate-900 shrink-0" /> Все предметы
              </button>
              <div className="h-px bg-slate-100 my-1 mx-3.5" />
              {COURSES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setCourseFilter(c.id); setOpen(false); }}
                  className={`w-full text-left flex items-center gap-2.5 px-3.5 py-2 text-sm hover:bg-slate-50 transition-colors ${courseFilter === c.id ? "font-semibold text-slate-900" : "text-slate-600"}`}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${COLOR_MAP[c.color].bg}`} /> {c.title}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && <p className="text-sm text-slate-500 py-6 text-center">Заданий по выбранному предмету нет.</p>}
        {filtered.map((a) => <AssignmentRow key={a.id} a={a} report={shynReports?.[a.id]} onClick={() => onOpen(a.id)} />)}
      </div>
    </div>
  );
}

/* ============================== ЗАДАНИЕ — ДЕТАЛЬНАЯ СТРАНИЦА (СДАЧА РАБОТЫ) ============================== */

function AssignmentDetail({ assignment, shynReport, onBack, onUpdate, onSubmitted, onOpenShynReport }) {
  const course = courseById(assignment.courseId);
  const status = effectiveStatus(assignment);
  const meta = STATUS_META[status];
  const StatusIcon = meta.icon;

  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [showResubmitForm, setShowResubmitForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  const canSubmitNow = status === "new" || status === "overdue" || (status === "graded" && assignment.allowResubmit && showResubmitForm);
  const dl = deadlineLabel(new Date(assignment.deadline));

  const handleFiles = (e) => {
    const list = Array.from(e.target.files || []).map((f) => ({
      name: f.name,
      size: f.size > 1024 * 1024 ? `${(f.size / (1024 * 1024)).toFixed(1)} МБ` : `${Math.max(1, Math.round(f.size / 1024))} КБ`,
      raw: f, // настоящий File - нужен, если сдача пойдёт в реальный Shyn API
    }));
    setFiles((prev) => [...prev, ...list]);
  };
  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const submit = () => {
    if (!text.trim() && files.length === 0) return;
    setSubmitting(true);
    setTimeout(() => {
      const submittedAt = new Date();
      const isLate = new Date(assignment.deadline) < submittedAt;
      const submission = { text: text.trim(), files, submittedAt, late: isLate };
      const newHistoryEntry = { submittedAt, files, grade: null };
      onUpdate(assignment.id, {
        status: "review",
        submission,
        grade: null,
        feedback: null,
        history: [...assignment.history, newHistoryEntry],
      });
      onSubmitted?.(assignment.id, submission);
      setSubmitting(false);
      setJustSubmitted(true);
      setShowResubmitForm(false);
      setText("");
      setFiles([]);
    }, 700);
  };

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-4">
        <ChevronLeft size={16} /> Ко всем заданиям
      </button>

      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${COLOR_MAP[course.color].light} ${COLOR_MAP[course.color].text}`}>{course.title}</span>
            <h2 className="text-xl font-bold text-slate-900 mt-2">{assignment.title}</h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {(status === "review" || status === "graded") && (
              <ShyndyqBadge report={shynReport} loading={shynReport === "loading"} onClick={onOpenShynReport} />
            )}
            <span className={`text-xs font-semibold uppercase tracking-wide px-3 py-1.5 rounded-full border flex items-center gap-1.5 ${meta.classes}`}>
              <StatusIcon size={14} /> {meta.label}
            </span>
          </div>
        </div>

        <div className="grid sm:grid-cols-4 gap-3 mt-5 text-xs">
          <InfoBox label="Опубликовано" value={assignment.published} />
          <InfoBox label="Дедлайн" value={fmtDate(new Date(assignment.deadline))} />
          <InfoBox label="Макс. балл" value={`${assignment.maxScore} баллов`} />
          <InfoBox label="Осталось" value={dl.text} urgent={dl.urgent && status !== "graded"} />
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-bold text-slate-800 mb-1.5">Описание</h4>
          <p className="text-sm text-slate-600 leading-relaxed">{assignment.description}</p>
        </div>

        <div className="mt-5">
          <h4 className="text-sm font-bold text-slate-800 mb-1.5">Инструкция</h4>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{assignment.instructions}</p>
        </div>

        {assignment.attachments?.length > 0 && (
          <div className="mt-5">
            <h4 className="text-sm font-bold text-slate-800 mb-2">Прикреплённые материалы</h4>
            <div className="space-y-1.5">
              {assignment.attachments.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                  <Paperclip size={14} className="text-slate-400" /> {f.name} <span className="text-slate-400 text-xs">({f.size})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Оценка и отзыв преподавателя */}
        {status === "graded" && !showResubmitForm && (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-emerald-800">Результат проверки</h4>
              <span className="text-lg font-extrabold text-emerald-700">{assignment.grade} / {assignment.maxScore}</span>
            </div>
            {assignment.feedback && <p className="text-sm text-emerald-800 mt-2 leading-relaxed">{assignment.feedback}</p>}
            {assignment.allowResubmit && (
              <button
                onClick={() => setShowResubmitForm(true)}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-white border border-emerald-300 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                <RotateCcw size={13} /> Отправить повторно
              </button>
            )}
          </div>
        )}

        {justSubmitted && !canSubmitNow && (
          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4 flex items-center gap-2 text-sm text-blue-800">
            <CheckCircle2 size={18} className="shrink-0" /> Работа успешно отправлена и передана на проверку преподавателю.
          </div>
        )}

        {/* Текущая сдача (статус «Ожидание») */}
        {status === "review" && assignment.submission && (
          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-blue-800">
              <Clock size={16} /> Ожидание проверки
            </div>
            <p className="text-xs text-blue-700 mt-2">
              Отправлено: {fmtDateTime(new Date(assignment.submission.submittedAt))}
              {assignment.submission.late && <span className="ml-1 font-semibold">(с опозданием)</span>}
            </p>
            {assignment.submission.text && <p className="text-sm text-slate-700 mt-2 bg-white rounded-lg p-3 border border-blue-100">{assignment.submission.text}</p>}
            {assignment.submission.files?.length > 0 && (
              <div className="mt-2 space-y-1">
                {assignment.submission.files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-700 bg-white rounded-lg px-2.5 py-1.5 border border-blue-100">
                    <FileText size={13} className="text-slate-400" /> {f.name} <span className="text-slate-400">({f.size})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Форма сдачи работы */}
        {canSubmitNow && (
          <div className="mt-6 rounded-xl border border-slate-200 p-4">
            <h4 className="text-sm font-bold text-slate-800 mb-3">
              {showResubmitForm ? "Повторная отправка работы" : "Загрузка работы"}
            </h4>
            {status === "overdue" && (
              <div className="mb-3 flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <AlertCircle size={14} className="shrink-0" /> Срок сдачи истёк. Отправка будет отмечена как «с опозданием».
              </div>
            )}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Введите текстовый ответ (необязательно, если прикреплён файл)..."
              rows={4}
              className="w-full rounded-lg border border-slate-300 text-sm p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 resize-none"
            />

            <div className="mt-3">
              <label className="flex items-center gap-2 justify-center border-2 border-dashed border-slate-300 rounded-lg py-4 cursor-pointer hover:border-cyan-400 hover:bg-cyan-50/40 transition-colors text-sm text-slate-500">
                <Upload size={16} />
                Прикрепить файл (PDF, DOCX, PPTX, ZIP и др.)
                <input type="file" multiple className="hidden" onChange={handleFiles} />
              </label>
              {files.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                      <FileText size={14} className="text-slate-400 shrink-0" />
                      <span className="flex-1 truncate">{f.name}</span>
                      <span className="text-xs text-slate-400 shrink-0">{f.size}</span>
                      <button onClick={() => removeFile(i)} className="text-slate-400 hover:text-red-600 shrink-0"><X size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={submit}
                disabled={submitting || (!text.trim() && files.length === 0)}
                className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2"
              >
                {submitting && <Loader2 size={15} className="animate-spin" />}
                {submitting ? "Отправка..." : "Подтвердить"}
              </button>
              {showResubmitForm && (
                <button onClick={() => { setShowResubmitForm(false); setText(""); setFiles([]); }} className="text-sm font-medium text-slate-500 hover:text-slate-800 px-3 py-2.5">
                  Отмена
                </button>
              )}
            </div>
          </div>
        )}

        {/* История отправок */}
        {assignment.history?.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-bold text-slate-800 mb-2">История отправок</h4>
            <div className="space-y-2">
              {[...assignment.history].reverse().map((h, i) => (
                <div key={i} className="flex items-center justify-between text-xs bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                  <span className="text-slate-600">Попытка №{assignment.history.length - i} · {fmtDateTime(new Date(h.submittedAt))}</span>
                  <span className={`font-semibold ${h.grade !== null ? "text-emerald-700" : "text-slate-400"}`}>
                    {h.grade !== null ? `${h.grade} / ${assignment.maxScore}` : "ожидает проверки"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoBox({ label, value, urgent }) {
  return (
    <div className="bg-slate-50 rounded-lg p-2.5">
      <p className="text-slate-400 font-medium">{label}</p>
      <p className={`font-semibold mt-0.5 ${urgent ? "text-red-600" : "text-slate-800"}`}>{value}</p>
    </div>
  );
}

export { AssignmentsList, AssignmentDetail, InfoBox };
