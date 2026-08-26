# Бэкенд (реальный Shyn API)

`api_analyze.py` НЕ хранится в этом репозитории — он требует Python-модули
(`ai_detector.py`, `train_model.py` и др.) и обученные модели
(`model/`, `model_ai_detector/`), которые есть только в репозитории `Shyn`.

## Как запустить реальный анализ локально

1. В репозитории **Shyn**:
   ```bash
   pip install flask flask-cors --break-system-packages
   python3 api_analyze.py
   ```
   Поднимет сервер на `http://127.0.0.1:5001`.

2. В этом репозитории (**UniPlatform**):
   ```bash
   npm run dev
   ```
   Vite поднимется на `http://localhost:5173`, CORS на бэкенде уже открыт.

Если сервер Shyn не запущен, вход под аккаунтом любого из пяти
"авторов-студентов" (a.doyle / e.poe / h.wells / j.london / m.twain) при
сдаче задания покажет понятную ошибку соединения — обычный студент
(n.akhmetov) при этом продолжит работать на моке, как и раньше.
