/**
 * Weekly power-usage scheduler.
 *
 * Turns a list of recurring device-usage requirements (`PowerItem`s) into a concrete,
 * one-week repeating schedule of `ScheduleItem`s — while respecting blackout windows
 * (`TimeBlock`s) and optimizing placement for electricity cost, environmental impact,
 * or a weighted blend of both.
 *
 * ── Design notes ──────────────────────────────────────────────────────────────────
 *
 * 1. Time representation: the whole week is treated as a single line of minutes,
 *    0..10079 (Sunday 00:00 = 0), so overlap/spacing math is plain integer arithmetic
 *    instead of juggling Date objects. Date objects are only constructed at the very
 *    end, when building the `ScheduleItem`s the caller actually asked for.
 *
 * 2. No cross-midnight schedule items: `ScheduleItem` only has a single `dayOfWeek`
 *    field (no `endDayOfWeek`), so a device run is never placed across a day boundary.
 *    `TimeBlock`s, on the other hand, *do* have both a start and end day and are
 *    allowed to wrap past midnight (e.g. an overnight "sleep" block) — see
 *    `timeBlockToWeeklyIntervals`.
 *
 * 3. Scoring is pluggable, not hard-coded. Cost scoring depends only on the narrow
 *    `UtilityRateWindow` shape (interface segregation — callers pass whichever rates
 *    apply to their utility, nothing more). Environmental scoring depends on an
 *    `EnvironmentalScoreProvider` interface; nothing in the scheduling engine knows
 *    or cares where carbon-intensity numbers come from. A `HeuristicGridEnvironmentalProvider`
 *    is provided as a sane default (a documented placeholder), but a real
 *    implementation backed by WattTime / ElectricityMaps / a grid operator's API can
 *    be swapped in without touching the scheduler itself (open/closed).
 *
 * 4. Placement algorithm ("segmented greedy with gap enforcement"):
 *      a. Generate every valid candidate start slot for a device's duration (i.e. one
 *         that doesn't overlap any TimeBlock).
 *      b. Score each candidate (cost / environmental / balanced), independently
 *         min-max normalizing cost and environmental scores per PowerItem so the two
 *         are comparable regardless of currency/units before blending them.
 *      c. Split the week into `frequency` equal segments and greedily take the
 *         best-scoring valid candidate from each segment. This guarantees occurrences
 *         are spread through the week by construction, not just "the N cheapest
 *         slots" (which, left unchecked, happily schedules laundry twice in a row if
 *         Tuesday 2am is cheap two days running).
 *      d. A minimum-gap constraint (configurable, with a sane default derived from
 *         frequency) is enforced on top of the segmenting, and is progressively
 *         relaxed — never allowing literal overlap — if the week is too constrained
 *         to satisfy it, with a warning surfaced to the caller rather than a thrown
 *         error.
 *      e. PowerItems are processed in decreasing order of total weekly commitment
 *         (frequency × duration) — a Longest-Processing-Time-first heuristic — so the
 *         most demanding devices get first pick of good slots, and lighter ones fill
 *         in around them. PowerItems that share a `deviceId` (e.g. "quick wash" vs.
 *         "heavy wash" on the same physical washing machine) are also spaced apart
 *         from *each other*, not just within themselves.
 *
 * 5. Not modeled (deliberately, since nothing in the schema supports it yet): a
 *    household-wide concurrent-power-draw cap across *different* devices. Two
 *    different devices are currently allowed to run at the same time. If that ever
 *    needs to change, it's a single additional constraint inside `selectOccurrences`.
 */


// import { randomUUID } from 'node:crypto';

import { v4 as uuidv4 } from 'uuid';

const randomUUID = uuidv4;

// ─────────────────────────────────────────────────────────────────────────────────
// Public input types
// ─────────────────────────────────────────────────────────────────────────────────

export type DayOfWeek = number; // 0 (Sunday) .. 6 (Saturday)

/**
 * Mirrors the Prisma `TimeBlock` model. If you already import this type elsewhere,
 * delete this block and import it instead — it's redefined here so this file is
 * self-contained.
 */
