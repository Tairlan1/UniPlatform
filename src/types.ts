/**
 * types.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Общие типы предметной области: учётные записи, курсы, задания, Shyndyq-
 * отчёты. Вынесено в отдельный модуль, чтобы им могли пользоваться и
 * data/*.ts (без JSX), и компоненты.
 */

import type { ComponentType } from "react";

export type Role = "student" | "teacher";

export type ColorKey = "cyan" | "violet" | "amber" | "rose" | "emerald" | "slate";

export type AssignmentStatus = "new" | "review" | "graded" | "overdue";

/* ============================== Учётные записи ============================== */

export interface StudentAccount {
  login: string;
  password: string;
  /** Ключ одного из 5 реально обученных авторских стилей, либо null для обычного студента. */
  expectedAuthor: string | null;
  fullName: string;
  firstName: string;
  initials: string;
  studentId: string;
  group: string;
  faculty: string;
  specialty: string;
  course: number;
  form: string;
  email: string;
  phone: string;
  advisor: string;
}

/* ============================== Курсы ============================== */

export interface Lecture {
  title: string;
  date: string;
}

export interface Material {
  name: string;
  size: string;
}

export interface Lab {
  title: string;
}

export interface Course {
  id: string;
  title: string;
  teacher: string;
  credits: number;
  color: ColorKey;
  overview: string;
  lectures: Lecture[];
  materials: Material[];
  labs: Lab[];
}

/* ============================== Задания ============================== */

export interface AssignmentFile {
  name: string;
  size: string;
  /** Настоящий File-объект из <input type="file"> - только у файлов, прикреплённых в этой сессии. */
  raw?: File;
}

export interface Submission {
  text: string;
  files: AssignmentFile[];
  submittedAt: Date;
  late: boolean;
}

export interface HistoryEntry {
  submittedAt: Date;
  files: AssignmentFile[];
  grade: number | null;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  instructions: string;
  attachments: AssignmentFile[];
  published: string;
  deadline: Date;
  maxScore: number;
  allowResubmit: boolean;
  status: AssignmentStatus;
  submission: Submission | null;
  grade: number | null;
  feedback: string | null;
  history: HistoryEntry[];
}

/* ============================== Расписание / календарь ============================== */

export interface ScheduleItem {
  time: string;
  course: string;
  type: string;
  room: string;
  teacher: string;
}

export interface ScheduleDay {
  day: string;
  items: ScheduleItem[];
}

export type ExtraEventType = "exam" | "event";

export interface ExtraEvent {
  date: Date;
  title: string;
  type: ExtraEventType;
}

export type CalendarEventType = "assignment" | ExtraEventType;

export interface CalendarEvent {
  date: Date;
  title: string;
  type: CalendarEventType;
  id?: string;
}

/* ============================== Объявления ============================== */

export interface Announcement {
  id: string;
  scope: string;
  author: string;
  date: Date;
  title: string;
  text: string;
}

/* ============================== Справочники ============================== */

export interface StatusMetaEntry {
  label: string;
  classes: string;
  icon: ComponentType<{ size?: number; className?: string }>;
}

export interface ColorMapEntry {
  bg: string;
  light: string;
  text: string;
  border: string;
  ring: string;
}

export interface DeadlineLabel {
  text: string;
  urgent: boolean;
}

export interface GradeInfo {
  letter: string;
  gpa: number;
}

export interface NavItem {
  key: string;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
}

/* ============================== Shyndyq: мок-отчёт (shynClient.ts) ============================== */

export type ShynVerdict = "green" | "amber" | "red";

export interface ShynMetric {
  key: string;
  label: string;
  baseline: number;
  current: number;
}

export interface ShynInsufficientDataReport {
  submissionId: string;
  status: "insufficient_data";
  priorWorksCount: number;
  minPriorWorks: number;
  note: string;
}

