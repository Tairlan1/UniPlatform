import React, { useState } from "react";
import {
  Sparkles, ChevronLeft, Info, ShieldAlert, ShieldCheck, ShieldQuestion, Loader2,
  Mail, AlertTriangle,
} from "lucide-react";

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
  if (!meta) {
    // Неизвестный/отсутствующий verdict (например report.status === "error",
    // либо источник отчёта не был приведён к ожидаемой форме) - не роняем
    // рендер всего приложения, просто не показываем бейдж.
    return null;
  }
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

/* ============================== РЕАЛЬНЫЙ ОТЧЁТ (api_analyze.py) ==============================
   В отличие от мок-отчёта (styleScore/aiScore/metrics/highlights как один
   плоский набор чисел), настоящий отчёт даёт по каждому абзацу СВОИ
   независимые style/AI-теги (см. api_analyze.py: styleTier/aiTier), поэтому
   подсветка текста разделена на две вкладки — ровно как в report.html
   (Flask-версии): "Авторский стиль" и "AI Detection" никогда не смешиваются
   в одной покраске одного фрагмента. */

const TIER_META = {
  green: { cls: "bg-emerald-50 border-emerald-200", dot: "bg-emerald-500", text: "text-emerald-800" },
  yellow: { cls: "bg-amber-50 border-amber-200", dot: "bg-amber-500", text: "text-amber-800" },
  red: { cls: "bg-red-50 border-red-200", dot: "bg-red-500", text: "text-red-800" },
  neutral: { cls: "bg-slate-50 border-slate-200", dot: "bg-slate-300", text: "text-slate-500" },
};

function pct(x) { return x === null || x === undefined ? null : Math.round(x * 1000) / 10; }