export type TimeBlock = {
  id: string;
  startTime: Date;
  endTime: Date;
  startDayOfWeek: DayOfWeek;
  endDayOfWeek: DayOfWeek;
  type: string;
  userId: string;
};

/** Mirrors the shape used elsewhere in the app. */
export type PowerItem = {
  deviceId: string;
  frequency: number; // times per week
  duration: number; // hours per run
  powerDraw: number; // kW
};

/**
 * The subset of Prisma's `UtilityRate` needed for cost scoring — deliberately
 * narrower than the full DB row (interface segregation). Pass the rates for
 * whichever `Utility` the user's `UtilityInstance` points to; this module doesn't
 * know or care about that lookup. `startTime`/`endTime` are hour-of-day, 0-23 (24
 * accepted as an alias for midnight), and may wrap past midnight (e.g. an off-peak
 * window of 22 → 6).
 */
export type UtilityRateWindow = {
  id?: string;
  rate: number; // currency per kWh
  startTime: number;
  endTime: number;
};

/** Lower is cleaner. Units are up to the provider — only relative ordering matters. */
export interface EnvironmentalScoreProvider {
  getIntensity(dayOfWeek: DayOfWeek, hourOfDay: number): number;
}

export type SchedulingStrategy =
  | { type: 'cost' }
  | { type: 'environmental' }
  | { type: 'balanced'; costWeight: number; environmentalWeight: number };

export interface SchedulingOptions {
  /** Search resolution, in minutes. Smaller = more candidate slots considered, at
   *  higher compute cost. Should evenly divide 1440. Default 15. */
  slotGranularityMinutes?: number;
  /** Minimum spacing, in hours, to try to maintain between occurrences of the same
   *  device. Defaults to half the average interval implied by frequency (e.g. a
   *  device scheduled twice a week defaults to a ~42h minimum gap). */
  minGapHours?: number;
  /** Anchor Sunday used to turn (dayOfWeek, minuteOfDay) back into a concrete `Date`
   *  for the output `startTime`/`endTime` fields. Must be a Sunday; only its
   *  year/month/date matter. Defaults to 2024-01-07 (a Sunday). */
  referenceWeekStart?: Date;
  /** Optional deviceId -> display name lookup, used to name generated schedule
   *  items. Devices not present fall back to a generic name. */
  deviceNames?: Record<string, string>;
  /** Override for ID generation. Defaults to `node:crypto`'s `randomUUID`. Any
   *  unique string works — the Prisma column is just `@id`, not specifically cuid. */
  idGenerator?: () => string;
  /** Whether `TimeBlock`/output `Date` time-of-day components are read/written in
   *  UTC or local server time. Defaults to 'utc' — keeps the result independent of
   *  the server's timezone, which matters if this ever runs somewhere other than
   *  where the data was authored. */
  timeZoneMode?: 'utc' | 'local';
}

export interface GenerateScheduleParams {
  userId: string;
  powerItems: PowerItem[];
  timeBlocks: TimeBlock[];
  /** Rates for the user's active utility. Pass `[]` if unknown — cost scoring
   *  degrades gracefully to "no cost preference" rather than erroring. */
  utilityRates?: UtilityRateWindow[];
  strategy: SchedulingStrategy;
  /** Defaults to `HeuristicGridEnvironmentalProvider`. */
  environmentalProvider?: EnvironmentalScoreProvider;
  options?: SchedulingOptions;
}

// ─────────────────────────────────────────────────────────────────────────────────
// Public output types
// ─────────────────────────────────────────────────────────────────────────────────

/**
 * Shape maps directly onto `prisma.scheduleItem.createMany({ data })`.
 * `createdAt`/`updatedAt` are deliberately omitted — they have DB defaults.
 */
export type GeneratedScheduleItem = {
  id: string;
  name: string;
  userId: string;
  dayOfWeek: DayOfWeek;
  startTime: Date;
  endTime: Date;
  deviceId: string;
  kwh: number;
};

