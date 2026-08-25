import React, { useState, useEffect } from "react";
import {
  Sparkles, ChevronLeft, Info, Loader2, Upload, FileText, X,
  AlertCircle, CheckCircle2,
} from "lucide-react";
import { analyzeSubmission, checkShynApiHealth, SHYN_API_BASE } from "./shynApiClient";

export const AUTHOR_ACCOUNTS = [
  { login: "a.doyle", password: "engine2026", authorKey: "ArthurConanDoyle", displayName: "Arthur Conan Doyle", initials: "AD" },
  { login: "e.poe", password: "engine2026", authorKey: "EdgarAllanPoe", displayName: "Edgar Allan Poe", initials: "EP" },
  { login: "h.wells", password: "engine2026", authorKey: "H.G.Wells", displayName: "H. G. Wells", initials: "HW" },
  { login: "j.london", password: "engine2026", authorKey: "JackLondon", displayName: "Jack London", initials: "JL" },
  { login: "m.twain", password: "engine2026", authorKey: "MarkTwain", displayName: "Mark Twain", initials: "MT" },
];

/* ============================== БЕЙДЖ СТИЛЯ/ИИ (тот же язык, что ShyndyqBadge) ============================== */

function EngineBadge({ status, docStyleScore, docAiScore, onOpenReport }) {
  if (status === "idle") return null;

  if (status === "loading") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50/80 pl-2 pr-3 py-1">
        <Loader2 size={12} className="text-violet-500 animate-spin" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-violet-700">Shyndyq анализирует…</span>
      </span>
    );
  }

  const stylePct = docStyleScore === null ? null : Math.round(docStyleScore * 1000) / 10;
  const aiPct = Math.round(docAiScore * 1000) / 10;
  const verdictColor = aiPct >= 50 ? "red" : stylePct !== null && stylePct < 35 ? "amber" : "green";
  const border = { green: "border-emerald-200", amber: "border-amber-200", red: "border-red-200" }[verdictColor];
  const bg = { green: "bg-emerald-50", amber: "bg-amber-50", red: "bg-red-50" }[verdictColor];

  return (
    <button
      onClick={onOpenReport}
      className={`inline-flex items-center gap-2 rounded-full border ${border} ${bg} pl-2 pr-3 py-1 hover:shadow-sm hover:-translate-y-px transition-all cursor-pointer`}
    >
      <span className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center shrink-0">
        <Sparkles size={11} className="text-white" />
      </span>
      <span className="text-[11px] font-bold uppercase tracking-wider text-violet-700">Shyndyq</span>
      <span className="w-px h-3 bg-violet-200" />
      <span className="text-[11px] text-slate-500">
        Стиль <span className="font-bold text-slate-800">{stylePct === null ? "—" : `${stylePct}%`}</span>
      </span>
      <span className="text-[11px] text-slate-500">
        ИИ <span className="font-bold text-slate-800">{aiPct}%</span>
      </span>
      <span className="text-[11px] font-semibold text-violet-700">Отчёт →</span>
    </button>
  );
}

/* ============================== ПОДСВЕЧЕННЫЙ АБЗАЦ ============================== */

const FLAG_META = {
  match: { label: "Совпадает со стилем", cls: "bg-emerald-50 border-emerald-200 text-emerald-900", dot: "bg-emerald-500" },
  style_mismatch: { label: "Стиль расходится", cls: "bg-amber-50 border-amber-200 text-amber-900", dot: "bg-amber-500" },
  ai_flag: { label: "Похоже на ИИ-текст", cls: "bg-red-50 border-red-200 text-red-900", dot: "bg-red-500" },
  too_short: { label: "Слишком короткий фрагмент — не анализировался", cls: "bg-slate-50 border-slate-200 text-slate-600", dot: "bg-slate-300" },
};

function ParagraphBlock({ p }) {
  const meta = FLAG_META[p.flag] || FLAG_META.too_short;
  return (
    <div className={`rounded-lg border px-3.5 py-3 ${meta.cls}`}>
      <p className="text-sm leading-relaxed whitespace-pre-line">{p.text}</p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px]">
        <span className="inline-flex items-center gap-1 font-semibold">
          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} /> {meta.label}
        </span>
        {p.styleScore !== null && (
          <span className="opacity-70">
            своя вероятность {Math.round(p.styleScore * 1000) / 10}% · топ: {p.topAuthor} ({Math.round(p.topAuthorProb * 1000) / 10}%)
          </span>
        )}
        {p.aiScore !== null && <span className="opacity-70">ИИ-скор {Math.round(p.aiScore * 1000) / 10}% ({p.aiSource === "trained_classifier" ? "модель" : "эвристика"})</span>}
        <span className="opacity-50">{p.wordCount} слов</span>
      </div>
    </div>
  );
}

/* ============================== ПОЛНЫЙ ОТЧЁТ ============================== */