function ParagraphHighlight({ p, mode }) {
  if (mode === "disabled") {
    const meta = TIER_META.neutral;
    return (
      <div className={`rounded-lg border px-3.5 py-3 ${meta.cls}`}>
        <p className="text-sm leading-relaxed whitespace-pre-line text-slate-500">{p.text}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px]">
          <span className={`inline-flex items-center gap-1 font-semibold ${meta.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} /> подсветка отключена
          </span>
          <span className="opacity-50 text-slate-500">{p.wordCount} слов</span>
        </div>
      </div>
    );
  }
  const tier = mode === "style" ? p.styleTier : p.aiTier;
  const meta = TIER_META[tier] || TIER_META.neutral;
  const score = mode === "style" ? pct(p.styleScore) : pct(p.aiScore);
  return (
    <div className={`rounded-lg border px-3.5 py-3 ${meta.cls}`}>
      <p className="text-sm leading-relaxed whitespace-pre-line text-slate-800">{p.text}</p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px]">
        <span className={`inline-flex items-center gap-1 font-semibold ${meta.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
          {tier === null
            ? "фрагмент слишком короткий для оценки стиля"
            : mode === "style"
              ? (score !== null ? `совпадение со стилем: ${score}%` : "н/д")
              : `AI-скор: ${score}%`}
        </span>
        <span className="opacity-50 text-slate-500">{p.wordCount} слов</span>
      </div>
    </div>
  );
}

/** Готовит mailto-ссылку с нейтральной, неосуждающей формулировкой — тон
 * зависит от уровня (red/yellow/green), но НИКОГДА не формулируется как
 * обвинение: инструмент лишь просит о встрече, решение остаётся за
 * преподавателем (см. также справку для комиссии). */
function buildTeacherMailto({ studentEmail, studentName, assignmentTitle, docAiTier, teacherName }) {
  const name = studentName || "коллега";
  const title = assignmentTitle || "вашей работе";
  let subject = `По работе «${title}»`;
  let body;
  if (docAiTier === "red") {
    subject = `Нужно обсудить вашу работу «${title}»`;
    body = `Добрый день, ${name}!\n\n` +
      `При проверке работы «${title}» автоматическая система Shyndyq отметила ряд статистических признаков, которые иногда встречаются в текстах, сгенерированных ИИ. Это не является доказательством само по себе и не заменяет наш с вами разговор.\n\n` +
      `Прошу подойти на консультацию в удобное для вас время, чтобы обсудить процесс работы над текстом.\n\n` +
      `С уважением,\n${teacherName || "[Ваше имя]"}`;
  } else if (docAiTier === "yellow") {
    body = `Добрый день, ${name}!\n\n` +
      `По вашей работе «${title}» есть несколько моментов, которые хотелось бы уточнить в личной беседе — ничего серьёзного, просто хочу лучше понять ход вашей работы над текстом.\n\n` +
      `Подойдите, пожалуйста, на консультацию в удобное время.\n\n` +
      `С уважением,\n${teacherName || "[Ваше имя]"}`;
  } else {
    body = `Добрый день, ${name}!\n\n` +
      `Хотел(а) бы обсудить вашу работу «${title}» — подойдите, пожалуйста, на консультацию в удобное время.\n\n` +
      `С уважением,\n${teacherName || "[Ваше имя]"}`;
  }
  const params = new URLSearchParams({ subject, body });
  return `mailto:${studentEmail || ""}?${params.toString().replace(/\+/g, "%20")}`;
}

function TeacherDecisionBlock({ onAction, mailtoHref, hasEmail }) {
  return (
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
        {hasEmail && (
          <a
            href={mailtoHref}
            className="text-xs font-semibold px-3 py-2 rounded-lg border border-cyan-300 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 transition-colors inline-flex items-center gap-1.5"
          >
            <Mail size={13} /> Написать студенту
          </a>
        )}
      </div>
      <p className="text-[11px] text-slate-400 mt-2.5">
        Итоговое решение принимает только преподаватель. Отчёт Shyndyq — вспомогательный сигнал, а не автоматический вердикт.
      </p>
    </div>
  );
}

function RealShyndyqReport({ report, context, isTeacher, onBack, onAction, teacherName }) {
  const [mode, setMode] = useState("style");

  if (report.status === "error") {
    return (
      <div>
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-4">
          <ChevronLeft size={16} /> Назад
        </button>
        <div className="bg-white rounded-xl border border-red-200 p-6 max-w-2xl">
          <p className="text-sm text-red-700">Не удалось получить анализ: {report.message}</p>
        </div>
      </div>
    );
  }

  const aiTier = report.docAiTier;
  const styleReliable = report.styleReliable !== false;
  const stylePct = pct(report.docStyleScore);
  const aiPct = pct(report.docAiScore);
  const mailtoHref = buildTeacherMailto({
    studentEmail: context?.studentEmail,
    studentName: context?.studentName,
    assignmentTitle: context?.assignmentTitle,
    docAiTier: aiTier,
    teacherName,
  });

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-4">
        <ChevronLeft size={16} /> Назад
      </button>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
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
          </div>

          {/* Тревожный баннер - ЖЁСТКИЙ (красный) только при доказанном ИИ,
              МЯГКИЙ (жёлтый, без обвинения) при неоднозначных признаках. */}
          {aiTier === "red" && (
            <div className="mt-4 flex items-start gap-2.5 rounded-lg border-2 border-red-300 bg-red-50 px-4 py-3">
              <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
              <div className="text-sm text-red-900">
                <b className="block uppercase text-xs tracking-wide mb-0.5">Текст с высокой вероятностью сгенерирован ИИ</b>
                Совпадение стиля в этом случае недостоверно и не показывается как значимое.
              </div>
            </div>
          )}
          {aiTier === "yellow" && (
            <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
              <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-900">
                <b className="block text-xs uppercase tracking-wide mb-0.5">Есть основания присмотреться внимательнее</b>
                Не доказательство — рекомендуется, чтобы преподаватель сам просмотрел отмеченные фрагменты.
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-3 mt-5">
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Совпадение со стилем {context?.expectedAuthorDisplay || "автора"}</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">
                {aiTier === "red" ? "Н/Д" : (stylePct !== null ? `${stylePct}%` : "н/д")}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {aiTier === "red" ? "Не показывается — см. баннер выше" : "Модель атрибуции стиля (5 известных авторов)"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">AI Detection</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{aiPct}%</p>
              <p className="text-[11px] text-slate-400 mt-1">{report.flaggedParagraphs} из {report.totalParagraphs} фрагментов отмечены</p>
            </div>
          </div>
        </div>

        <div className="mx-5 sm:mx-6 mt-5 flex items-start gap-2 text-xs text-slate-600 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5">
          <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
          <span>{report.disclaimer}</span>
        </div>

        {/* Подсветка по абзацам - две вкладки, ПОЛНОСТЬЮ независимые
            (см. комментарий у TIER_META выше). */}
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-slate-800">Подсветка по фрагментам</h4>
            <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => setMode("style")}
                className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${mode === "style" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
              >
                Авторский стиль
              </button>
              <button
                onClick={() => setMode("ai")}
                className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${mode === "ai" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
              >
                AI Detection
              </button>
            </div>
          </div>
          {mode === "style" && !styleReliable && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
              Подсветка стиля отключена — текст с высокой вероятностью сгенерирован ИИ, посегментное сравнение со стилем автора недостоверно.
            </p>
          )}
          <div className="space-y-2.5">
            {report.paragraphs.map((p, i) => (
              <ParagraphHighlight key={i} p={p} mode={mode === "style" && !styleReliable ? "disabled" : mode} />
            ))}
          </div>
        </div>

        {isTeacher && (
          <TeacherDecisionBlock onAction={onAction} mailtoHref={mailtoHref} hasEmail={!!context?.studentEmail} />
        )}
      </div>
    </div>
  );
}



/**
 * report: результат shynClient.buildReport(...)
 * context: { studentName, assignmentTitle, courseTitle, submittedAt }
 * isTeacher: показывает дополнительные действия преподавателя
 * onBack, onAction(action)
 */
export function ShyndyqReport({ report, context, isTeacher = false, onBack, onAction, teacherName }) {
  if (!report) return null;

  if (report.source === "real") {
    return (
      <RealShyndyqReport
        report={report}
        context={context}
        isTeacher={isTeacher}
        onBack={onBack}
        onAction={onAction}
        teacherName={teacherName}
      />
    );
  }

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
          <TeacherDecisionBlock
            onAction={onAction}
            mailtoHref={buildTeacherMailto({
              studentEmail: context?.studentEmail,
              studentName: context?.studentName,
              assignmentTitle: context?.assignmentTitle,
              docAiTier: report.verdict === "red" ? "red" : report.verdict === "amber" ? "yellow" : "green",
              teacherName,
            })}
            hasEmail={!!context?.studentEmail}
          />
        )}
      </div>
    </div>
  );
}