export interface SchedulingWarning {
  /** The PowerItem's deviceId this warning applies to, or '*' for a global warning. */
  deviceId: string;
  message: string;
}

export interface GenerateScheduleResult {
  scheduleItems: GeneratedScheduleItem[];
  warnings: SchedulingWarning[];
}

// ─────────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────────

export const WEEK_MINUTES = 7 * 24 * 60;
const DAY_MINUTES = 24 * 60;

/** 2024-01-07 is a Sunday. */
export const DEFAULT_REFERENCE_WEEK_START = new Date(Date.UTC(2024, 0, 7));

// ─────────────────────────────────────────────────────────────────────────────────
// Default environmental provider
// ─────────────────────────────────────────────────────────────────────────────────

/**
 * Placeholder carbon-intensity model. Shape loosely follows a solar-heavy grid's
 * "duck curve": cleanest in the early-to-mid afternoon (solar output near its peak),
 * dirtiest in the evening ramp (solar falling off while demand is still high, so gas
 * peaker plants pick up the slack). Nothing else in this module depends on this
 * specific curve — swap in a real data source by implementing
 * `EnvironmentalScoreProvider`.
 */
export class HeuristicGridEnvironmentalProvider implements EnvironmentalScoreProvider {
  private static readonly HOURLY_SHAPE: readonly number[] = [
    0.55, 0.52, 0.5, 0.48, 0.48, 0.5, 0.58, 0.68, 0.72, 0.6, 0.5, 0.42, 0.38, 0.35, 0.36, 0.42, 0.55, 0.72, 0.9, 1.0,
    0.95, 0.8, 0.68, 0.6,
  ];

  getIntensity(dayOfWeek: DayOfWeek, hourOfDay: number): number {
    const hour = mod(Math.floor(hourOfDay), 24);
    const base = HeuristicGridEnvironmentalProvider.HOURLY_SHAPE[hour]!;
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    return isWeekend ? base * 0.95 : base;
  }
}

// ─────────────────────────────────────────────────────────────────────────────────
// Internal geometry helpers (all times are minutes on the 0..WEEK_MINUTES line)
// ─────────────────────────────────────────────────────────────────────────────────

type Interval = { start: number; end: number };
type Candidate = Interval & { dayOfWeek: DayOfWeek };
type ScoredCandidate = Candidate & { score: number };

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

function overlapMinutes(aStart: number, aEnd: number, bStart: number, bEnd: number): number {
  return Math.max(0, Math.min(aEnd, bEnd) - Math.max(aStart, bStart));
}

function overlapsAny(start: number, end: number, intervals: Interval[]): boolean {
  return intervals.some((iv) => start < iv.end && iv.start < end);
}

function mergeIntervals(intervals: Interval[]): Interval[] {
  if (intervals.length === 0) return [];
  const sorted = [...intervals].sort((a, b) => a.start - b.start);
  const first = sorted[0]!;
  const merged: Interval[] = [{ start: first.start, end: first.end }];
  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1]!;
    const cur = sorted[i]!;
    if (cur.start <= last.end) {
      last.end = Math.max(last.end, cur.end);
    } else {
      merged.push({ start: cur.start, end: cur.end });
    }
  }
  return merged;
}

/**
 * Minimal circular (wraparound-aware) distance between two non-overlapping
 * intervals on the repeating weekly line. Returns -1 if they overlap. Wraparound
 * matters because the schedule repeats: a Sunday-00:30 slot and a Saturday-23:30
 * slot from "the week before" are only an hour apart, not almost a full week.
 */
function circularGap(a: Interval, b: Interval): number {
  if (a.start < b.end && b.start < a.end) return -1;
  const forward = mod(b.start - a.end, WEEK_MINUTES);
  const backward = mod(a.start - b.end, WEEK_MINUTES);
  return Math.min(forward, backward);
}

function satisfiesGap(candidate: Interval, placed: Interval[], minGap: number): boolean {
  return placed.every((p) => {
    const gap = circularGap(candidate, p);
    return gap >= 0 && gap >= minGap;
  });
}