function EngineReport({ result, expectedAuthorName, onBack }) {
  const stylePct = result.docStyleScore === null ? null : Math.round(result.docStyleScore * 1000) / 10;
  const aiPct = Math.round(result.docAiScore * 1000) / 10;

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-4">
        <ChevronLeft size={16} /> Назад
      </button>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center shrink-0">
              <Sparkles size={13} className="text-white" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">Отчёт Shyndyq</h2>
            <span className="text-[10px] font-bold uppercase tracking-wide text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full ml-1">
              живой вызов API
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1.5">Сверка со стилем: {expectedAuthorName} · {result.totalParagraphs} абзацев, {result.flaggedParagraphs} с расхождением</p>

          <div className="grid sm:grid-cols-2 gap-3 mt-5">
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Стиль % (по документу)</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{stylePct === null ? "—" : `${stylePct}%`}</p>
              <p className="text-[11px] text-slate-400 mt-1">Средняя вероятность «своего» автора по абзацам ≥ 25 слов</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">ИИ % (по документу)</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{aiPct}%</p>
              <p className="text-[11px] text-slate-400 mt-1">Средний ИИ-скор по абзацам (обученный классификатор)</p>
            </div>
          </div>
        </div>

        <div className="mx-5 sm:mx-6 mt-5 flex items-start gap-2 text-xs text-slate-600 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5">
          <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
          <span>Индикатор для преподавателя, не автоматический вердикт. Ниже — разбор по каждому абзацу присланного текста, без сокращений.</span>
        </div>

        <div className="p-5 sm:p-6 space-y-2.5">
          {result.paragraphs.map((p, i) => (
            <ParagraphBlock key={i} p={p} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================== ФОРМА СДАЧИ + ГЛАВНЫЙ ЭКРАН ============================== */

export function AuthorEngineView({ account }) {
  const [apiUp, setApiUp] = useState(null); // null = проверяется, true/false
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    checkShynApiHealth().then(setApiUp);
  }, []);

  const submit = async () => {
    if (!text.trim() && !file) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await analyzeSubmission({ file, text: file ? "" : text, expectedAuthor: account.authorKey });
      setResult(res);
      setStatus("ready");
    } catch (e) {
      setErrorMsg(e.message || "Не удалось выполнить анализ.");
      setStatus("error");
    }
  };

  const reset = () => {
    setStatus("idle"); setResult(null); setText(""); setFile(null); setShowReport(false);
  };

  if (showReport && result) {
    return <EngineReport result={result} expectedAuthorName={account.displayName} onBack={() => setShowReport(false)} />;
  }

  return (
    <div>
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 mb-5">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-full bg-violet-600 text-white font-extrabold flex items-center justify-center shrink-0">
            {account.initials}
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{account.displayName}</h2>
            <p className="text-xs text-slate-500">Технический прогон · реальный вызов Shyn API, без предрасчётов</p>
          </div>
        </div>

        <div className={`mt-4 flex items-start gap-2 text-xs rounded-lg px-3 py-2.5 border ${apiUp ? "text-emerald-700 bg-emerald-50 border-emerald-100" : apiUp === false ? "text-red-700 bg-red-50 border-red-100" : "text-slate-500 bg-slate-50 border-slate-100"}`}>
          {apiUp ? <CheckCircle2 size={14} className="shrink-0 mt-0.5" /> : <AlertCircle size={14} className="shrink-0 mt-0.5" />}
          <span>
            {apiUp === null && "Проверяю подключение к Shyn API…"}
            {apiUp === true && <>Shyn API подключён ({SHYN_API_BASE}). Отправленный текст анализируется вживую обученной моделью.</>}
            {apiUp === false && (
              <>
                Shyn API недоступен на {SHYN_API_BASE}. Запустите в репозитории Shyn:{" "}
                <code className="bg-white px-1 py-0.5 rounded border border-red-100">python3 api_analyze.py</code>, затем обновите страницу.
              </>
            )}
          </span>
        </div>
      </div>

      {status !== "ready" && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-3">Сдать работу на проверку</h3>
          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); setFile(null); }}
            placeholder="Вставьте текст — можно намеренно смешать несколько абзацев в стиле автора с абзацем, сгенерированным ИИ, чтобы проверить, как модель их различает…"
            rows={6}
            disabled={!!file}
            className="w-full rounded-lg border border-slate-300 text-sm p-3 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-none disabled:bg-slate-50 disabled:text-slate-400"
          />

          <div className="mt-3">
            <label className="flex items-center gap-2 justify-center border-2 border-dashed border-slate-300 rounded-lg py-4 cursor-pointer hover:border-violet-400 hover:bg-violet-50/40 transition-colors text-sm text-slate-500">
              <Upload size={16} />
              Или прикрепить файл (.txt, .docx, .pdf)
              <input
                type="file"
                accept=".txt,.docx,.pdf"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) { setFile(f); setText(""); } }}
              />
            </label>
            {file && (
              <div className="mt-2 flex items-center gap-2 text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-fit">
                <FileText size={14} className="text-slate-400" />
                <span>{file.name}</span>
                <button onClick={() => setFile(null)} className="text-slate-400 hover:text-red-600"><X size={14} /></button>
              </div>
            )}
          </div>

          {status === "error" && (
            <div className="mt-3 flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
              <AlertCircle size={14} className="shrink-0 mt-0.5" /> {errorMsg}
            </div>
          )}

          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={submit}
              disabled={status === "loading" || (!text.trim() && !file)}
              className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2"
            >
              {status === "loading" && <Loader2 size={15} className="animate-spin" />}
              {status === "loading" ? "Анализ…" : "Сдать и прогнать через Shyndyq"}
            </button>
            <EngineBadge status={status === "loading" ? "loading" : "idle"} />
          </div>
        </div>
      )}

      {status === "ready" && result && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-800">Работа сдана и проверена</h3>
            <EngineBadge status="ready" docStyleScore={result.docStyleScore} docAiScore={result.docAiScore} onOpenReport={() => setShowReport(true)} />
          </div>
          <p className="text-xs text-slate-500 mt-2">Нажмите «Отчёт →» на бейдже, чтобы увидеть весь текст с подсветкой по абзацам.</p>
          <button onClick={reset} className="mt-4 text-xs font-medium text-slate-500 hover:text-slate-800">
            Сдать ещё один текст
          </button>
        </div>
      )}
    </div>
  );
}
