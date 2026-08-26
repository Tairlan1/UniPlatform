import React, { useState, useMemo } from "react";
import {
  Home, BookOpen, CalendarDays, Calendar as CalendarIcon, ClipboardList,
  BarChart3, Bell, User, LogOut, Upload, Paperclip, CheckCircle2, Clock,
  AlertCircle, FileText, ChevronLeft, ChevronRight, X,
  Lock, UserCircle, ChevronDown, RotateCcw, MapPin, Loader2, Sparkles,
  GraduationCap, Users
} from "lucide-react";
import { ShyndyqBadge, ShyndyqReport } from "./Shyndyq";
import { TeacherDashboard, TEACHER } from "./TeacherView";
import { buildReport, analyzeSubmission as mockAnalyzeSubmission } from "./shynClient";
import { analyzeSubmission as realAnalyzeSubmission } from "./shynApiClient";

/* ============================== ДАННЫЕ ============================== */

const TODAY = new Date(2026, 7, 24); // 24 августа 2026

const UNIVERSITY = {
  name: "DAMQOR University of Technology",
  shortName: "DAMQOR",
  motto: "Engineering the future",
};

// Каждый аккаунт студента - реальный логин/пароль для входа в тот же самый
// портал (без отдельной "инженерной" роли). Обычные студенты (STUDENT_ACCOUNTS[0])
// сравниваются с их же прошлыми работами (мок - у реальной модели нет
// эталона "личного стиля Нурлана"). У пяти "авторских" аккаунтов ниже есть
// expectedAuthor - ключ одного из пяти РЕАЛЬНО обученных стилей, поэтому их
// сдачи уходят в настоящий Shyn API (см. handleSubmitted), а не в мок.
const STUDENT_ACCOUNTS = [
  {
    login: "n.akhmetov", password: "student2026", expectedAuthor: null,
    fullName: "Ахметов Нурлан Ерланович", firstName: "Нурлан", initials: "НА",
    studentId: "21О-1147", group: "ИС-21-1",
    faculty: "Факультет информационных технологий",
    specialty: "Информационные системы (6B06103)",
    course: 3, form: "Очная, гос. грант",
    email: "n.akhmetov@damqor.edu", phone: "+7 (701) 234-56-78",
    advisor: "Сатпаева Алия Кайратовна",
  },
  {
    login: "a.doyle", password: "student2026", expectedAuthor: "ArthurConanDoyle",
    fullName: "Doyle Arthur", firstName: "Arthur", initials: "AD",
    studentId: "24Ф-0231", group: "ФИЛ-24-EN",
    faculty: "Факультет зарубежной филологии",
    specialty: "Зарубежная литература и перевод (6B02301)",
    course: 1, form: "Очная, международный обмен",
    email: "a.doyle@damqor.edu", phone: "+7 (701) 555-01-01",
    advisor: "Ким Роман Сергеевич",
  },
  {
    login: "e.poe", password: "student2026", expectedAuthor: "EdgarAllanPoe",
    fullName: "Poe Edgar", firstName: "Edgar", initials: "EP",
    studentId: "24Ф-0232", group: "ФИЛ-24-EN",
    faculty: "Факультет зарубежной филологии",
    specialty: "Зарубежная литература и перевод (6B02301)",
    course: 1, form: "Очная, международный обмен",
    email: "e.poe@damqor.edu", phone: "+7 (701) 555-01-02",
    advisor: "Ким Роман Сергеевич",
  },
  {
    login: "h.wells", password: "student2026", expectedAuthor: "H.G.Wells",
    fullName: "Wells Herbert", firstName: "Herbert", initials: "HW",
    studentId: "24Ф-0233", group: "ФИЛ-24-EN",
    faculty: "Факультет зарубежной филологии",
    specialty: "Зарубежная литература и перевод (6B02301)",
    course: 1, form: "Очная, международный обмен",
    email: "h.wells@damqor.edu", phone: "+7 (701) 555-01-03",
    advisor: "Ким Роман Сергеевич",
  },
  {
    login: "j.london", password: "student2026", expectedAuthor: "JackLondon",
    fullName: "London Jack", firstName: "Jack", initials: "JL",
    studentId: "24Ф-0234", group: "ФИЛ-24-EN",
    faculty: "Факультет зарубежной филологии",
    specialty: "Зарубежная литература и перевод (6B02301)",
    course: 1, form: "Очная, международный обмен",
    email: "j.london@damqor.edu", phone: "+7 (701) 555-01-04",
    advisor: "Ким Роман Сергеевич",
  },
  {
    login: "m.twain", password: "student2026", expectedAuthor: "MarkTwain",
    fullName: "Twain Mark", firstName: "Mark", initials: "MT",
    studentId: "24Ф-0235", group: "ФИЛ-24-EN",
    faculty: "Факультет зарубежной филологии",
    specialty: "Зарубежная литература и перевод (6B02301)",
    course: 1, form: "Очная, международный обмен",
    email: "m.twain@damqor.edu", phone: "+7 (701) 555-01-05",
    advisor: "Ким Роман Сергеевич",
  },
];

