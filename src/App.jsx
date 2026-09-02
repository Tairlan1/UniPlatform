import React, { useState } from "react";
import { ClipboardList, LogOut } from "lucide-react";

import { ShyndyqReport } from "./Shyndyq";
import { TeacherDashboard, TEACHER } from "./TeacherView";
import { analyzeSubmission as mockAnalyzeSubmission } from "./shynClient";
import { analyzeSubmission as realAnalyzeSubmission } from "./shynApiClient";

import {
  TODAY, UNIVERSITY, courseById, initialAssignments, AUTHOR_DISPLAY_NAMES,
} from "./data/university";
import { STUDENT_NAV_ITEMS, TEACHER_NAV_ITEMS } from "./data/navigation";
import { SHYN_SEEDS, shynReportFor } from "./data/shynSeeds";

import Logo from "./components/Logo";
import LoginScreen from "./components/LoginScreen";
import Dashboard from "./components/Dashboard";
import { CoursesList, CourseDetail } from "./components/Courses";
import { Schedule, CalendarView } from "./components/Schedule";
import { AssignmentsList, AssignmentDetail } from "./components/Assignments";
import Grades from "./components/Grades";
import Announcements from "./components/Announcements";
import Profile from "./components/Profile";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState("student"); // 'student' | 'teacher'
  const [currentStudent, setCurrentStudent] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [assignments, setAssignments] = useState(initialAssignments);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [shynReports, setShynReports] = useState(() => {
    const initial = {};
    Object.keys(SHYN_SEEDS).forEach((id) => { initial[id] = shynReportFor(id); });
    return initial;
  });
  const [reportView, setReportView] = useState(null); // { report, context, isTeacher } | null

  const navItems = role === "teacher" ? TEACHER_NAV_ITEMS : STUDENT_NAV_ITEMS;

  const updateAssignment = (id, patch) => {
    setAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  };

  const goToAssignment = (id) => {
    setSelectedAssignmentId(id);
    setActiveTab("assignments");
  };

  // Запускает анализ Shyn сразу после сдачи работы студентом.
  //
  // ВАЖНАЯ РАЗВИЛКА: если у вошедшего студента задан expectedAuthor (это
  // один из пяти "авторских" аккаунтов - см. STUDENT_ACCOUNTS), мы вызываем
  // РЕАЛЬНЫЙ Shyn API (api_analyze.py, настоящая обученная модель) - для
  // них сравнение со стилем осмысленно, потому что модель действительно
  // обучена на этих пяти авторах. Для обычного студента (Нурлан,
  // expectedAuthor = null) у реальной модели попросту нет эталона "его
  // личного стиля" - для него используется мок-клиент shynClient.js,
  // сравнивающий с историей ЕГО ЖЕ прошлых работ (другая, гипотетическая
  // концепция, которую реальный бэкенд пока не реализует).
  const handleSubmitted = (assignmentId, submission) => {
    setShynReports((prev) => ({ ...prev, [assignmentId]: "loading" }));

    if (currentStudent?.expectedAuthor) {
      const file = submission?.files?.[0]?.raw || null;
      const text = file ? "" : (submission?.text || "");
      realAnalyzeSubmission({ file, text, expectedAuthor: currentStudent.expectedAuthor })
        .then((api) => {
          // ShyndyqBadge (компактный бейдж в шапке задания) написан под
          // мок-формат отчёта и ждёт verdict/styleScore/aiScore как ГОТОВЫЙ
          // процент (0-100). "Настоящий" API отдаёт docStyleScore/docAiScore
          // как ДОЛЮ (0-1) - без toPct бейдж показывал "0.99%" вместо "99%".
          // Плюс: styleScore для бейджа гейтится ТЕМ ЖЕ правилом, что и
          // полный отчёт (RealShyndyqReport) - при docAiTier==="red" реальный
          // % не показывается нигде, включая компактный бейдж, а не только
          // на полной странице отчёта.
          const verdict = api.docAiTier === "red" ? "red" : api.docAiTier === "yellow" ? "amber" : "green";
          const toPct = (x) => (x === null || x === undefined ? null : Math.round(x * 10000) / 100);
          setShynReports((prev) => ({
            ...prev,
            [assignmentId]: {
              source: "real",
              status: "ready",
              verdict,
              styleScore: api.docAiTier === "red" ? "Н/Д" : (toPct(api.docStyleScore) ?? "н/д"),
              aiScore: toPct(api.docAiScore),
              expectedAuthor: api.expectedAuthor,
              docStyleScore: api.docStyleScore,
              docStyleTier: api.docStyleTier,
              docAiScore: api.docAiScore,
              docAiTier: api.docAiTier,
              styleReliable: api.styleReliable,
              totalParagraphs: api.totalParagraphs,
              flaggedParagraphs: api.flaggedParagraphs,
              paragraphs: api.paragraphs,
              modelInfo: api.modelInfo,
              confidence: api.confidence,
              wordCount: api.wordCount,
              disclaimer:
                "Это вспомогательный индикатор для преподавателя. Он не является " +
                "автоматическим обвинением и не должен использоваться как " +
                "единственное основание для решения — финальный вердикт всегда " +
                "выносит преподаватель.",
            },
          }));
        })
        .catch((e) => {
          setShynReports((prev) => ({
            ...prev,
            [assignmentId]: { source: "real", status: "error", message: e.message },
          }));
        });
      return;
    }

    const priorWorksCount = assignments.filter((a) => a.submission).length; // растущая история сдач
    mockAnalyzeSubmission({ submissionId: assignmentId, priorWorksCount, profile: "high" }).then((report) => {
      setShynReports((prev) => ({ ...prev, [assignmentId]: { source: "mock", ...report } }));
    });
  };

  const openStudentReport = (assignment) => {
    const report = shynReports[assignment.id];
    if (!report || report === "loading") return;
    setReportView({
      report,
      context: {
        studentName: currentStudent?.fullName,
        studentEmail: currentStudent?.email,
        assignmentTitle: assignment.title,
        courseTitle: courseById(assignment.courseId)?.title,
        expectedAuthorDisplay: currentStudent?.expectedAuthor
          ? AUTHOR_DISPLAY_NAMES[currentStudent.expectedAuthor]
          : null,
      },
      isTeacher: false,
    });
  };

  const openTeacherReport = (row) => {
    setReportView({
      report: row.report,
      context: {
        studentName: row.studentName,
        studentEmail: row.studentEmail,
        assignmentTitle: "Задание 2: Верстка адаптивной страницы",
        courseTitle: "Web-программирование",
      },
      isTeacher: true,
    });
  };

  if (!loggedIn) {
    return (
      <LoginScreen
        onLogin={(chosenRole, account) => {
          setRole(chosenRole);
          if (chosenRole === "student") setCurrentStudent(account);
          setLoggedIn(true);
        }}
      />
    );
  }

  const selectedAssignment = assignments.find((a) => a.id === selectedAssignmentId);
  const selectedCourse = selectedCourseId ? courseById(selectedCourseId) : null;
  const currentLabel = reportView ? "Shyndyq · Отчёт" : navItems.find((n) => n.key === activeTab)?.label;

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 flex">
      {/* Sidebar */}
      <aside className={`print:hidden fixed lg:static z-30 inset-y-0 left-0 w-64 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-200 ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
          <Logo size={38} className="shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-bold leading-tight truncate tracking-wide">{UNIVERSITY.shortName}</div>
            <div className="text-[11px] text-slate-400 leading-tight truncate">{role === "teacher" ? "Портал преподавателя" : "Портал студента"}</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.key && !reportView;
            return (
              <button
                key={item.key}
                onClick={() => { setActiveTab(item.key); setSelectedCourseId(null); setSelectedAssignmentId(null); setMobileNavOpen(false); setReportView(null); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? "bg-cyan-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={18} className="shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-3">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
            <div className="w-9 h-9 rounded-full bg-amber-400 text-slate-900 font-bold flex items-center justify-center text-sm shrink-0">
              {role === "teacher" ? "КР" : currentStudent?.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold truncate">{role === "teacher" ? TEACHER.fullName.split(" ")[0] + " " + TEACHER.fullName.split(" ")[1] : currentStudent?.fullName}</div>
              <div className="text-[11px] text-slate-400 truncate">{role === "teacher" ? TEACHER.department : currentStudent?.group}</div>
            </div>
          </div>
          <button
            onClick={() => setLoggedIn(false)}
            className="mt-1 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LogOut size={16} /> Выйти
          </button>
        </div>
      </aside>

      {mobileNavOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setMobileNavOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="print:hidden sticky top-0 z-10 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button className="lg:hidden p-2 -ml-2 rounded-md hover:bg-slate-100" onClick={() => setMobileNavOpen(true)}>
              <ClipboardList size={20} />
            </button>
            <h1 className="text-lg font-bold truncate">{currentLabel}</h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="hidden sm:inline">{TODAY.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 max-w-6xl w-full mx-auto">
          {reportView && (
            <ShyndyqReport
              report={reportView.report}
              context={reportView.context}
              isTeacher={reportView.isTeacher}
              onBack={() => setReportView(null)}
              onAction={() => setReportView(null)}
              teacherName={TEACHER.fullName}
            />
          )}

          {!reportView && role === "student" && activeTab === "home" && (
            <Dashboard assignments={assignments} onOpenAssignment={goToAssignment} onGoTo={setActiveTab} student={currentStudent} />
          )}

          {!reportView && role === "student" && activeTab === "courses" && !selectedCourse && (
            <CoursesList onOpenCourse={setSelectedCourseId} assignments={assignments} />
          )}
          {!reportView && role === "student" && activeTab === "courses" && selectedCourse && (
            <CourseDetail
              course={selectedCourse}
              assignments={assignments.filter((a) => a.courseId === selectedCourse.id)}
              onBack={() => setSelectedCourseId(null)}
              onOpenAssignment={goToAssignment}
            />
          )}

          {!reportView && role === "student" && activeTab === "schedule" && <Schedule />}
          {!reportView && role === "student" && activeTab === "calendar" && <CalendarView assignments={assignments} onOpenAssignment={goToAssignment} />}

          {!reportView && role === "student" && activeTab === "assignments" && !selectedAssignment && (
            <AssignmentsList assignments={assignments} shynReports={shynReports} onOpen={(id) => setSelectedAssignmentId(id)} />
          )}
          {!reportView && role === "student" && activeTab === "assignments" && selectedAssignment && (
            <AssignmentDetail
              assignment={selectedAssignment}
              shynReport={shynReports[selectedAssignment.id]}
              onBack={() => setSelectedAssignmentId(null)}
              onUpdate={updateAssignment}
              onSubmitted={handleSubmitted}
              onOpenShynReport={() => openStudentReport(selectedAssignment)}
            />
          )}

          {!reportView && role === "student" && activeTab === "grades" && <Grades assignments={assignments} />}
          {!reportView && role === "student" && activeTab === "announcements" && <Announcements />}
          {!reportView && activeTab === "profile" && <Profile role={role} student={currentStudent} />}

          {!reportView && role === "teacher" && activeTab === "review" && (
            <TeacherDashboard onOpenReport={openTeacherReport} />
          )}
        </main>
      </div>
    </div>
  );
}
