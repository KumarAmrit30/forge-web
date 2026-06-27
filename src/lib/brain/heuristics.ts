import { generateId } from "@/lib/id";
import type { ConfidenceLevel, Evidence } from "@/lib/brain/types";

export type EvidenceInput = {
  source: string;
  timestamp: string;
  metric: string;
  value: string | number;
  description: string;
};

/** Build a traceable evidence record from store-derived facts. */
export function buildEvidence(input: EvidenceInput): Evidence {
  return { id: generateId(), ...input };
}

/**
 * Deterministic confidence from repeated observations.
 *
 * Heuristic tiers:
 * - 1 observation → capped at 0.25
 * - 2 observations → capped at 0.40
 * - 3–4 observations → capped at 0.55
 * - 5+ observations → 0.45 + rate×0.35 + volume bonus (up to 0.15)
 * - 10+ observations across 14+ days at ≥60% rate → up to 0.95
 */
export function confidenceFromObservations(
  matchCount: number,
  sampleCount: number,
  spanDays?: number
): number {
  if (sampleCount <= 0 || matchCount <= 0) return 0;

  const rate = matchCount / sampleCount;

  if (matchCount === 1) return roundConfidence(Math.min(0.25, rate * 0.25));
  if (matchCount === 2) return roundConfidence(Math.min(0.4, 0.25 + rate * 0.15));
  if (matchCount <= 4) return roundConfidence(Math.min(0.55, 0.35 + rate * 0.2));

  let confidence = 0.45 + rate * 0.35 + Math.min(matchCount / 20, 0.15);

  if (
    spanDays != null &&
    spanDays >= 14 &&
    matchCount >= 10 &&
    rate >= 0.6
  ) {
    confidence = Math.min(0.95, confidence + 0.15);
  }

  return roundConfidence(Math.min(1, confidence));
}

/** Map numeric confidence to a discrete level band. */
export function confidenceLevelFrom(confidence: number): ConfidenceLevel {
  if (confidence < 0.35) return "low";
  if (confidence < 0.55) return "moderate";
  if (confidence < 0.75) return "high";
  return "very_high";
}

/** Confidence for trend windows based on sample size and delta magnitude. */
export function confidenceFromTrendWindow(
  recentCount: number,
  previousCount: number,
  deltaPercent: number | null
): number {
  if (recentCount < 3 || previousCount < 3) return 0;

  const sampleFactor = Math.min((recentCount + previousCount) / 28, 1) * 0.4;
  const deltaFactor =
    deltaPercent == null ? 0.1 : Math.min(Math.abs(deltaPercent) / 30, 1) * 0.45;

  return roundConfidence(Math.min(0.95, 0.15 + sampleFactor + deltaFactor));
}

function roundConfidence(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Count inclusive day span between earliest and latest date keys. */
export function daySpan(records: { date: string }[]): number {
  if (records.length < 2) return records.length;
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
  const start = new Date(`${sorted[0].date}T00:00:00`);
  const end = new Date(`${sorted[sorted.length - 1].date}T00:00:00`);
  return Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );
}

/** Split records into recent and previous rolling windows (most recent first). */
export function splitRollingWindows<T extends { date: string }>(
  records: T[],
  windowDays = 14
): { recent: T[]; previous: T[] } {
  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));
  return {
    recent: sorted.slice(0, windowDays),
    previous: sorted.slice(windowDays, windowDays * 2),
  };
}

export function percentDelta(current: number, previous: number): number | null {
  if (previous <= 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}
