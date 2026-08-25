/**
 * shynClient.js
 * ─────────────────────────────────────────────────────────────────────────
 * Клиент интеграции с Shyn (сервис проверки стиля/ИИ-происхождения работ).
 *
 * В проде это тонкая обёртка над реальным API Shyn, подключённым через LTI
 * 1.3 к университетской платформе: университет передаёт сдачу работы через
 * вебхук, Shyn обрабатывает её асинхронно и возвращает отчёт по колбэку —
 * см. app.py в репозитории Shyn (роуты /submit, /job-status/<id>,
 * /report/<id>).
 *
 * В этой демо-сборке нет бэкенда — функции ниже мокают тот же контракт
 * (jobId → polling → отчёт) на клиенте, с детерминированной псевдослучайной
 * генерацией баллов по seed'у, чтобы демонстрация была стабильной между
 * перезагрузками. Реальная замена — просто заменить тела функций на fetch()
 * к настоящему API, сигнатуры и форма данных остаются те же.
 */

// Простой детерминированный хэш строки → число [0, 1)
function seededRandom(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  // Превращаем в [0, 1)
  return () => {
    h = (Math.imul(1664525, h) + 1013904223) | 0;
    return ((h >>> 0) % 100000) / 100000;
  };
}

const METRIC_LABELS = [
  { key: "sentenceLength", label: "Длина предложений" },
  { key: "lexicalVariety", label: "Лексическое разнообразие" },
  { key: "punctuation", label: "Пунктуационный рисунок" },
  { key: "paragraphRhythm", label: "Ритм абзацев" },
  { key: "connectiveWords", label: "Служебные слова и связки" },
];

function verdictFromScores(styleScore, aiScore) {
  if (aiScore >= 55 || styleScore <= 45) return "red";
  if (aiScore >= 30 || styleScore <= 70) return "amber";
  return "green";
}

/**
 * Строит отчёт по фиксированному seed'у (id сдачи) — детерминированно,
 * чтобы одна и та же сдача всегда показывала одинаковый результат.
 *
 * @param {Object} params
 * @param {string} params.submissionId — уникальный id сдачи (напр. id задания)
 * @param {number} params.priorWorksCount — сколько прошлых самостоятельных
 *   работ этого студента уже в базе (для порога «достаточно данных»)
 * @param {"low"|"mid"|"high"|"flagged"} [params.profile] — задать сценарий
 *   вручную для демо-данных вместо чисто случайного
 */
export function buildReport({ submissionId, priorWorksCount = 0, profile }) {
  const MIN_PRIOR_WORKS = 3;
  const rand = seededRandom(submissionId);

  if (priorWorksCount < MIN_PRIOR_WORKS) {
    return {
      submissionId,
      status: "insufficient_data",
      priorWorksCount,
      minPriorWorks: MIN_PRIOR_WORKS,
      note:
        "Профиль стиля студента ещё формируется. Обычно достаточно данных " +
        "накапливается за один семестр — до этого момента показатель " +
        "не отображается, чтобы не вводить в заблуждение.",
    };
  }

  // Профиль задаёт диапазон, внутри диапазона — детерминированный разброс
  const ranges = {
    high: { style: [86, 97], ai: [1, 9] },
    mid: { style: [70, 85], ai: [10, 25] },
    low: { style: [55, 69], ai: [26, 44] },
    flagged: { style: [30, 52], ai: [45, 78] },
  };
  const r = ranges[profile] || ranges.high;
  const styleScore = Math.round(r.style[0] + rand() * (r.style[1] - r.style[0]));
  const aiScore = Math.round(r.ai[0] + rand() * (r.ai[1] - r.ai[0]));
  const verdict = verdictFromScores(styleScore, aiScore);

  const metrics = METRIC_LABELS.map((m) => {
    const baseline = Math.round(40 + rand() * 40);
    const drift = Math.round((rand() - 0.5) * (verdict === "green" ? 10 : verdict === "amber" ? 26 : 46));
    return {
      key: m.key,
      label: m.label,
      baseline,
      current: Math.max(0, Math.min(100, baseline + drift)),
    };
  });

  const highlightPool = [
    "Резкий переход к более формальной лексике по сравнению с предыдущими работами студента.",
    "Синтаксис абзаца заметно однороднее обычного — предложения почти одинаковой длины.",
    "Использование связок, нехарактерных для прежних сдач этого студента.",
    "Пунктуационный рисунок совпадает с типичным для студента почерком письма.",
    "Ритм чередования коротких и длинных предложений соответствует прошлым работам.",
  ];
  const highlightsCount = verdict === "green" ? 1 : verdict === "amber" ? 2 : 3;
  const highlights = Array.from({ length: highlightsCount }, (_, i) => highlightPool[(Math.floor(rand() * highlightPool.length) + i) % highlightPool.length]);

  return {
    submissionId,
    status: "ready",
    priorWorksCount,
    styleScore,
    aiScore,
    verdict, // 'green' | 'amber' | 'red'
    metrics,
    highlights,
    generatedAt: new Date(),
    disclaimer:
      "Это вспомогательный индикатор для преподавателя. Он не является " +
      "автоматическим обвинением и не должен использоваться как " +
      "единственное основание для решения — финальный вердикт всегда " +
      "выносит преподаватель.",
  };
}

/**
 * Имитация асинхронного пайплайна Shyn: POST /submit → job_id →
 * GET /job-status/<id> (poll) → GET /report/<id>.
 * В реальной интеграции это тот же полинг, просто через сеть.
 */
export function analyzeSubmission(opts) {
  return new Promise((resolve) => {
    const delay = 1400 + Math.round(seededRandom(opts.submissionId)() * 900);
    setTimeout(() => resolve(buildReport(opts)), delay);
  });
}