// ─────────────────────────────────────────────────────────────────────────────────
// TimeBlock -> blocked weekly intervals
// ─────────────────────────────────────────────────────────────────────────────────

function minutesOfDay(d: Date, tzMode: 'utc' | 'local'): number {
  return tzMode === 'utc' ? d.getUTCHours() * 60 + d.getUTCMinutes() : d.getHours() * 60 + d.getMinutes();
}

function timeBlockToWeeklyIntervals(tb: TimeBlock, tzMode: 'utc' | 'local'): Interval[] {
  const startAbs = mod(tb.startDayOfWeek, 7) * DAY_MINUTES + minutesOfDay(tb.startTime, tzMode);
  let endAbs = mod(tb.endDayOfWeek, 7) * DAY_MINUTES + minutesOfDay(tb.endTime, tzMode);
  if (endAbs <= startAbs) endAbs += WEEK_MINUTES; // wraps past midnight / into another day
  endAbs = Math.min(endAbs, startAbs + WEEK_MINUTES); // clamp malformed multi-week spans
  if (endAbs <= WEEK_MINUTES) return [{ start: startAbs, end: endAbs }];
  return [
    { start: startAbs, end: WEEK_MINUTES },
    { start: 0, end: endAbs - WEEK_MINUTES },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────────
// UtilityRate -> cost scoring
// ─────────────────────────────────────────────────────────────────────────────────

function hourRangeToDayIntervals(startHour: number, endHour: number): Interval[] {
  const norm = (h: number) => (h === 24 ? DAY_MINUTES : mod(Math.floor(h), 24) * 60);
  const start = norm(startHour);
  const end = norm(endHour);
  if (start === end) return [{ start: 0, end: DAY_MINUTES }]; // flat, all-day rate
  if (start < end) return [{ start, end }];
  return [
    { start, end: DAY_MINUTES },
    { start: 0, end },
  ];
}

function rawCostScore(candidate: Candidate, powerDraw: number, rates: UtilityRateWindow[]): number {
  if (rates.length === 0) return 0;
  const startOfDay = candidate.start - candidate.dayOfWeek * DAY_MINUTES;
  const endOfDay = candidate.end - candidate.dayOfWeek * DAY_MINUTES;

  let cost = 0;
  let coveredMinutes = 0;
  for (const rate of rates) {
    for (const window of hourRangeToDayIntervals(rate.startTime, rate.endTime)) {
      const overlap = overlapMinutes(startOfDay, endOfDay, window.start, window.end);
      if (overlap > 0) {
        cost += powerDraw * (overlap / 60) * rate.rate;
        coveredMinutes += overlap;
      }
    }
  }

  const totalMinutes = endOfDay - startOfDay;
  if (coveredMinutes < totalMinutes) {
    // Gaps in rate coverage fall back to the average of the provided rates rather
    // than being silently treated as free — a conservative assumption.
    const avgRate = rates.reduce((sum, r) => sum + r.rate, 0) / rates.length;
    cost += powerDraw * ((totalMinutes - coveredMinutes) / 60) * avgRate;
  }
  return cost;
}

function ratesHaveOverlap(rates: UtilityRateWindow[]): boolean {
  const allWindows = rates.flatMap((r) => hourRangeToDayIntervals(r.startTime, r.endTime));
  for (let i = 0; i < allWindows.length; i++) {
    for (let j = i + 1; j < allWindows.length; j++) {
      const w1 = allWindows[i]!;
      const w2 = allWindows[j]!;
      if (overlapMinutes(w1.start, w1.end, w2.start, w2.end) > 0) {
        return true;
      }
    }
  }
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────────
// Environmental scoring
// ─────────────────────────────────────────────────────────────────────────────────

function rawEnvironmentalScore(candidate: Candidate, provider: EnvironmentalScoreProvider, granularity: number): number {
  const startOfDay = candidate.start - candidate.dayOfWeek * DAY_MINUTES;
  const endOfDay = candidate.end - candidate.dayOfWeek * DAY_MINUTES;

  let sum = 0;
  let samples = 0;
  for (let m = startOfDay; m < endOfDay; m += granularity) {
    const hour = Math.floor((m + granularity / 2) / 60) % 24;
    sum += provider.getIntensity(candidate.dayOfWeek, hour);
    samples++;
  }
  if (samples === 0) {
    return provider.getIntensity(candidate.dayOfWeek, Math.floor(startOfDay / 60) % 24);
  }
  const avgIntensity = sum / samples;
  const durationHours = (endOfDay - startOfDay) / 60;
  return avgIntensity * durationHours;
}

// ─────────────────────────────────────────────────────────────────────────────────
// Normalization + strategy blending
// ─────────────────────────────────────────────────────────────────────────────────

function normalizeScores(values: number[]): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max - min < 1e-9) return values.map(() => 0);
  return values.map((v) => (v - min) / (max - min));
}

function resolveStrategyWeights(strategy: SchedulingStrategy): { cost: number; environmental: number } {
  switch (strategy.type) {
    case 'cost':
      return { cost: 1, environmental: 0 };
    case 'environmental':
      return { cost: 0, environmental: 1 };
    case 'balanced': {
      const c = Math.max(0, strategy.costWeight);
      const e = Math.max(0, strategy.environmentalWeight);
      const total = c + e;
      return total <= 0 ? { cost: 0.5, environmental: 0.5 } : { cost: c / total, environmental: e / total };
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────────
// Candidate generation
// ─────────────────────────────────────────────────────────────────────────────────

function generateCandidates(durationMinutes: number, granularity: number): Candidate[] {
  const candidates: Candidate[] = [];
  for (let day = 0; day < 7; day++) {
    const dayStart = day * DAY_MINUTES;
    const lastStart = dayStart + DAY_MINUTES - durationMinutes;
    for (let start = dayStart; start <= lastStart; start += granularity) {
      const end = start + durationMinutes;
      candidates.push({ start, end, dayOfWeek: day });
    }
  }
  return candidates;
}

// ─────────────────────────────────────────────────────────────────────────────────
// Placement: segmented greedy selection with gap enforcement
// ─────────────────────────────────────────────────────────────────────────────────

function selectOccurrences(
  scoredCandidates: ScoredCandidate[],
  frequency: number,
  minGapMinutes: number,
  alreadyPlacedForDevice: Interval[],
): { chosen: ScoredCandidate[]; warnings: string[] } {
  const warnings: string[] = [];
  const chosen: ScoredCandidate[] = [];
  if (frequency <= 0) return { chosen, warnings };
  if (scoredCandidates.length === 0) {
    warnings.push('No valid time slot avoids the configured time blocks.');
    return { chosen, warnings };
  }

  const sorted = [...scoredCandidates].sort((a, b) => a.score - b.score);
  const segmentSize = WEEK_MINUTES / frequency;
  const isFree = (c: ScoredCandidate, gap: number) =>
    satisfiesGap(c, chosen, gap) && satisfiesGap(c, alreadyPlacedForDevice, gap);

  for (let i = 0; i < frequency; i++) {
    const segStart = i * segmentSize;
    const segEnd = (i + 1) * segmentSize;

    // 1. Prefer the best-scoring candidate that falls in this occurrence's "slice"
    //    of the week — this is what guarantees spacing by construction.
    let pick = sorted.find((c) => c.start >= segStart && c.start < segEnd && isFree(c, minGapMinutes));
    // 2. Fall back to the best-scoring candidate anywhere in the week.
    if (!pick) pick = sorted.find((c) => isFree(c, minGapMinutes));

    // 3. If the week is too constrained, progressively relax the minimum gap
    //    rather than failing outright.
    if (!pick) {
      let gap = minGapMinutes;
      while (!pick && gap > 0) {
        gap = Math.floor(gap / 2);
        pick = sorted.find((c) => isFree(c, gap));
      }
    }

    // 4. Last resort: any candidate that doesn't literally overlap. Spacing isn't
    //    guaranteed here, but two runs of the same device never overlap in time —
    //    that constraint is never relaxed.
    if (!pick) {
      pick = sorted.find((c) => satisfiesGap(c, chosen, 0) && satisfiesGap(c, alreadyPlacedForDevice, 0));
      if (pick) {
        warnings.push(
          `Occurrence ${i + 1}/${frequency} couldn't be spaced from other occurrences given the available time; scheduled with minimal gap.`,
        );
      }
    }

    if (pick) {
      chosen.push(pick);
    } else {
      warnings.push(`Occurrence ${i + 1}/${frequency} couldn't be scheduled — no non-overlapping slot was available.`);
    }
  }

  chosen.sort((a, b) => a.start - b.start);
  return { chosen, warnings };
}

// ─────────────────────────────────────────────────────────────────────────────────
// Date construction
// ─────────────────────────────────────────────────────────────────────────────────

function dateFromReference(ref: Date, dayOfWeek: DayOfWeek, minuteOfDay: number, tzMode: 'utc' | 'local'): Date {
  const hours = Math.floor(minuteOfDay / 60);
  const minutes = minuteOfDay % 60;
  if (tzMode === 'utc') {
    return new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), ref.getUTCDate() + dayOfWeek, hours, minutes, 0, 0));
  }
  return new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() + dayOfWeek, hours, minutes, 0, 0);
}