const COURSES = [
  { id: "c1", title: "Базы данных", teacher: "Сатпаева А.К.", credits: 5, color: "cyan",
    overview: "Курс посвящён реляционным СУБД: проектирование схем, нормализация, SQL, транзакции и индексирование. По итогам студенты проектируют и реализуют собственную базу данных.",
    lectures: [
      { title: "Лекция 1. Введение в реляционную модель", date: "02.09.2026" },
      { title: "Лекция 2. Нормальные формы (1НФ–3НФ)", date: "09.09.2026" },
      { title: "Лекция 3. SQL: DDL и DML", date: "16.09.2026" },
    ],
    materials: [
      { name: "Конспект_БД_Глава1.pdf", size: "1.2 МБ" },
      { name: "Практикум_SQL.docx", size: "480 КБ" },
      { name: "ER-диаграммы_примеры.zip", size: "3.4 МБ" },
    ],
    labs: [
      { title: "Лаб. работа №1 — ER-диаграмма предметной области" },
      { title: "Лаб. работа №2 — Нормализация таблиц" },
      { title: "Лаб. работа №3 — Написание SQL-запросов" },
    ],
  },
  { id: "c2", title: "Web-программирование", teacher: "Ким Р.С.", credits: 4, color: "violet",
    overview: "Разработка клиентской и серверной части веб-приложений: HTML/CSS, адаптивная вёрстка, JavaScript, основы фреймворков и работа с REST API.",
    lectures: [
      { title: "Лекция 1. HTML5 и семантическая вёрстка", date: "03.09.2026" },
      { title: "Лекция 2. CSS Grid и Flexbox", date: "10.09.2026" },
    ],
    materials: [
      { name: "HTML_CSS_шпаргалка.pdf", size: "760 КБ" },
      { name: "Пример_адаптивного_макета.zip", size: "2.1 МБ" },
    ],
    labs: [
      { title: "Практическая работа №1 — Вёрстка лендинга" },
      { title: "Практическая работа №2 — Адаптивная страница" },
    ],
  },
  { id: "c3", title: "Операционные системы", teacher: "Тулегенова Ж.Б.", credits: 4, color: "amber",
    overview: "Изучение архитектуры ОС: процессы и потоки, планирование, управление памятью, файловые системы, синхронизация.",
    lectures: [
      { title: "Лекция 1. Архитектура операционных систем", date: "01.09.2026" },
      { title: "Лекция 2. Планирование процессов", date: "08.09.2026" },
    ],
    materials: [
      { name: "ОС_Конспект_Планирование.pdf", size: "980 КБ" },
    ],
    labs: [
      { title: "Лаб. работа №3 — Алгоритмы планирования процессов" },
    ],
  },
  { id: "c4", title: "Английский язык (проф.)", teacher: "Smith J.", credits: 3, color: "rose",
    overview: "Профессионально-ориентированный английский язык для IT-специалистов: техническая лексика, чтение документации, деловая переписка.",
    lectures: [
      { title: "Unit 3. IT Vocabulary & Reading", date: "04.09.2026" },
    ],
    materials: [
      { name: "Unit3_ReadingPack.pdf", size: "540 КБ" },
    ],
    labs: [
      { title: "Reading Comprehension Task 4" },
    ],
  },
  { id: "c5", title: "История Казахстана", teacher: "Нурланов Е.М.", credits: 3, color: "emerald",
    overview: "Ключевые этапы истории Казахстана от древности до современности, включая период независимости.",
    lectures: [
      { title: "Лекция 5. Провозглашение независимости РК", date: "05.09.2026" },
    ],
    materials: [
      { name: "История_РК_Хрестоматия.pdf", size: "2.8 МБ" },
    ],
    labs: [
      { title: "Эссе — Независимость Казахстана" },
    ],
  },
  { id: "c6", title: "Физическая культура", teacher: "Батыров Д.", credits: 1, color: "slate",
    overview: "Практические занятия, направленные на физическое развитие и сдачу нормативов.",
    lectures: [],
    materials: [
      { name: "Нормативы_2026.pdf", size: "210 КБ" },
    ],
    labs: [
      { title: "Отчёт о физической подготовке" },
    ],
  },
];

