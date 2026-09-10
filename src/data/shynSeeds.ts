/**
 * Детерминированные параметры мок-анализа для существующих в демо-данных
 * сдач (см. data/university.ts::initialAssignments) - id сдачи, история
 * прошлых работ, профиль результата для наглядности сценариев.
 */

import { buildReport } from "../shynClient";
import type { ShynBuildReportResult } from "../types";

interface ShynSeedConfig {
  priorWorksCount: number;
  profile: "low" | "mid" | "high" | "flagged";
  seed?: string;
}

const SHYN_SEEDS: Record<string, ShynSeedConfig> = {
  a2: { priorWorksCount: 4, profile: "high" }, // на проверке — Shyndyq уже доступен
  a3: { priorWorksCount: 5, profile: "high", seed: "a3-s1" }, // тот же seed, что и в роспуске преподавателя — согласованный результат
  a6: { priorWorksCount: 3, profile: "high" },
  a8: { priorWorksCount: 3, profile: "low" }, // низкая оценка + расхождение стиля — понятная связка для демо
};

function shynReportFor(assignmentId: string): ShynBuildReportResult | null {
  const cfg = SHYN_SEEDS[assignmentId];
  if (!cfg) return null;
  return buildReport({
    submissionId: cfg.seed || assignmentId,
    priorWorksCount: cfg.priorWorksCount,
    profile: cfg.profile,
  });
}

export { SHYN_SEEDS, shynReportFor };
