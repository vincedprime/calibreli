/**
 * PTO Optimization Engine
 * Generates optimized PTO schedules based on different vacation styles
 */

export const VACATION_STYLES = {
  BALANCED_MIX: 'balanced_mix',
  LONG_WEEKENDS: 'long_weekends',
  MINI_BREAKS: 'mini_breaks'
};

/**
 * Main PTO optimization function
 * @param {Object} params - Optimization parameters
 * @param {number} params.ptoDays - Number of PTO days available
 * @param {Date} params.startDate - Start date of planning period
 * @param {Date} params.endDate - End date of planning period
 * @param {Date[]} params.nationalHolidays - Array of national holiday dates
 * @param {Date[]} params.companyOffDays - Array of company-specific off days
 * @param {string} params.vacationStyle - Vacation style preference
 * @returns {Object} - Optimized PTO schedule with date ranges and metadata
 */
export function optimizePTO({
  ptoDays,
  startDate,
  endDate,
  nationalHolidays = [],
  companyOffDays = [],
  vacationStyle = VACATION_STYLES.BALANCED_MIX
}) {
  // Validate inputs
  if (!ptoDays || ptoDays <= 0) {
    throw new Error('PTO days must be a positive number');
  }
  
  if (startDate >= endDate) {
    throw new Error('Start date must be before end date');
  }

  // Get all dates in the range
  const allDates = getAllDatesInRange(startDate, endDate);
  
  // Identify weekends and holidays
  const weekends = getWeekendsInRange(startDate, endDate);
  const allHolidays = [...nationalHolidays, ...companyOffDays];
  
  // Remove duplicates and sort holidays
  const uniqueHolidays = [...new Set(allHolidays.map(date => date.getTime()))]
    .map(time => new Date(time))
    .sort((a, b) => a - b);

  // Apply optimization based on style
  let optimizedSchedule;
  
  switch (vacationStyle) {
    case VACATION_STYLES.BALANCED_MIX:
      optimizedSchedule = optimizeBalancedMix(ptoDays, allDates, uniqueHolidays, weekends);
      break;
    case VACATION_STYLES.LONG_WEEKENDS:
      optimizedSchedule = optimizeLongWeekends(ptoDays, allDates, uniqueHolidays, weekends);
      break;
    case VACATION_STYLES.MINI_BREAKS:
      optimizedSchedule = optimizeMiniBreaks(ptoDays, allDates, uniqueHolidays, weekends);
      break;
    default:
      throw new Error('Invalid vacation style');
  }

  return {
    schedule: optimizedSchedule,
    totalPtoDays: ptoDays,
    usedPtoDays: optimizedSchedule.reduce((total, range) => total + range.days, 0),
    vacationStyle,
    planningPeriod: { startDate, endDate },
    holidays: uniqueHolidays,
    metadata: {
      totalDaysInRange: allDates.length,
      weekendDays: weekends.length,
      holidayDays: uniqueHolidays.length
    }
  };
}

/**
 * Get all dates within a range
 */
function getAllDatesInRange(startDate, endDate) {
  const dates = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

/**
 * Get all weekend dates in range
 */
function getWeekendsInRange(startDate, endDate) {
  const weekends = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
      weekends.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }
  
  return weekends;
}

/**
 * Balanced Mix: Distribute PTO days evenly across months
 */
function optimizeBalancedMix(ptoDays, allDates, holidays, weekends) {
  const schedule = [];
  const months = groupDatesByMonth(allDates);
  const ptoPerMonth = Math.floor(ptoDays / months.length);
  const remainingPto = ptoDays % months.length;
  
  let usedPto = 0;
  
  months.forEach((monthDates, monthIndex) => {
    const monthPtoDays = ptoPerMonth + (monthIndex < remainingPto ? 1 : 0);
    if (monthPtoDays === 0) return;
    
    // Find best dates in this month (avoid holidays, prefer weekdays)
    const availableDates = monthDates.filter(date => 
      !isHoliday(date, holidays) && 
      !isWeekend(date) &&
      !isAlreadyScheduled(date, schedule)
    );
    
    const selectedDates = selectBestDates(availableDates, monthPtoDays);
    
    if (selectedDates.length > 0) {
      const ranges = groupConsecutiveDates(selectedDates);
      ranges.forEach(range => {
        schedule.push({
          startDate: range.start,
          endDate: range.end,
          days: range.days,
          type: 'pto'
        });
        usedPto += range.days;
      });
    }
  });
  
  return schedule;
}