function buildScheduleItem(
  candidate: Candidate,
  item: PowerItem,
  userId: string,
  referenceWeekStart: Date,
  idGenerator: () => string,
  deviceNames: Record<string, string> | undefined,
  tzMode: 'utc' | 'local',
): GeneratedScheduleItem {
  const startOfDayMin = candidate.start - candidate.dayOfWeek * DAY_MINUTES;
  const endOfDayMin = candidate.end - candidate.dayOfWeek * DAY_MINUTES;
  const kwh = Math.round(item.powerDraw * item.duration * 100) / 100;
  return {
    id: idGenerator(),
    name: deviceNames?.[item.deviceId] ?? 'Scheduled run',
    userId,
    dayOfWeek: candidate.dayOfWeek,
    startTime: dateFromReference(referenceWeekStart, candidate.dayOfWeek, startOfDayMin, tzMode),
    endTime: dateFromReference(referenceWeekStart, candidate.dayOfWeek, endOfDayMin, tzMode),
    deviceId: item.deviceId,
    kwh,
  };
}

// ─────────────────────────────────────────────────────────────────────────────────
// Public entry point
// ─────────────────────────────────────────────────────────────────────────────────

export function generateWeeklySchedule(params: GenerateScheduleParams): GenerateScheduleResult {
  const {
    userId,
    powerItems,
    timeBlocks,
    utilityRates = [],
    strategy,
    environmentalProvider = new HeuristicGridEnvironmentalProvider(),
    options = {},
  } = params;

  const granularity = options.slotGranularityMinutes ?? 15;
  const referenceWeekStart = options.referenceWeekStart ?? DEFAULT_REFERENCE_WEEK_START;
  const idGenerator = options.idGenerator ?? randomUUID;
  const tzMode = options.timeZoneMode ?? 'utc';

  const warnings: SchedulingWarning[] = [];

  const blockedIntervals = mergeIntervals(timeBlocks.flatMap((tb) => timeBlockToWeeklyIntervals(tb, tzMode)));

  if (utilityRates.length > 0 && ratesHaveOverlap(utilityRates)) {
    warnings.push({
      deviceId: '*',
      message: 'Two or more utility rate windows overlap; overlapping minutes are double-counted in cost scoring.',
    });
  }

  const weights = resolveStrategyWeights(strategy);

  // Longest-Processing-Time-first: schedule the most time-hungry devices first so
  // they get first pick of good slots, and let lighter devices fill in around them.
  const orderedItems = [...powerItems].sort((a, b) => b.frequency * b.duration - a.frequency * a.duration);

  const result: GeneratedScheduleItem[] = [];
  const placedByDevice = new Map<string, Interval[]>();

  for (const item of orderedItems) {
    const frequency = Math.max(0, Math.round(item.frequency));
    if (frequency <= 0) continue;

    const durationMinutes = Math.round(item.duration * 60);
    if (durationMinutes <= 0) {
      warnings.push({ deviceId: item.deviceId, message: 'Duration must be greater than zero; skipped.' });
      continue;
    }
    if (durationMinutes > DAY_MINUTES) {
      warnings.push({
        deviceId: item.deviceId,
        message: `Duration of ${item.duration}h exceeds 24 hours; a single schedule item can't span multiple days, skipped.`,
      });
      continue;
    }

    const candidates = generateCandidates(durationMinutes, granularity);

    const rawCosts = candidates.map((c) => rawCostScore(c, item.powerDraw, utilityRates));
    const rawEnv = candidates.map((c) => rawEnvironmentalScore(c, environmentalProvider, granularity));
    const costNorm = normalizeScores(rawCosts);
    const envNorm = normalizeScores(rawEnv);

    // Candidates that overlap blocked intervals get a heavy penalty so they are
    // only chosen when no clean slot exists.  The penalty is large enough that
    // normalised cost/env scores (0-1) never overcome it, but it preserves the
    // relative ordering among penalised candidates so the scheduler still picks
    // the least-bad option.
    const BLOCKED_PENALTY = 100;

    const scored: ScoredCandidate[] = candidates.map((c, i) => {
      const overlapsBlocked = blockedIntervals.some((iv) => c.start < iv.end && iv.start < c.end);
      return {
        ...c,
        score: weights.cost * costNorm[i]! + weights.environmental * envNorm[i]! + (overlapsBlocked ? BLOCKED_PENALTY : 0),
      };
    });

    const averageIntervalHours = WEEK_MINUTES / 60 / frequency;
    const minGapMinutes = Math.round((options.minGapHours ?? Math.max(2, averageIntervalHours * 0.5)) * 60);

    const placedForDevice = placedByDevice.get(item.deviceId) ?? [];
    const { chosen, warnings: selectionWarnings } = selectOccurrences(scored, frequency, minGapMinutes, placedForDevice);
    for (const message of selectionWarnings) warnings.push({ deviceId: item.deviceId, message });

    placedByDevice.set(item.deviceId, [...placedForDevice, ...chosen.map((c) => ({ start: c.start, end: c.end }))]);

    for (const c of chosen) {
      const overlapsBlocked = blockedIntervals.some((iv) => c.start < iv.end && iv.start < c.end);
      if (overlapsBlocked) {
        warnings.push({
          deviceId: item.deviceId,
          message: `"${options.deviceNames?.[item.deviceId] ?? item.deviceId}" couldn't be fully placed outside unavailable hours and was scheduled during a blocked period.`,
        });
      }
      result.push(buildScheduleItem(c, item, userId, referenceWeekStart, idGenerator, options.deviceNames, tzMode));
    }
  }

  result.sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.getTime() - b.startTime.getTime());

  return { scheduleItems: result, warnings };
}

/*
 * ── Example usage ──────────────────────────────────────────────────────────────
 *
 * const { scheduleItems, warnings } = generateWeeklySchedule({
 *   userId: user.id,
 *   powerItems: [
 *     { deviceId: washer.id, frequency: 3, duration: 1.5, powerDraw: 0.5 },
 *     { deviceId: dishwasher.id, frequency: 5, duration: 1, powerDraw: 1.2 },
 *   ],
 *   timeBlocks: await prisma.timeBlock.findMany({ where: { userId: user.id } }),
 *   utilityRates: await prisma.utilityRate.findMany({ where: { utilityId } }),
 *   strategy: { type: 'balanced', costWeight: 0.7, environmentalWeight: 0.3 },
 *   options: { deviceNames: { [washer.id]: 'Washing machine', [dishwasher.id]: 'Dishwasher' } },
 * });
 *
 * if (warnings.length) console.warn(warnings);
 * await prisma.scheduleItem.createMany({ data: scheduleItems });
 */