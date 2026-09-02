import React, { useState } from "react";
import { CheckCircle2, GraduationCap, Loader2, Lock, User, UserCircle } from "lucide-react";
import Logo from "./Logo";
import { UNIVERSITY, STUDENT_ACCOUNTS, TODAY } from "../data/university";

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


export default LoginScreen;