const courseById = (id) => COURSES.find((c) => c.id === id);

const initialAssignments = [
  {
    id: "a1", courseId: "c3",
    title: "Лабораторная работа №3: Планирование процессов",
    description: "Реализовать и сравнить алгоритмы планирования процессов FCFS, SJF и Round Robin.",
    instructions: "1. Реализуйте три алгоритма планирования на языке C или Python.\n2. Постройте диаграммы Ганта для каждого алгоритма.\n3. Сравните среднее время ожидания и оборота.\n4. Оформите отчёт в PDF.",
    attachments: [{ name: "Задание_Лаб3.pdf", size: "310 КБ" }],
    published: "18.08.2026", deadline: new Date(2026, 7, 29, 23, 59), maxScore: 100,
    allowResubmit: true, status: "new", submission: null, grade: null, feedback: null, history: [],
  },
  {
    id: "a2", courseId: "c1",
    title: "Практическая работа: Нормализация таблиц",
    description: "Привести заданную схему базы данных к третьей нормальной форме (3НФ).",
    instructions: "1. Проанализируйте исходную таблицу «Заказы».\n2. Выполните декомпозицию до 3НФ.\n3. Опишите функциональные зависимости.\n4. Приложите итоговую ER-диаграмму.",
    attachments: [{ name: "Исходная_таблица.xlsx", size: "45 КБ" }],
    published: "10.08.2026", deadline: new Date(2026, 7, 26, 23, 59), maxScore: 100,
    allowResubmit: false, status: "review",
    submission: { text: "Приведена декомпозиция таблицы «Заказы» до 3НФ, устранены транзитивные зависимости. Подробности во вложенном файле.", files: [{ name: "Нормализация_Ахметов.pdf", size: "512 КБ" }], submittedAt: new Date(2026, 7, 23, 20, 14), late: false },
    grade: null, feedback: null,
    history: [{ submittedAt: new Date(2026, 7, 23, 20, 14), files: [{ name: "Нормализация_Ахметов.pdf", size: "512 КБ" }], grade: null }],
  },
  {
    id: "a3", courseId: "c2",
    title: "Задание 2: Верстка адаптивной страницы",
    description: "Сверстать адаптивную страницу-портфолио по предоставленному макету.",
    instructions: "1. Используйте семантическую разметку HTML5.\n2. Реализуйте адаптивность через Flexbox/Grid.\n3. Проверьте отображение на трёх разрешениях экрана.",
    attachments: [{ name: "Макет_Portfolio.fig.pdf", size: "1.1 МБ" }],
    published: "01.08.2026", deadline: new Date(2026, 7, 15, 23, 59), maxScore: 100,
    allowResubmit: false, status: "graded",
    submission: { text: "Страница сверстана согласно макету, добавлена адаптация под мобильные устройства.", files: [{ name: "portfolio_akhmetov.zip", size: "1.8 МБ" }], submittedAt: new Date(2026, 7, 14, 18, 30), late: false },
    grade: 85, feedback: "Хорошая работа. Обратите внимание на отступы в мобильной версии — местами нарушена сетка. Семантика разметки выдержана хорошо.",
    history: [{ submittedAt: new Date(2026, 7, 14, 18, 30), files: [{ name: "portfolio_akhmetov.zip", size: "1.8 МБ" }], grade: 85 }],
  },
  {
    id: "a4", courseId: "c5",
    title: "Эссе: Независимость Казахстана",
    description: "Написать аналитическое эссе (1500–2000 слов) о значении провозглашения независимости Казахстана в 1991 году.",
    instructions: "1. Раскройте исторический контекст.\n2. Проанализируйте ключевые последствия для государства.\n3. Используйте не менее 3 источников.",
    attachments: [{ name: "Требования_к_эссе.pdf", size: "180 КБ" }],
    published: "05.08.2026", deadline: new Date(2026, 7, 21, 23, 59), maxScore: 100,
    allowResubmit: false, status: "overdue", submission: null, grade: null, feedback: null, history: [],
  },
  {
    id: "a5", courseId: "c4",
    title: "Reading Comprehension Task 4",
    description: "Complete the reading comprehension exercises based on the article 'Cloud Computing Basics'.",
    instructions: "1. Read the attached article carefully.\n2. Answer all 10 comprehension questions.\n3. Submit your answers as a text response or a Word document.",
    attachments: [{ name: "Cloud_Computing_Article.pdf", size: "220 КБ" }],
    published: "20.08.2026", deadline: new Date(2026, 8, 2, 23, 59), maxScore: 50,
    allowResubmit: true, status: "new", submission: null, grade: null, feedback: null, history: [],
  },
  {
    id: "a6", courseId: "c1",
    title: "Лабораторная работа №1: ER-диаграмма",
    description: "Спроектировать ER-диаграмму для предметной области «Университетская библиотека».",
    instructions: "1. Определите сущности и атрибуты.\n2. Установите связи и их мощности.\n3. Постройте диаграмму в любом CASE-средстве.",
    attachments: [{ name: "Задание_Лаб1.pdf", size: "150 КБ" }],
    published: "20.07.2026", deadline: new Date(2026, 7, 5, 23, 59), maxScore: 100,
    allowResubmit: false, status: "graded",
    submission: { text: "ER-диаграмма спроектирована для предметной области «Библиотека», включает 6 сущностей.", files: [{ name: "ER_library_akhmetov.pdf", size: "620 КБ" }], submittedAt: new Date(2026, 7, 4, 21, 5), late: false },
    grade: 92, feedback: "Отличная работа! Диаграмма выполнена аккуратно, связи определены верно.",
    history: [{ submittedAt: new Date(2026, 7, 4, 21, 5), files: [{ name: "ER_library_akhmetov.pdf", size: "620 КБ" }], grade: 92 }],
  },
  {
    id: "a7", courseId: "c6",
    title: "Отчёт о физической подготовке",
    description: "Заполнить и отправить отчёт о выполнении контрольных нормативов за семестр.",
    instructions: "1. Заполните таблицу нормативов.\n2. Приложите справку от врача (если применимо).",
    attachments: [{ name: "Бланк_отчёта.docx", size: "60 КБ" }],
    published: "22.08.2026", deadline: new Date(2026, 8, 10, 23, 59), maxScore: 25,
    allowResubmit: true, status: "new", submission: null, grade: null, feedback: null, history: [],
  },
  {
    id: "a8", courseId: "c1",
    title: "Практическая работа: SQL-запросы",
    description: "Написать набор SQL-запросов (JOIN, GROUP BY, подзапросы) к учебной базе данных «Отдел кадров».",
    instructions: "1. Выполните 10 заданий на выборку данных.\n2. Оптимизируйте запросы при необходимости.\n3. Приложите скрипт .sql и скриншоты результатов.",
    attachments: [{ name: "Задание_SQL.pdf", size: "200 КБ" }, { name: "hr_database.sql", size: "35 КБ" }],
    published: "01.08.2026", deadline: new Date(2026, 7, 12, 23, 59), maxScore: 100,
    allowResubmit: true, status: "graded",
    submission: { text: "Выполнены все 10 запросов, скрипт и скриншоты во вложении.", files: [{ name: "sql_queries_akhmetov.sql", size: "28 КБ" }, { name: "screenshots.zip", size: "1.4 МБ" }], submittedAt: new Date(2026, 7, 11, 22, 40), late: false },
    grade: 60, feedback: "Часть запросов с GROUP BY выполнена некорректно (задания 6–8). Рекомендую пересдать работу — доступна повторная отправка.",
    history: [{ submittedAt: new Date(2026, 7, 11, 22, 40), files: [{ name: "sql_queries_akhmetov.sql", size: "28 КБ" }, { name: "screenshots.zip", size: "1.4 МБ" }], grade: 60 }],
  },
  {
    id: "a9", courseId: "c3",
    title: "Курсовая работа: Управление памятью",
    description: "Разработать и защитить курсовую работу на тему «Алгоритмы управления виртуальной памятью».",
    instructions: "1. Изучите алгоритмы замещения страниц (FIFO, LRU, Optimal).\n2. Реализуйте симулятор на выбранном языке.\n3. Подготовьте пояснительную записку.",
    attachments: [{ name: "Методичка_Курсовая.pdf", size: "890 КБ" }],
    published: "15.08.2026", deadline: new Date(2026, 8, 20, 23, 59), maxScore: 100,
    allowResubmit: true, status: "new", submission: null, grade: null, feedback: null, history: [],
  },
];

