/**
 * Пункты бокового меню для роли студента и преподавателя.
 */

import {
  Home, BookOpen, CalendarDays, Calendar as CalendarIcon, ClipboardList,
  BarChart3, Bell, User, Users,
} from "lucide-react";

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

export { STUDENT_NAV_ITEMS, TEACHER_NAV_ITEMS };
