/**
 * shynApiClient.js
 * ─────────────────────────────────────────────────────────────────────────
 * Настоящий сетевой клиент к Shyn (не мок). Дёргает Flask-эндпоинт
 * api_analyze.py по HTTP и возвращает то, что реально вернула обученная
 * модель — без предвычислений на стороне фронтенда.
 *
 * Чтобы это заработало у вас локально:
 *   1) в репозитории Shyn:  pip install flask flask-cors --break-system-packages
 *                            python3 api_analyze.py
 *      (поднимет сервер на http://127.0.0.1:5001)
 *   2) в репозитории UniPlatform:  npm run dev
 *      (Vite dev-сервер по умолчанию слушает http://localhost:5173,
 *       CORS на бэкенде уже открыт)
 */

export const SHYN_API_BASE = "http://127.0.0.1:5001";

export class ShynApiError extends Error {}

export async function checkShynApiHealth() {
  try {
    const res = await fetch(`${SHYN_API_BASE}/api/v1/health`, { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Реальный вызов анализа. Либо file (File-объект из <input type="file">),
 * либо text (строка) — что передано, то и анализируется.
 *
 * @returns {Promise<Object>} JSON от api_analyze.py: docStyleScore,
 *   docAiScore, paragraphs: [{ text, wordCount, styleScore, topAuthor,
 *   topAuthorProb, aiScore, flag }], modelInfo, ...
 */
export async function analyzeSubmission({ file, text, expectedAuthor }) {
  const form = new FormData();
  if (file) form.append("file", file);
  if (text) form.append("text", text);
  form.append("expected_author", expectedAuthor || "");

  let res;
  try {
    res = await fetch(`${SHYN_API_BASE}/api/v1/analyze`, { method: "POST", body: form });
  } catch (e) {
    throw new ShynApiError(
      `Не удалось связаться с Shyn API на ${SHYN_API_BASE}. Убедитесь, что запущен ` +
      `"python3 api_analyze.py" в репозитории Shyn. (${e.message})`
    );
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ShynApiError(body.error || `Shyn API вернул ошибку ${res.status}`);
  }
  return res.json();
}