const SCHEDULE = [
  { day: "Понедельник", items: [
    { time: "09:00–09:50", course: "Базы данных", type: "Лекция", room: "ауд. 302", teacher: "Сатпаева А.К." },
    { time: "10:00–10:50", course: "Web-программирование", type: "Практика", room: "ауд. 214 (комп.)", teacher: "Ким Р.С." },
    { time: "12:20–13:10", course: "Английский язык", type: "Практика", room: "ауд. 118", teacher: "Smith J." },
  ]},
  { day: "Вторник", items: [
    { time: "09:00–09:50", course: "Операционные системы", type: "Лекция", room: "ауд. 305", teacher: "Тулегенова Ж.Б." },
    { time: "10:00–10:50", course: "Операционные системы", type: "Лаб. работа", room: "ауд. 214 (комп.)", teacher: "Тулегенова Ж.Б." },
    { time: "14:00–14:50", course: "Физическая культура", type: "Практика", room: "спортзал", teacher: "Батыров Д." },
  ]},
  { day: "Среда", items: [
    { time: "09:00–09:50", course: "История Казахстана", type: "Лекция", room: "ауд. 110", teacher: "Нурланов Е.М." },
    { time: "11:10–12:00", course: "Базы данных", type: "Лаб. работа", room: "ауд. 214 (комп.)", teacher: "Сатпаева А.К." },
  ]},
  { day: "Четверг", items: [
    { time: "09:00–09:50", course: "Web-программирование", type: "Лекция", room: "ауд. 302", teacher: "Ким Р.С." },
    { time: "10:00–10:50", course: "Английский язык", type: "Практика", room: "ауд. 118", teacher: "Smith J." },
  ]},
  { day: "Пятница", items: [
    { time: "09:00–09:50", course: "Базы данных", type: "Практика", room: "ауд. 214 (комп.)", teacher: "Сатпаева А.К." },
    { time: "11:10–12:00", course: "История Казахстана", type: "Семинар", room: "ауд. 110", teacher: "Нурланов Е.М." },
  ]},
  { day: "Суббота", items: [
    { time: "09:00–09:50", course: "Операционные системы", type: "Практика", room: "ауд. 305", teacher: "Тулегенова Ж.Б." },
  ]},
];