export interface ShynMockReadyReport {
  submissionId: string;
  status: "ready";
  priorWorksCount: number;
  styleScore: number;
  aiScore: number;
  verdict: ShynVerdict;
  metrics: ShynMetric[];
  highlights: string[];
  generatedAt: Date;
  disclaimer: string;
}

export type ShynBuildReportResult = ShynInsufficientDataReport | ShynMockReadyReport;

/** То, что реально хранится в App.jsx::shynReports для мок-источника (source: "mock"). */
export type ShynMockReportEntry =
  | ({ source: "mock" } & ShynInsufficientDataReport)
  | ({ source: "mock" } & ShynMockReadyReport);

/* ============================== Shyndyq: реальный отчёт (shynApiClient.ts / api_analyze.py) ============================== */

export type ShynTier = "red" | "yellow" | "green" | null;

export interface ShynParagraph {
  text: string;
  wordCount: number;
  styleScore: number | null;
  styleTier: ShynTier;
  topAuthor: string | null;
  topAuthorProb: number | null;
  aiScore: number | null;
  aiTier: ShynTier;
  aiSource: string | null;
}

export interface ShynConfidence {
  bandLabel: string;
  level: "known" | "unknown" | "high" | "good" | "moderate" | "low";
  accuracyPct: number | null;
  text: string;
}

export interface ShynModelInfo {
  authors: string[];
  source: string;
}

/** Ответ POST /api/v1/analyze (api_analyze.py), как есть, до пересчёта в App.jsx. */
export interface ShynApiAnalyzeResponse {
  expectedAuthor: string;
  docStyleScore: number | null;
  docStyleTier: ShynTier;
  docAiScore: number;
  docAiTier: ShynTier;
  styleReliable: boolean;
  confidence: ShynConfidence;
  wordCount: number;
  totalParagraphs: number;
  flaggedParagraphs: number;
  paragraphs: ShynParagraph[];
  modelInfo: ShynModelInfo;
}

/** То, что App.jsx кладёт в shynReports[id] для реального источника (source: "real"). */
export interface ShynRealReadyReport {
  source: "real";
  status: "ready";
  verdict: ShynVerdict;
  styleScore: number | "Н/Д" | "н/д";
  aiScore: number | null;
  expectedAuthor: string;
  docStyleScore: number | null;
  docStyleTier: ShynTier;
  docAiScore: number;
  docAiTier: ShynTier;
  styleReliable: boolean;
  totalParagraphs: number;
  flaggedParagraphs: number;
  paragraphs: ShynParagraph[];
  modelInfo: ShynModelInfo;
  confidence: ShynConfidence;
  wordCount: number;
  disclaimer: string;
}

export interface ShynRealErrorReport {
  source: "real";
  status: "error";
  message: string;
}

export type ShynRealReportEntry = ShynRealReadyReport | ShynRealErrorReport;

/** Полный набор форм, которые может принимать shynReports[id] в App.jsx. */
export type ShynReportEntry = "loading" | ShynMockReportEntry | ShynRealReportEntry;

/* ============================== Контекст полного отчёта (ShyndyqReport) ============================== */

export interface ShynReportContext {
  studentName?: string | null;
  studentEmail?: string | null;
  assignmentTitle?: string | null;
  courseTitle?: string | null;
  expectedAuthorDisplay?: string | null;
}

export interface ReportViewState {
  report: ShynReportEntry;
  context: ShynReportContext;
  isTeacher: boolean;
}

export type TeacherAction = "accept" | "discuss" | "escalate";

/* ============================== Roster преподавателя (TeacherView.tsx) ============================== */

export interface RosterEntry {
  id: string;
  studentName: string;
  studentId: string;
  studentEmail: string;
  submittedAt: string;
  grade: number | null;
  maxScore: number;
  reportSeed: string;
  priorWorksCount: number;
  profile: "high" | "mid" | "low" | "flagged";
}

export interface RosterRow extends RosterEntry {
  report: ShynBuildReportResult;
}
