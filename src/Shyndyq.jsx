import React from "react";
import { Sparkles, ChevronLeft, Info, ShieldAlert, ShieldCheck, ShieldQuestion, Loader2 } from "lucide-react";

/* ============================== ВИЗУАЛЬНЫЕ ТОКЕНЫ ВЕРДИКТА ============================== */

const VERDICT_META = {
  green: { label: "Соответствует", dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", ring: "ring-emerald-500" },
  amber: { label: "Есть расхождения", dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", ring: "ring-amber-500" },
  red: { label: "Требует внимания", dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50", border: "border-red-200", ring: "ring-red-500" },
};

/* ============================== БЕЙДЖ (в списке / в шапке задания) ============================== */

/**
 * report: результат shynClient.buildReport(...) | null (если проверка ещё не запускалась)
 * loading: идёт анализ прямо сейчас (после сдачи работы)
 * onClick: переход на полный отчёт (недоступен, пока нет отчёта)
 */
export function ShyndyqBadge({ report, loading, compact = false, onClick }) {
  const clickable = !!(onClick && report && report.status === "ready");

  if (loading) {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50/80 ${compact ? "px-2 py-0.5" : "pl-2 pr-3 py-1"}`}>
        <Loader2 size={compact ? 10 : 12} className="text-violet-500 animate-spin" />
        <span className={`font-bold uppercase tracking-wider text-violet-700 ${compact ? "text-[9px]" : "text-[11px]"}`}>
          {compact ? "Shyndyq" : "Анализ стиля…"}
        </span>
      </span>
    );
  }

  if (!report) {
    return null;
  }

  if (report.status === "insufficient_data") {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 ${compact ? "px-2 py-0.5" : "pl-2 pr-3 py-1"}`}>
        <ShieldQuestion size={compact ? 10 : 12} className="text-slate-400" />
        <span className={`font-bold uppercase tracking-wider text-slate-500 ${compact ? "text-[9px]" : "text-[11px]"}`}>
          {compact ? "Shyndyq" : "Недостаточно данных"}
        </span>
      </span>
    );
  }

  const meta = VERDICT_META[report.verdict];
  const Icon = report.verdict === "green" ? ShieldCheck : report.verdict === "amber" ? ShieldAlert : ShieldAlert;

  // compact: используется внутри строк списков, которые сами по себе часто
  // кликабельны — рендерим как <span>, а не <button>, чтобы не вкладывать
  // интерактивные элементы друг в друга; клик наружу (если передан onClick)
  // всё равно навигирует через stopPropagation на span.
  if (compact) {
    const Tag = clickable ? "span" : "span";
    return (
      <Tag
        onClick={clickable ? (e) => { e.stopPropagation(); onClick(); } : undefined}
        role={clickable ? "button" : undefined}
        className={`inline-flex items-center gap-1 rounded-full border ${meta.border} ${meta.bg} px-2 py-0.5 ${clickable ? "hover:brightness-95 cursor-pointer" : ""}`}
        title={`Стиль ${report.styleScore}% · ИИ ${report.aiScore}%`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
        <span className="text-[9px] font-bold uppercase tracking-wider text-violet-700">Shyndyq</span>
      </Tag>
    );
  }

  return (
    <span
      onClick={clickable ? onClick : undefined}
      role={clickable ? "button" : undefined}
      className={`inline-flex items-center gap-2 rounded-full border ${meta.border} bg-gradient-to-r ${meta.bg} to-white pl-2 pr-3 py-1 transition-all ${clickable ? "hover:shadow-sm hover:-translate-y-px cursor-pointer" : ""}`}
    >
      <span className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center shrink-0">
        <Sparkles size={11} className="text-white" />
      </span>
      <span className="text-[11px] font-bold uppercase tracking-wider text-violet-700">Shyndyq</span>
      <span className="w-px h-3 bg-violet-200" />
      <span className="text-[11px] text-slate-500">
        Стиль <span className="font-bold text-slate-800">{report.styleScore}%</span>
      </span>
      <span className="text-[11px] text-slate-500">
        ИИ <span className="font-bold text-slate-800">{report.aiScore}%</span>
      </span>
      <Icon size={13} className={meta.text} />
    </span>
  );
}

/* ============================== ПОЛОСКА МЕТРИКИ (baseline vs текущая работа) ============================== */

function MetricBar({ label, baseline, current }) {
  const delta = current - baseline;
  const deltaAbs = Math.abs(delta);
  const deltaColor = deltaAbs <= 8 ? "text-emerald-600" : deltaAbs <= 20 ? "text-amber-600" : "text-red-600";
  return (
    <div className="py-2.5">
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="font-medium text-slate-700">{label}</span>
        <span className={`font-semibold ${deltaColor}`}>
          {delta > 0 ? "+" : ""}{delta} п.п.
        </span>
      </div>
      <div className="relative h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className="absolute inset-y-0 left-0 bg-slate-300 rounded-full" style={{ width: `${baseline}%` }} />
        <div className="absolute inset-y-0 left-0 bg-violet-500 rounded-full opacity-70" style={{ width: `${current}%` }} />
      </div>
      <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300" /> обычно у студента</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-500" /> в этой работе</span>
      </div>
    </div>
  );
}

/* ============================== ПОЛНЫЙ ОТЧЁТ ============================== */

/**
 * report: результат shynClient.buildReport(...)
 * context: { studentName, assignmentTitle, courseTitle, submittedAt }
 * isTeacher: показывает дополнительные действия преподавателя
 * onBack, onAction(action)
 */
export function ShyndyqReport({ report, context, isTeacher = false, onBack, onAction }) {
  if (!report) return null;

  if (report.status === "insufficient_data") {
    return (
      <div>
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-4">
          <ChevronLeft size={16} /> Назад
        </button>
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
              <ShieldQuestion size={16} className="text-slate-400" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">Shyndyq · Недостаточно данных</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{report.note}</p>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 w-fit">
            Собрано работ: <span className="font-semibold text-slate-700">{report.priorWorksCount}</span> из {report.minPriorWorks}, необходимых для построения профиля
          </div>
        </div>
      </div>
    );
  }

  const meta = VERDICT_META[report.verdict];

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-4">
        <ChevronLeft size={16} /> Назад
      </button>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Заголовок */}
        <div className="p-5 sm:p-6 border-b border-slate-100">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center shrink-0">
                  <Sparkles size={13} className="text-white" />
                </span>
                <h2 className="text-lg font-bold text-slate-900">Отчёт Shyndyq</h2>
              </div>
              {context && (
                <p className="text-xs text-slate-500 mt-1.5">
                  {context.studentName && <>{context.studentName} · </>}
                  {context.assignmentTitle} {context.courseTitle && <>· {context.courseTitle}</>}
                </p>
              )}
            </div>
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${meta.bg} ${meta.text} ${meta.border}`}>
              <span className={`w-2 h-2 rounded-full ${meta.dot}`} /> {meta.label}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mt-5">
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Совпадение со стилем студента</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{report.styleScore}%</p>
              <p className="text-[11px] text-slate-400 mt-1">Сравнение с {report.priorWorksCount} прошлыми самостоятельными работами</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Вероятность ИИ-происхождения</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{report.aiScore}%</p>
              <p className="text-[11px] text-slate-400 mt-1">Эвристическая оценка, не детектор с гарантией</p>
            </div>
          </div>
        </div>

        {/* Дисклеймер */}
        <div className="mx-5 sm:mx-6 mt-5 flex items-start gap-2 text-xs text-slate-600 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5">
          <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
          <span>{report.disclaimer}</span>
        </div>

        {/* Метрики */}
        <div className="p-5 sm:p-6">
          <h4 className="text-sm font-bold text-slate-800 mb-1">Разбор по метрикам стиля</h4>
          <div className="divide-y divide-slate-100">
            {report.metrics.map((m) => (
              <MetricBar key={m.key} label={m.label} baseline={m.baseline} current={m.current} />
            ))}
          </div>
        </div>

        {/* Замечания */}
        {report.highlights?.length > 0 && (
          <div className="px-5 sm:px-6 pb-6">
            <h4 className="text-sm font-bold text-slate-800 mb-2">Наблюдения</h4>
            <ul className="space-y-1.5">
              {report.highlights.map((h, i) => (
                <li key={i} className="text-sm text-slate-600 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 leading-relaxed">
                  {h}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Действия преподавателя */}
        {isTeacher && (
          <div className="px-5 sm:px-6 pb-6 pt-1 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-800 mb-3 mt-4">Решение преподавателя</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onAction?.("accept")}
                className="text-xs font-semibold px-3 py-2 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
              >
                Принять без вопросов
              </button>
              <button
                onClick={() => onAction?.("discuss")}
                className="text-xs font-semibold px-3 py-2 rounded-lg border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
              >
                Пригласить на беседу
              </button>
              <button
                onClick={() => onAction?.("escalate")}
                className="text-xs font-semibold px-3 py-2 rounded-lg border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
              >
                Передать в комиссию
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-2.5">
              Итоговое решение принимает только преподаватель. Отчёт Shyn — вспомогательный сигнал, а не автоматический вердикт.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