const EXTRA_EVENTS = [
  { date: new Date(2026, 7, 28), title: "Рубежный контроль №1 — Базы данных", type: "exam" },
  { date: new Date(2026, 8, 1), title: "Начало осеннего семестра", type: "event" },
  { date: new Date(2026, 8, 15), title: "Рубежный контроль №1 — Операционные системы", type: "exam" },
  { date: new Date(2026, 8, 22), title: "День языков народов Казахстана", type: "event" },
];

const ANNOUNCEMENTS = [
  { id: "n1", scope: "Университет", author: "Деканат ФИТ", date: new Date(2026, 7, 22),
    title: "Расписание рубежного контроля №1",
    text: "Уважаемые студенты! Расписание РК1 опубликовано в разделе «Календарь». Просьба ознакомиться заранее и уточнить аудитории у деканата." },
  { id: "n2", scope: "Базы данных", author: "Сатпаева А.К.", date: new Date(2026, 7, 20),
    title: "Перенос лабораторной работы №2",
    text: "Лабораторная работа №2 переносится на аудиторное занятие 09.09. Материалы для подготовки уже доступны в разделе «Материалы»." },
  { id: "n3", scope: "Университет", author: "Отдел стипендий", date: new Date(2026, 7, 18),
    title: "Подача документов на стипендию им. Болашак",
    text: "Приём заявок открыт до 05.09.2026. Подробности и список документов — на сайте университета в личном кабинете." },
  { id: "n4", scope: "Web-программирование", author: "Ким Р.С.", date: new Date(2026, 7, 17),
    title: "Дополнительная консультация",
    text: "В четверг после пар состоится дополнительная консультация по адаптивной вёрстке для тех, кто испытывает трудности с Grid/Flexbox." },
  { id: "n5", scope: "Университет", author: "Библиотека CAUT", date: new Date(2026, 7, 12),
    title: "Продление срока сдачи книг",
    text: "Срок возврата литературы, взятой в весеннем семестре, продлён до 1 сентября 2026 года." },
];

/* ============================== УТИЛИТЫ ============================== */

const STATUS_META = {
  new: { label: "Новое", classes: "bg-slate-100 text-slate-700 border-slate-300", icon: FileText },
  review: { label: "Ожидание", classes: "bg-blue-50 text-blue-700 border-blue-300", icon: Clock },
  graded: { label: "Проверено", classes: "bg-emerald-50 text-emerald-700 border-emerald-300", icon: CheckCircle2 },
  overdue: { label: "Просрочено", classes: "bg-red-50 text-red-700 border-red-300", icon: AlertCircle },
};