/**
 * Long Weekends: Extend weekends around holidays
 */
function optimizeLongWeekends(ptoDays, allDates, holidays, weekends) {
  const schedule = [];
  let usedPto = 0;
  
  // Find opportunities to extend weekends around holidays
  const opportunities = findWeekendExtensionOpportunities(holidays, allDates);
  
  // Sort opportunities by value (days gained vs PTO spent)
  opportunities.sort((a, b) => b.value - a.value);
  
  for (const opportunity of opportunities) {
    if (usedPto + opportunity.ptoNeeded > ptoDays) continue;
    
    schedule.push({
      startDate: opportunity.startDate,
      endDate: opportunity.endDate,
      days: opportunity.ptoNeeded,
      type: 'pto',
      reason: 'weekend_extension'
    });
    
    usedPto += opportunity.ptoNeeded;
  }
  
  // If we have remaining PTO, add more weekend extensions
  const remainingPto = ptoDays - usedPto;
  if (remainingPto > 0) {
    const additionalOpportunities = findAdditionalWeekendOpportunities(weekends, allDates, remainingPto);
    additionalOpportunities.forEach(opportunity => {
      schedule.push({
        startDate: opportunity.startDate,
        endDate: opportunity.endDate,
        days: opportunity.ptoNeeded,
        type: 'pto',
        reason: 'weekend_extension'
      });
    });
  }
  
  return schedule;
}

/**
 * Mini Breaks: Create multiple short 2-3 day breaks
 */
function optimizeMiniBreaks(ptoDays, allDates, holidays, weekends) {
  const schedule = [];
  let usedPto = 0;
  
  // Target 2-3 day breaks
  const breakLength = 2;
  const maxBreaks = Math.floor(ptoDays / breakLength);
  
  // Find opportunities for mini breaks
  const opportunities = findMiniBreakOpportunities(allDates, holidays, weekends, breakLength);
  
  // Sort by value (avoiding holidays, maximizing consecutive days off)
  opportunities.sort((a, b) => b.value - a.value);
  
  for (const opportunity of opportunities) {
    if (usedPto + opportunity.ptoNeeded > ptoDays) continue;
    if (schedule.length >= maxBreaks) break;
    
    schedule.push({
      startDate: opportunity.startDate,
      endDate: opportunity.endDate,
      days: opportunity.ptoNeeded,
      type: 'pto',
      reason: 'mini_break'
    });
    
    usedPto += opportunity.ptoNeeded;
  }
  
  return schedule;
}

/**
 * Helper functions
 */

function groupDatesByMonth(dates) {
  const months = new Map();
  
  dates.forEach(date => {
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    if (!months.has(monthKey)) {
      months.set(monthKey, []);
    }
    months.get(monthKey).push(date);
  });
  
  return Array.from(months.values());
}

function isHoliday(date, holidays) {
  return holidays.some(holiday => 
    date.getTime() === holiday.getTime()
  );
}

function isWeekend(date) {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
}

function isAlreadyScheduled(date, schedule) {
  return schedule.some(item => 
    date >= item.startDate && date <= item.endDate
  );
}

function selectBestDates(availableDates, count) {
  // Simple selection: take the first available dates
  // In a more sophisticated implementation, we could consider:
  // - Avoiding consecutive work days
  // - Preferring dates around holidays
  // - Considering user preferences
  return availableDates.slice(0, count);
}

