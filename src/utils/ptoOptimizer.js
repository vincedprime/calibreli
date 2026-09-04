import { eachDayOfInterval, format, isValid, startOfDay, differenceInCalendarDays } from 'date-fns';

export const VACATION_STYLES = {
  BALANCED_MIX: 'balanced_mix',
  LONG_WEEKENDS: 'long_weekends',
  MINI_BREAKS: 'mini_breaks'
};

export const VACATION_STYLE_LABELS = {
  [VACATION_STYLES.BALANCED_MIX]: 'Balanced Mix',
  [VACATION_STYLES.LONG_WEEKENDS]: 'Long Weekends',
  [VACATION_STYLES.MINI_BREAKS]: 'Mini Breaks'
};

const dateKey = date => format(date, 'yyyy-MM-dd');
const validDate = date => date instanceof Date && isValid(date);

/**
 * Select efficient, non-overlapping breaks within an inclusive planning period.
 * This is a preference-based greedy planner, not a global-optimum solver.
 * Holidays take precedence over regular days off, so every date counts once.
 * Long weekends use 1–2 PTO days; mini breaks span 2–3 calendar days.
 */
export function optimizePTO({
  ptoDays, startDate, endDate, holidays = [], companyOffDays = [],
  vacationStyle = VACATION_STYLES.BALANCED_MIX, weekendDays = [0, 6]
} = {}) {
  if (!Number.isSafeInteger(ptoDays) || ptoDays <= 0) return [];
  if (!validDate(startDate) || !validDate(endDate)) return [];
  const start = startOfDay(startDate);
  const end = startOfDay(endDate);
  if (start >= end) return [];
  // Keep synchronous browser work bounded and report the limit to the caller.
  if (differenceInCalendarDays(end, start) > 3660) {
    throw new RangeError('Choose a planning period of 10 years or less.');
  }
  if (!Array.isArray(weekendDays) || weekendDays.some(day => !Number.isInteger(day) || day < 0 || day > 6)) return [];
  if (!Array.isArray(holidays) || !Array.isArray(companyOffDays)) return [];
  const offDays = new Set([...holidays, ...companyOffDays].filter(validDate).map(dateKey));
  const weekends = new Set(weekendDays);
  const days = eachDayOfInterval({ start, end }).map(date => ({
    date,
    kind: offDays.has(dateKey(date)) ? 'holiday' : weekends.has(date.getDay()) ? 'weekend' : 'pto'
  }));
  const budget = Math.min(ptoDays, days.filter(day => day.kind === 'pto').length);
  if (!budget) return [];

  const long = [];
  const mini = [];
  // Prefix counts make the cost of every candidate independent of its length.
  const counts = { pto: [0], holiday: [0], weekend: [0] };
  for (const day of days) {
    for (const kind of Object.keys(counts)) {
      counts[kind].push(counts[kind].at(-1) + Number(day.kind === kind));
    }
  }
  const makeCandidate = (from, to, type) => ({
    from, to, type, totalDays: to - from + 1,
    ptoDaysUsed: counts.pto[to + 1] - counts.pto[from],
    holidayDays: counts.holiday[to + 1] - counts.holiday[from],
    weekendDays: counts.weekend[to + 1] - counts.weekend[from]
  });

  for (let from = 0; from < days.length; from++) {
    // Mini breaks may include free days, and must last two or three days.
    for (let to = from + 1; to <= Math.min(from + 2, days.length - 1); to++) {
      const candidate = makeCandidate(from, to, 'Mini Break');
      // Keep this preference distinct from long weekends: mini breaks are
      // short weekday runs, optionally improved by a holiday.
      // A run made entirely of PTO is ordinary leave, not a useful suggestion.
      // Mini breaks only earn a place in the plan when a holiday extends them.
      if (candidate.ptoDaysUsed > 0 && candidate.weekendDays === 0 && candidate.holidayDays > 0) mini.push(candidate);
    }
    // Don't cut a natural run of free days in half.
    if (from > 0 && days[from - 1].kind !== 'pto') continue;
    for (let to = from; to < days.length; to++) {
      const candidate = makeCandidate(from, to, 'Long Weekend');
      if (candidate.ptoDaysUsed > 2) break;
      if (to + 1 < days.length && days[to + 1].kind !== 'pto') continue;
      if (candidate.totalDays >= 3 && candidate.ptoDaysUsed > 0 && candidate.holidayDays + candidate.weekendDays > 0) long.push(candidate);
    }
  }

  const selected = [];
  const occupied = new Uint8Array(days.length);
  let remaining = budget;
  const available = candidate => {
    // Separate breaks by at least one calendar day; adjacent intervals are one break.
    for (let day = Math.max(0, candidate.from - 1); day <= Math.min(days.length - 1, candidate.to + 1); day++) {
      if (occupied[day]) return false;
    }
    return true;
  };
  const select = candidate => {
    selected.push(candidate);
    remaining -= candidate.ptoDaysUsed;
    occupied.fill(1, candidate.from, candidate.to + 1);
  };
  const efficiencyOrder = (a, b) => b.totalDays / b.ptoDaysUsed - a.totalDays / a.ptoDaysUsed || b.totalDays - a.totalDays;
  const takeLongWeekends = allowance => {
    long.sort((a, b) => efficiencyOrder(a, b) || a.from - b.from);
    for (const candidate of long) {
      if (candidate.ptoDaysUsed <= Math.min(allowance, remaining) && available(candidate)) {
        select(candidate);
        allowance -= candidate.ptoDaysUsed;
      }
    }
  };
  const takeMiniBreaks = (maximumBreaks = remaining) => {
    // Among equally efficient choices, favor evenly spaced dates across the period.
    const slots = Math.min(maximumBreaks, remaining, Math.ceil(days.length / 3));
    for (let slot = 0; slot < slots && remaining > 0; slot++) {
      const target = (slot + 0.5) * days.length / slots;
      let best = null;
      for (const candidate of mini) {
        if (candidate.ptoDaysUsed > remaining || !available(candidate)) continue;
        const ranking = best ? efficiencyOrder(candidate, best) : -1;
        if (!best || ranking < 0 || (ranking === 0 && Math.abs(candidate.from - target) < Math.abs(best.from - target))) best = candidate;
      }
      if (!best) break;
      select(best);
    }
  };

  if (vacationStyle === VACATION_STYLES.LONG_WEEKENDS) takeLongWeekends(remaining);
  else if (vacationStyle === VACATION_STYLES.MINI_BREAKS) takeMiniBreaks();
  else {
    // A balanced plan must contain both types when suitable candidates exist.
    takeMiniBreaks(1);
    takeLongWeekends(Math.max(1, Math.floor(remaining * 0.6)));
    takeMiniBreaks();
    if (remaining > 0) takeLongWeekends(remaining);
  }

  return selected
    // A holiday alone is time away already; suggestions must always spend PTO.
    .filter(candidate => candidate.ptoDaysUsed > 0 && candidate.holidayDays + candidate.weekendDays > 0)
    .sort((a, b) => a.from - b.from)
    .map(({ from, to, ...candidate }) => {
    const startDate = days[from].date;
    const endDate = days[to].date;
    return {
      ...candidate, startDate, endDate,
      efficiency: candidate.totalDays / candidate.ptoDaysUsed,
      dateRange: `${format(startDate, 'MMM d, yyyy')} – ${format(endDate, 'MMM d, yyyy')}`,
      ptoDates: days.slice(from, to + 1).filter(day => day.kind === 'pto').map(day => day.date)
    };
    });
}
