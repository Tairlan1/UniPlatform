#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
api_analyze.py
=====================================================================
Настоящий REST-эндпоинт для интеграции с UniPlatform (или любым другим
внешним фронтендом). В отличие от app.py (который рендерит HTML-шаблоны),
здесь — только JSON, и анализ идёт по-абзацно, чтобы можно было
подсветить в интерфейсе, какие именно куски текста совпадают со стилем
студента/автора, а какие похожи на ИИ-генерацию (в том числе внутри
ОДНОГО файла, где текст намеренно смешан).

Ничего не предвычислено и не захардкожено: каждый вызов /api/v1/analyze
реально прогоняет присланный текст через
  - model/author_style_pipeline.joblib   (стиль)
  - model_ai_detector/ai_detector_pipeline.joblib  (ИИ-детектор,
    с откатом на ai_heuristics.py для слишком коротких абзацев)

Запуск:
    pip install flask-cors --break-system-packages   # если ещё не стоит
    python3 api_analyze.py
Слушает на 127.0.0.1:5001, CORS открыт для локальной разработки
(http://localhost:5173 — дефолтный порт Vite).
"""

from __future__ import annotations

import sys
from pathlib import Path

from flask import Flask, jsonify, request

import ai_detector
import ai_heuristics
import doc_extract
import preprocess_corpus as prep
import train_model as tm

PROJECT_DIR = Path(__file__).parent
MODEL_DIR = PROJECT_DIR / "model"

# author_style_pipeline.joblib был сохранён при запуске train_model.py
# напрямую (модуль __main__), поэтому кастомные трансформеры должны быть
# видны под именем __main__.* при анлоаде — иначе joblib.load падает.
sys.modules["__main__"].StylometricFeaturizer = tm.StylometricFeaturizer
sys.modules["__main__"].DenseTransformer = tm.DenseTransformer

app = Flask(__name__)

try:
    from flask_cors import CORS
    CORS(app)
except ImportError:
    @app.after_request
    def _add_cors(resp):
        resp.headers["Access-Control-Allow-Origin"] = "*"
        resp.headers["Access-Control-Allow-Headers"] = "*"
        resp.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
        return resp

MIN_WORDS_FOR_STYLE = 25  # короче — стилометрия слишком шумная, помечаем как "too_short"
AI_FLAG_THRESHOLD = 0.5
STYLE_MATCH_THRESHOLD = 0.35  # вероятность "своего" автора ниже этого — расхождение

_PIPELINE = None
_LABEL_ENCODER = None


def _load_style_model():
    global _PIPELINE, _LABEL_ENCODER
    if _PIPELINE is None:
        _PIPELINE, _LABEL_ENCODER = tm.load_model(MODEL_DIR)
    return _PIPELINE, _LABEL_ENCODER


def _split_paragraphs(text: str) -> list[str]:
    cleaned = prep.clean_raw_text(text)
    paragraphs = [p.strip() for p in cleaned.split("\n\n")]
    return [p for p in paragraphs if p]


def _analyze_paragraph(paragraph: str, expected_author: str, pipeline, le) -> dict:
    words = [w for w in paragraph.split() if any(c.isalpha() for c in w)]
    word_count = len(words)

    entry = {
        "text": paragraph,
        "wordCount": word_count,
        "styleScore": None,
        "topAuthor": None,
        "topAuthorProb": None,
        "aiScore": None,
        "aiSource": None,
        "flag": "too_short",
    }

    # --- ИИ-детектор (работает от ~40 слов, иначе эвристика-резерв) ---
    ai_result = ai_detector.score_fragment(paragraph, PROJECT_DIR)
    if ai_result is not None:
        entry["aiScore"] = round(ai_result["ai_score"], 4)
        entry["aiSource"] = ai_result["source"]
    else:
        h = ai_heuristics.score_fragment(paragraph)
        entry["aiScore"] = round(h.get("ai_score", 0.0), 4)
        entry["aiSource"] = "heuristics_fallback"

    # --- Стилометрия (нужна более длинная выборка, иначе шумно) ---
    if word_count >= MIN_WORDS_FOR_STYLE:
        proba = pipeline.predict_proba([paragraph])[0]
        top_idx = int(proba.argmax())
        entry["topAuthor"] = le.classes_[top_idx]
        entry["topAuthorProb"] = round(float(proba[top_idx]), 4)
        if expected_author in le.classes_:
            exp_idx = list(le.classes_).index(expected_author)
            entry["styleScore"] = round(float(proba[exp_idx]), 4)
        else:
            entry["styleScore"] = None

    # --- Итоговый флаг для подсветки (приоритет: ИИ > расхождение стиля > совпадение) ---
    if entry["aiScore"] is not None and entry["aiScore"] >= AI_FLAG_THRESHOLD:
        entry["flag"] = "ai_flag"
    elif entry["styleScore"] is not None:
        entry["flag"] = "match" if entry["styleScore"] >= STYLE_MATCH_THRESHOLD else "style_mismatch"
    else:
        entry["flag"] = "too_short"

    return entry


@app.route("/api/v1/health")
def health():
    return jsonify({"status": "ok", "model_dir": str(MODEL_DIR)})


@app.route("/api/v1/authors")
def authors():
    _, le = _load_style_model()
    return jsonify({"authors": list(le.classes_)})


@app.route("/api/v1/analyze", methods=["POST"])
def analyze():
    """
    Принимает multipart/form-data:
      - file: файл (.txt/.docx/.pdf) ИЛИ
      - text: сырой текст строкой
      - expected_author: ключ автора, с которым сверяем стиль (напр. "MarkTwain")
    Возвращает: агрегированный style%/ai% по документу + разбор по абзацам
    для подсветки в интерфейсе.
    """
    pipeline, le = _load_style_model()

    expected_author = request.form.get("expected_author", "")
    raw_text = request.form.get("text", "")

    if "file" in request.files and request.files["file"].filename:
        f = request.files["file"]
        raw_text = doc_extract.extract_text(f.filename, f.read())

    if not raw_text or not raw_text.strip():
        return jsonify({"error": "Пустой текст — нечего анализировать."}), 400

    paragraphs = _split_paragraphs(raw_text)
    if not paragraphs:
        return jsonify({"error": "После очистки текста не осталось содержимого."}), 400

    analyzed = [_analyze_paragraph(p, expected_author, pipeline, le) for p in paragraphs]

    scored = [a for a in analyzed if a["styleScore"] is not None]
    scored_ai = [a for a in analyzed if a["aiScore"] is not None]

    doc_style_score = round(sum(a["styleScore"] for a in scored) / len(scored), 4) if scored else None
    doc_ai_score = round(sum(a["aiScore"] for a in scored_ai) / len(scored_ai), 4) if scored_ai else 0.0

    flagged_paragraphs = sum(1 for a in analyzed if a["flag"] in ("ai_flag", "style_mismatch"))

    return jsonify({
        "expectedAuthor": expected_author,
        "docStyleScore": doc_style_score,
        "docAiScore": doc_ai_score,
        "totalParagraphs": len(analyzed),
        "flaggedParagraphs": flagged_paragraphs,
        "paragraphs": analyzed,
        "modelInfo": {
            "authors": list(le.classes_),
            "source": "author_style_pipeline.joblib + ai_detector_pipeline.joblib (реальный инференс, без предрасчёта)",
        },
    })


if __name__ == "__main__":
    print("Загружаю модель...")
    _load_style_model()
    print("Модель загружена. Запускаю API на http://127.0.0.1:5001")
    app.run(host="127.0.0.1", port=5001, debug=False)
