/**
 * Форматирование дат, статусов сдачи и перевод процента в оценку.
 * Вынесено из App.jsx при разборе на модули.
 */

import { TODAY } from "../data/university";

function fmtDate(d) {
  if (!d) return "";
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function fmtDateTime(d) {
  if (!d) return "";
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" }) +
    ", " + d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}
function daysUntil(d) {
  const ms = d.setHours(0,0,0,0) - new Date(TODAY).setHours(0,0,0,0);
  return Math.round(ms / 86400000);
}
function deadlineLabel(deadline) {
  const diff = daysUntil(new Date(deadline));
  if (diff < 0) return { text: `Просрочено на ${Math.abs(diff)} дн.`, urgent: true };
  if (diff === 0) return { text: "Сегодня — крайний срок", urgent: true };
  if (diff === 1) return { text: "Завтра — крайний срок", urgent: true };
  if (diff <= 3) return { text: `Осталось ${diff} дн.`, urgent: true };
  return { text: `Осталось ${diff} дн.`, urgent: false };
}
function effectiveStatus(a) {
  if (a.status === "graded") return "graded";
  if (a.status === "review") return "review";
  if (new Date(a.deadline) < TODAY && !a.submission) return "overdue";
  return "new";
}
function scoreToGrade(pct) {
  if (pct >= 95) return { letter: "A", gpa: 4.0 };
  if (pct >= 90) return { letter: "A-", gpa: 3.67 };
  if (pct >= 85) return { letter: "B+", gpa: 3.33 };
  if (pct >= 80) return { letter: "B", gpa: 3.0 };
  if (pct >= 75) return { letter: "B-", gpa: 2.67 };
  if (pct >= 70) return { letter: "C+", gpa: 2.33 };
  if (pct >= 65) return { letter: "C", gpa: 2.0 };
  if (pct >= 60) return { letter: "C-", gpa: 1.67 };
  if (pct >= 55) return { letter: "D+", gpa: 1.33 };
  if (pct >= 50) return { letter: "D", gpa: 1.0 };
  return { letter: "F", gpa: 0 };
}

export { fmtDate, fmtDateTime, daysUntil, deadlineLabel, effectiveStatus, scoreToGrade };