function groupConsecutiveDates(dates) {
  if (dates.length === 0) return [];
  
  const sortedDates = [...dates].sort((a, b) => a - b);
  const ranges = [];
  let currentRange = { start: sortedDates[0], end: sortedDates[0] };
  
  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = sortedDates[i];
    const previousDate = sortedDates[i - 1];
    const daysDiff = (currentDate - previousDate) / (1000 * 60 * 60 * 24);
    
    if (daysDiff === 1) {
      // Consecutive date
      currentRange.end = currentDate;
    } else {
      // Gap found, save current range and start new one
      ranges.push({
        start: currentRange.start,
        end: currentRange.end,
        days: (currentRange.end - currentRange.start) / (1000 * 60 * 60 * 24) + 1
      });
      currentRange = { start: currentDate, end: currentDate };
    }
  }
  
  // Add the last range
  ranges.push({
    start: currentRange.start,
    end: currentRange.end,
    days: (currentRange.end - currentRange.start) / (1000 * 60 * 60 * 24) + 1
  });
  
  return ranges;
}

function findWeekendExtensionOpportunities(holidays, allDates) {
  const opportunities = [];
  
  holidays.forEach(holiday => {
    const dayOfWeek = holiday.getDay();
    
    // Check if we can extend before the holiday (Friday)
    if (dayOfWeek === 1) { // Monday holiday
      const friday = new Date(holiday);
      friday.setDate(friday.getDate() - 3);
      
      if (allDates.some(date => date.getTime() === friday.getTime())) {
        opportunities.push({
          startDate: friday,
          endDate: holiday,
          ptoNeeded: 1, // Friday only
          value: 4 // 4 days off (Fri-Mon) for 1 PTO day
        });
      }
    }
    
    // Check if we can extend after the holiday (Monday)
    if (dayOfWeek === 5) { // Friday holiday
      const monday = new Date(holiday);
      monday.setDate(monday.getDate() + 3);
      
      if (allDates.some(date => date.getTime() === monday.getTime())) {
        opportunities.push({
          startDate: holiday,
          endDate: monday,
          ptoNeeded: 1, // Monday only
          value: 4 // 4 days off (Fri-Mon) for 1 PTO day
        });
      }
    }
  });
  
  return opportunities;
}

function findAdditionalWeekendOpportunities(weekends, allDates, remainingPto) {
  const opportunities = [];
  
  // Group consecutive weekends
  const weekendGroups = groupConsecutiveDates(weekends);
  
  weekendGroups.forEach(group => {
    if (group.days >= 2) { // At least Saturday-Sunday
      // Check if we can extend with Friday or Monday
      const friday = new Date(group.start);
      friday.setDate(friday.getDate() - 1);
      
      const monday = new Date(group.end);
      monday.setDate(monday.getDate() + 1);
      
      if (allDates.some(date => date.getTime() === friday.getTime())) {
        opportunities.push({
          startDate: friday,
          endDate: group.end,
          ptoNeeded: 1,
          value: 3 // 3 days off for 1 PTO day
        });
      }
      
      if (allDates.some(date => date.getTime() === monday.getTime())) {
        opportunities.push({
          startDate: group.start,
          endDate: monday,
          ptoNeeded: 1,
          value: 3 // 3 days off for 1 PTO day
        });
      }
    }
  });
  
  return opportunities.slice(0, remainingPto);
}

function findMiniBreakOpportunities(allDates, holidays, weekends, breakLength) {
  const opportunities = [];
  
  // Look for weekdays that can be extended into mini breaks
  const weekdays = allDates.filter(date => 
    !isWeekend(date) && !isHoliday(date, holidays)
  );
  
  weekdays.forEach(date => {
    // Try to create a break starting from this date
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + breakLength - 1);
    
    const consecutiveDates = [];
    for (let i = 0; i < breakLength; i++) {
      const checkDate = new Date(date);
      checkDate.setDate(checkDate.getDate() + i);
      
      if (allDates.some(d => d.getTime() === checkDate.getTime())) {
        consecutiveDates.push(checkDate);
      }
    }
    
    if (consecutiveDates.length === breakLength) {
      opportunities.push({
        startDate: date,
        endDate: endDate,
        ptoNeeded: breakLength,
        value: breakLength + (isWeekend(endDate) ? 2 : 0) // Bonus if it includes weekend
      });
    }
  });
  
  return opportunities;
}
