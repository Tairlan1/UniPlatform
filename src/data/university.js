/**
 * Демо-данные университета: учётные записи, курсы, расписание заданий,
 * справочники. Вынесено из App.jsx при разборе на модули - чистые данные
 * без JSX, поэтому перенос механический и безопасный.
 */

import { FileText, Clock, CheckCircle2, AlertCircle } from "lucide-react";

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

const AUTHOR_DISPLAY_NAMES = {
  ArthurConanDoyle: "Arthur Conan Doyle",
  EdgarAllanPoe: "Edgar Allan Poe",
  "H.G.Wells": "H.G. Wells",
  JackLondon: "Jack London",
  MarkTwain: "Mark Twain",
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

export {
  TODAY,
  UNIVERSITY,
  STUDENT_ACCOUNTS,
  COURSES,
  courseById,
  initialAssignments,
  SCHEDULE,
  EXTRA_EVENTS,
  ANNOUNCEMENTS,
  STATUS_META,
  COLOR_MAP,
  AUTHOR_DISPLAY_NAMES,
};