const COLOR_MAP = {
  cyan: { bg: "bg-cyan-600", light: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200", ring: "ring-cyan-500" },
  violet: { bg: "bg-violet-600", light: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", ring: "ring-violet-500" },
  amber: { bg: "bg-amber-500", light: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", ring: "ring-amber-500" },
  rose: { bg: "bg-rose-600", light: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", ring: "ring-rose-500" },
  emerald: { bg: "bg-emerald-600", light: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", ring: "ring-emerald-500" },
  slate: { bg: "bg-slate-600", light: "bg-slate-50", text: "text-slate-700", border: "border-slate-200", ring: "ring-slate-500" },
};

/**
 * SHYNDYQ — интеграция с сервисом проверки стиля/ИИ-происхождения работ.
 * Компоненты бейджа и полного отчёта вынесены в ./Shyndyq.jsx, мок-клиент,
 * повторяющий контракт реального API — в ./shynClient.js.
 *
 * Ниже — детерминированные параметры анализа для уже существующих в демо-
 * данных сдач (id сдачи, сколько предыдущих самостоятельных работ студента
 * уже накоплено, и профиль результата для наглядности сценариев).
 */
const SHYN_SEEDS = {
  a2: { priorWorksCount: 4, profile: "high" }, // на проверке — Shyndyq уже доступен
  a3: { priorWorksCount: 5, profile: "high", seed: "a3-s1" }, // тот же seed, что и в роспуске преподавателя — согласованный результат
  a6: { priorWorksCount: 3, profile: "high" },
  a8: { priorWorksCount: 3, profile: "low" }, // низкая оценка + расхождение стиля — понятная связка для демо
};

function shynReportFor(assignmentId) {
  const cfg = SHYN_SEEDS[assignmentId];
  if (!cfg) return null;
  return buildReport({
    submissionId: cfg.seed || assignmentId,
    priorWorksCount: cfg.priorWorksCount,
    profile: cfg.profile,
  });
}

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

function Logo({ size = 24, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="damqorHex" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0891B2" />
          <stop offset="1" stopColor="#0E7490" />
        </linearGradient>
      </defs>
      <path
        d="M24 2 44 13.5 44 34.5 24 46 4 34.5 4 13.5Z"
        fill="url(#damqorHex)"
      />
      <path
        d="M17 14h7.2c6.6 0 10.6 3.9 10.6 10s-4 10-10.6 10H17Zm5.1 4.4v11.2h2c3.7 0 5.6-2.1 5.6-5.6s-1.9-5.6-5.6-5.6Z"
        fill="white"
      />
      <path d="M31 12.5 34.5 9l1.8 1.8-3.5 3.5Z" fill="#FBBF24" />
    </svg>
  );
}

const STUDENT_NAV_ITEMS = [
  { key: "home", label: "Главная", icon: Home },
  { key: "courses", label: "Мои дисциплины", icon: BookOpen },
  { key: "schedule", label: "Расписание", icon: CalendarDays },
  { key: "calendar", label: "Календарь", icon: CalendarIcon },
  { key: "assignments", label: "Задания", icon: ClipboardList },
  { key: "grades", label: "Успеваемость", icon: BarChart3 },
  { key: "announcements", label: "Объявления", icon: Bell },
  { key: "profile", label: "Профиль", icon: User },
];

const TEACHER_NAV_ITEMS = [
  { key: "review", label: "Проверка работ", icon: Users },
  { key: "profile", label: "Профиль", icon: User },
];

/* ============================== ГЛАВНЫЙ КОМПОНЕНТ ============================== */

const AUTHOR_DISPLAY_NAMES = {
  ArthurConanDoyle: "Arthur Conan Doyle",
  EdgarAllanPoe: "Edgar Allan Poe",
  "H.G.Wells": "H.G. Wells",
  JackLondon: "Jack London",
  MarkTwain: "Mark Twain",
};

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
          // мок-формат отчёта и ждёт report.verdict / styleScore / aiScore.
          // У "настоящего" API этих полей нет (только docAiTier и т.п.) -
          // без этой нормализации VERDICT_META[undefined] роняет весь рендер
          // (см. баг: "сдал работу -> выкинуло на localhost:5173 и пусто").
          // Маппинг tier -> verdict — та же схема, что уже используется в
          // обратную сторону в buildTeacherMailto ниже по файлу.
          const verdict = api.docAiTier === "red" ? "red" : api.docAiTier === "yellow" ? "amber" : "green";
          setShynReports((prev) => ({
            ...prev,
            [assignmentId]: {
              source: "real",
              status: "ready",
              verdict,
              styleScore: api.docStyleScore,
              aiScore: api.docAiScore,
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
      <aside className={`fixed lg:static z-30 inset-y-0 left-0 w-64 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-200 ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
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
        <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between">
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

/* ============================== ЭКРАН ВХОДА ============================== */

function LoginScreen({ onLogin }) {
  const [loginRole, setLoginRole] = useState("student"); // 'student' | 'teacher'
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const TEACHER_CREDS = { login: "r.kim", password: "teacher2026" };

  const submit = (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Введите логин и пароль.");
      return;
    }

    if (loginRole === "student") {
      const acc = STUDENT_ACCOUNTS.find((a) => a.login === username.trim().toLowerCase());
      if (!acc || password !== acc.password) {
        setError("Неверный логин или пароль. Проверьте тестовые данные ниже.");
        return;
      }
      setError("");
      setLoading(true);
      setTimeout(() => { setLoading(false); onLogin("student", acc); }, 500);
      return;
    }

    if (username.trim().toLowerCase() !== TEACHER_CREDS.login || password !== TEACHER_CREDS.password) {
      setError("Неверный логин или пароль. Проверьте тестовые данные ниже.");
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin("teacher", null); }, 500);
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Left panel */}
        <div className="md:w-5/12 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-900 text-white p-8 flex flex-col justify-between">
          <div>
            <div className="mb-6">
              <Logo size={52} />
            </div>
            <h2 className="text-2xl font-bold leading-snug">{UNIVERSITY.name}</h2>
            <p className="text-slate-400 text-sm mt-2 italic">{UNIVERSITY.motto}</p>
          </div>
          <div className="mt-10 space-y-3 text-sm text-slate-300">
            <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-cyan-400" /> Дисциплины и учебные материалы</div>
            <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-cyan-400" /> Сдача заданий онлайн</div>
            <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-cyan-400" /> Расписание и успеваемость</div>
          </div>
          <p className="mt-10 text-[11px] text-slate-500">© {TODAY.getFullYear()} {UNIVERSITY.name}. Все права защищены.</p>
        </div>

        {/* Right panel — form */}
        <div className="md:w-7/12 p-8 sm:p-10">
          <h3 className="text-xl font-bold text-slate-900">Вход в личный кабинет</h3>
          <p className="text-sm text-slate-500 mt-1">Демо-платформа — выберите роль для входа.</p>

          <div className="mt-4 grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => { setLoginRole("student"); setUsername(""); setPassword(""); setError(""); }}
              className={`flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-md transition-colors ${loginRole === "student" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <User size={14} /> Студент
            </button>
            <button
              type="button"
              onClick={() => { setLoginRole("teacher"); setUsername(""); setPassword(""); setError(""); }}
              className={`flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-md transition-colors ${loginRole === "teacher" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <GraduationCap size={14} /> Преподаватель
            </button>
          </div>

          {loginRole === "student" && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {STUDENT_ACCOUNTS.map((a) => (
                <button
                  key={a.login}
                  type="button"
                  onClick={() => { setUsername(a.login); setPassword(a.password); setError(""); }}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-full border border-slate-200 text-slate-600 hover:border-cyan-300 hover:text-cyan-700 transition-colors"
                >
                  {a.firstName}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={submit} className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Логин</label>
              <div className="mt-1 relative">
                <UserCircle size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={loginRole === "student" ? STUDENT_ACCOUNTS[0].login : TEACHER_CREDS.login}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Пароль</label>
              <div className="mt-1 relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
            </div>

            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? "Вход..." : "Войти"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              if (loginRole === "student") { setUsername(STUDENT_ACCOUNTS[0].login); setPassword(STUDENT_ACCOUNTS[0].password); return; }
              setUsername(TEACHER_CREDS.login); setPassword(TEACHER_CREDS.password);
            }}
            className="mt-4 text-xs text-cyan-700 hover:underline"
          >
            Заполнить автоматически
          </button>

          <div className="mt-6 flex items-center justify-between text-xs text-slate-400">
            <button type="button" className="hover:text-cyan-700 hover:underline">Забыли пароль?</button>
            <button type="button" className="hover:text-cyan-700 hover:underline">Служба поддержки</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================== ГЛАВНАЯ (DASHBOARD) ============================== */

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

function Schedule() {
  return (
    <div className="space-y-4">
      {SCHEDULE.map((d) => (
        <div key={d.day} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 text-white px-4 py-2.5 text-sm font-bold">{d.day}</div>
          <div className="divide-y divide-slate-100">
            {d.items.map((it, i) => (
              <div key={i} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
                <span className="text-sm font-semibold text-slate-800 w-28 shrink-0">{it.time}</span>
                <span className="text-sm text-slate-800 flex-1 min-w-[160px]">{it.course}</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 shrink-0">{it.type}</span>
                <span className="text-xs text-slate-500 flex items-center gap-1 shrink-0"><MapPin size={12} />{it.room}</span>
                <span className="text-xs text-slate-400 shrink-0">{it.teacher}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================== КАЛЕНДАРЬ ============================== */

function CalendarView({ assignments, onOpenAssignment }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(null);

  const viewDate = new Date(TODAY.getFullYear(), TODAY.getMonth() + monthOffset, 1);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const events = useMemo(() => {
    const list = [];
    assignments.forEach((a) => list.push({ date: new Date(a.deadline), title: a.title, type: "assignment", id: a.id }));
    EXTRA_EVENTS.forEach((e) => list.push({ date: e.date, title: e.title, type: e.type }));
    return list;
  }, [assignments]);

  const firstDayIdx = (new Date(year, month, 1).getDay() + 6) % 7; // понедельник = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDayIdx; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const eventsForDay = (d) => events.filter((e) => e.date.getFullYear() === year && e.date.getMonth() === month && e.date.getDate() === d);
  const selectedEvents = selectedDay ? eventsForDay(selectedDay) : [];
  const isToday = (d) => d === TODAY.getDate() && month === TODAY.getMonth() && year === TODAY.getFullYear();

  const TYPE_DOT = { assignment: "bg-cyan-500", exam: "bg-red-500", event: "bg-amber-500" };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setMonthOffset((m) => m - 1)} className="p-1.5 rounded-lg hover:bg-slate-100"><ChevronLeft size={18} /></button>
          <h3 className="font-bold text-slate-900 capitalize">{viewDate.toLocaleDateString("ru-RU", { month: "long", year: "numeric" })}</h3>
          <button onClick={() => setMonthOffset((m) => m + 1)} className="p-1.5 rounded-lg hover:bg-slate-100"><ChevronRight size={18} /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-400 mb-1">
          {["Пн","Вт","Ср","Чт","Пт","Сб","Вс"].map((d) => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (d === null) return <div key={i} />;
            const dEvents = eventsForDay(d);
            return (
              <button
                key={i}
                onClick={() => setSelectedDay(d)}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 text-sm border transition-colors ${
                  selectedDay === d ? "border-cyan-500 bg-cyan-50" : "border-transparent hover:bg-slate-50"
                } ${isToday(d) ? "font-bold text-cyan-700" : "text-slate-700"}`}
              >
                {d}
                <div className="flex gap-0.5">
                  {dEvents.slice(0, 3).map((e, idx) => (
                    <span key={idx} className={`w-1.5 h-1.5 rounded-full ${TYPE_DOT[e.type]}`} />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h3 className="font-bold text-slate-900 mb-3">
          {selectedDay ? `События · ${selectedDay} ${viewDate.toLocaleDateString("ru-RU", { month: "long" })}` : "Выберите день"}
        </h3>
        {selectedDay && selectedEvents.length === 0 && <p className="text-sm text-slate-500">На эту дату событий нет.</p>}
        <div className="space-y-2">
          {selectedEvents.map((e, i) => (
            <button
              key={i}
              onClick={() => e.type === "assignment" && onOpenAssignment(e.id)}
              className={`w-full text-left p-3 rounded-lg border border-slate-100 ${e.type === "assignment" ? "hover:border-cyan-300 hover:bg-cyan-50/40" : ""}`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${TYPE_DOT[e.type]}`} />
                <span className="text-[11px] font-medium text-slate-400">
                  {e.type === "assignment" ? "Дедлайн задания" : e.type === "exam" ? "Экзамен / контроль" : "Событие"}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-800 mt-1">{e.title}</p>
            </button>
          ))}
        </div>
        {!selectedDay && (
          <div className="text-xs text-slate-400 space-y-1.5 mt-2">
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-cyan-500" /> Дедлайн задания</div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500" /> Экзамен / контроль</div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500" /> Учебное событие</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================== ЗАДАНИЯ (список) ============================== */

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

/* ============================== УСПЕВАЕМОСТЬ ============================== */

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

/* ============================== ОБЪЯВЛЕНИЯ ============================== */

function Announcements() {
  const [openId, setOpenId] = useState(null);
  return (
    <div className="space-y-3">
      {ANNOUNCEMENTS.map((n) => {
        const open = openId === n.id;
        return (
          <div key={n.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <button onClick={() => setOpenId(open ? null : n.id)} className="w-full text-left p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <Bell size={16} className="text-slate-500" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-semibold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full">{n.scope}</span>
                  <span className="text-[11px] text-slate-400">{n.author} · {fmtDate(n.date)}</span>
                </div>
                <p className="text-sm font-semibold text-slate-800 mt-1 truncate">{n.title}</p>
              </div>
              <ChevronDown size={18} className={`text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open && <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">{n.text}</div>}
          </div>
        );
      })}
    </div>
  );
}

/* ============================== ПРОФИЛЬ ============================== */

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
