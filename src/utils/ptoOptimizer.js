import { format, addDays, isWeekend, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, differenceInDays } from 'date-fns';

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

/**
 * Main PTO optimization function
 * @param {Object} params - Optimization parameters
 * @param {number} params.ptoDays - Number of PTO days available
 * @param {number} params.startMonth - Start month (0-11)
 * @param {number} params.endMonth - End month (0-11)
 * @param {Date[]} params.holidays - Array of holiday dates
 * @param {Date[]} params.companyOffDays - Array of company off days
 * @param {string} params.vacationStyle - Vacation style preference
 * @param {number} params.year - Year for planning
 * @returns {Array} Array of optimized PTO recommendations
 */
export function optimizePTO({
  ptoDays,
  startMonth,
  endMonth,
  holidays = [],
  companyOffDays = [],
  vacationStyle = VACATION_STYLES.BALANCED_MIX,
  year = new Date().getFullYear()
}) {
  // Input validation
  if (ptoDays <= 0) return [];
  if (startMonth > endMonth) return [];

  // Create date range
  const startDate = startOfMonth(new Date(year, startMonth, 1));
  const endDate = endOfMonth(new Date(year, endMonth, 1));
  
  // Get all dates in range
  const allDates = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Combine all off days (holidays + company off days)
  const allOffDays = [...holidays, ...companyOffDays];
  
  // Find potential vacation periods based on style
  let recommendations = [];
  
  switch (vacationStyle) {
    case VACATION_STYLES.LONG_WEEKENDS:
      recommendations = generateLongWeekends(allDates, allOffDays, ptoDays);
      break;
    case VACATION_STYLES.MINI_BREAKS:
      recommendations = generateMiniBreaks(allDates, allOffDays, ptoDays);
      break;
    case VACATION_STYLES.BALANCED_MIX:
    default:
      recommendations = generateBalancedMix(allDates, allOffDays, ptoDays);
      break;
  }
  
  return recommendations.filter(rec => rec.ptoDaysUsed > 0);
}

/**
 * Generate long weekend recommendations
 */
function generateLongWeekends(allDates, offDays, ptoDays) {
  const recommendations = [];
  let remainingPTO = ptoDays;
  
  // Find holidays and extend them into long weekends
  const holidayOpportunities = findHolidayOpportunities(allDates, offDays);
  
  // Sort by efficiency (total days off / PTO days used)
  holidayOpportunities.sort((a, b) => b.efficiency - a.efficiency);
  
  for (const opportunity of holidayOpportunities) {
    if (remainingPTO <= 0) break;
    
    const ptoNeeded = Math.min(opportunity.ptoNeeded, remainingPTO);
    if (ptoNeeded > 0) {
      const vacation = createVacationPeriod(
        opportunity.startDate,
        opportunity.endDate,
        ptoNeeded,
        offDays,
        'Long Weekend'
      );
      
      if (vacation) {
        recommendations.push(vacation);
        remainingPTO -= ptoNeeded;
      }
    }
  }
  
  // Use remaining PTO for additional long weekends
  if (remainingPTO > 0) {
    const additionalWeekends = findAdditionalWeekends(allDates, offDays, remainingPTO, recommendations);
    recommendations.push(...additionalWeekends);
  }
  
  return recommendations;
}

/**
 * Generate mini break recommendations
 */
function generateMiniBreaks(allDates, offDays, ptoDays) {
  const recommendations = [];
  let remainingPTO = ptoDays;
  
  // Aim for 2-3 day breaks distributed throughout the period
  const targetBreakSize = 2;
  const numberOfBreaks = Math.floor(ptoDays / targetBreakSize);
  
  // Divide the time period into segments
  const segmentSize = Math.floor(allDates.length / numberOfBreaks);
  
  for (let i = 0; i < numberOfBreaks && remainingPTO >= targetBreakSize; i++) {
    const segmentStart = i * segmentSize;
    const segmentEnd = Math.min((i + 1) * segmentSize, allDates.length);
    const segmentDates = allDates.slice(segmentStart, segmentEnd);
    
    // Find best 2-3 day period in this segment
    const miniBreak = findBestMiniBreak(segmentDates, offDays, targetBreakSize);
    
    if (miniBreak) {
      const vacation = createVacationPeriod(
        miniBreak.startDate,
        miniBreak.endDate,
        targetBreakSize,
        offDays,
        'Mini Break'
      );
      
      if (vacation) {
        recommendations.push(vacation);
        remainingPTO -= targetBreakSize;
      }
    }
  }
  
  return recommendations;
}

/**
 * Generate balanced mix recommendations
 */
function generateBalancedMix(allDates, offDays, ptoDays) {
  const recommendations = [];
  let remainingPTO = ptoDays;
  
  // Combine strategies: some long weekends, some mini breaks
  const longWeekendPTO = Math.floor(ptoDays * 0.6);
  const miniBreakPTO = ptoDays - longWeekendPTO;
  
  // Generate long weekends first
  const longWeekends = generateLongWeekends(allDates, offDays, longWeekendPTO);
  recommendations.push(...longWeekends);
  
  const usedPTO = longWeekends.reduce((sum, rec) => sum + rec.ptoDaysUsed, 0);
  remainingPTO = ptoDays - usedPTO;
  
  // Use remaining PTO for mini breaks
  if (remainingPTO > 0) {
    const miniBreaks = generateMiniBreaks(allDates, offDays, remainingPTO);
    recommendations.push(...miniBreaks);
  }
  
  return recommendations;
}

/**
 * Find holiday opportunities for long weekends
 */
function findHolidayOpportunities(allDates, offDays) {
  const opportunities = [];
  
  for (const holiday of offDays) {
    if (!isDateInRange(holiday, allDates)) continue;
    
    // Check for weekend extensions
    const beforeWeekend = findWeekendBefore(holiday);
    const afterWeekend = findWeekendAfter(holiday);
    
    // Calculate optimal extension
    let startDate = holiday;
    let endDate = holiday;
    let ptoNeeded = 0;
    
    // Extend backwards to include weekend
    if (beforeWeekend) {
      const daysBetween = differenceInDays(holiday, beforeWeekend.end);
      if (daysBetween <= 3) { // Worth bridging
        startDate = beforeWeekend.start;
        ptoNeeded += Math.max(0, daysBetween - 1);
      }
    }
    
    // Extend forwards to include weekend
    if (afterWeekend) {
      const daysBetween = differenceInDays(afterWeekend.start, holiday);
      if (daysBetween <= 3) { // Worth bridging
        endDate = afterWeekend.end;
        ptoNeeded += Math.max(0, daysBetween - 1);
      }
    }
    
    const totalDays = differenceInDays(endDate, startDate) + 1;
    const efficiency = ptoNeeded > 0 ? totalDays / ptoNeeded : totalDays;
    
    opportunities.push({
      startDate,
      endDate,
      ptoNeeded,
      totalDays,
      efficiency,
      holiday
    });
  }
  
  return opportunities;
}

/**
 * Create a vacation period object
 */
function createVacationPeriod(startDate, endDate, ptoDaysUsed, offDays, type) {
  const totalDays = differenceInDays(endDate, startDate) + 1;
  const weekendDays = countWeekendDays(startDate, endDate);
  const holidayDays = countHolidayDays(startDate, endDate, offDays);
  
  return {
    startDate,
    endDate,
    totalDays,
    ptoDaysUsed,
    weekendDays,
    holidayDays,
    type,
    efficiency: totalDays / ptoDaysUsed,
    dateRange: `${format(startDate, 'MMM d')} – ${format(endDate, 'MMM d')}`
  };
}

/**
 * Helper functions
 */
function isDateInRange(date, allDates) {
  return allDates.some(d => isSameDay(d, date));
}

function findWeekendBefore(date) {
  // Find the weekend (Saturday-Sunday) before the given date
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0) { // Sunday
    return { start: addDays(date, -1), end: date };
  } else if (dayOfWeek === 6) { // Saturday
    return { start: date, end: addDays(date, 1) };
  }
  
  // Find previous weekend
  const daysToSaturday = dayOfWeek === 0 ? 1 : dayOfWeek + 1;
  const saturday = addDays(date, -daysToSaturday);
  return { start: saturday, end: addDays(saturday, 1) };
}

function findWeekendAfter(date) {
  // Find the weekend (Saturday-Sunday) after the given date
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0) { // Sunday
    const nextSaturday = addDays(date, 6);
    return { start: nextSaturday, end: addDays(nextSaturday, 1) };
  } else if (dayOfWeek === 6) { // Saturday
    return { start: date, end: addDays(date, 1) };
  }
  
  // Find next weekend
  const daysToSaturday = 6 - dayOfWeek;
  const saturday = addDays(date, daysToSaturday);
  return { start: saturday, end: addDays(saturday, 1) };
}

function countWeekendDays(startDate, endDate) {
  const dates = eachDayOfInterval({ start: startDate, end: endDate });
  return dates.filter(date => isWeekend(date)).length;
}

function countHolidayDays(startDate, endDate, holidays) {
  const dates = eachDayOfInterval({ start: startDate, end: endDate });
  return dates.filter(date => 
    holidays.some(holiday => isSameDay(date, holiday))
  ).length;
}

function findAdditionalWeekends(allDates, offDays, remainingPTO, existingRecommendations) {
  // Find weekends not already covered by recommendations
  const recommendations = [];
  const usedDates = new Set();
  
  // Mark dates already used
  existingRecommendations.forEach(rec => {
    const dates = eachDayOfInterval({ start: rec.startDate, end: rec.endDate });
    dates.forEach(date => usedDates.add(date.getTime()));
  });
  
  // Find available weekends
  const weekends = [];
  for (let i = 0; i < allDates.length; i++) {
    const date = allDates[i];
    if (date.getDay() === 6 && !usedDates.has(date.getTime())) { // Saturday
      const sunday = addDays(date, 1);
      if (i + 1 < allDates.length && !usedDates.has(sunday.getTime())) {
        weekends.push({ start: date, end: sunday });
      }
    }
  }
  
  // Extend weekends with PTO days
  let ptoLeft = remainingPTO;
  for (const weekend of weekends) {
    if (ptoLeft <= 0) break;
    
    // Try to extend weekend (add Friday and/or Monday)
    const friday = addDays(weekend.start, -1);
    const monday = addDays(weekend.end, 1);
    
    let startDate = weekend.start;
    let endDate = weekend.end;
    let ptoUsed = 0;
    
    // Add Friday if available and we have PTO
    if (ptoLeft > 0 && !isWeekend(friday) && !usedDates.has(friday.getTime())) {
      startDate = friday;
      ptoUsed++;
      ptoLeft--;
    }
    
    // Add Monday if available and we have PTO
    if (ptoLeft > 0 && !isWeekend(monday) && !usedDates.has(monday.getTime())) {
      endDate = monday;
      ptoUsed++;
      ptoLeft--;
    }
    
    if (ptoUsed > 0) {
      const vacation = createVacationPeriod(startDate, endDate, ptoUsed, offDays, 'Long Weekend');
      recommendations.push(vacation);
      
      // Mark dates as used
      const dates = eachDayOfInterval({ start: startDate, end: endDate });
      dates.forEach(date => usedDates.add(date.getTime()));
    }
  }
  
  return recommendations;
}

function findBestMiniBreak(segmentDates, offDays, targetSize) {
  // Find the best 2-3 day period in the segment
  // Prefer periods that include existing off days
  let bestBreak = null;
  let bestScore = 0;
  
  for (let i = 0; i <= segmentDates.length - targetSize; i++) {
    const startDate = segmentDates[i];
    const endDate = segmentDates[i + targetSize - 1];
    
    // Skip if it includes weekends (not efficient for mini breaks)
    const dates = eachDayOfInterval({ start: startDate, end: endDate });
    const weekendCount = dates.filter(date => isWeekend(date)).length;
    if (weekendCount > 0) continue;
    
    // Calculate score based on adjacent weekends/holidays
    let score = 1;
    
    // Bonus for being adjacent to weekends
    const dayBefore = addDays(startDate, -1);
    const dayAfter = addDays(endDate, 1);
    
    if (isWeekend(dayBefore)) score += 2;
    if (isWeekend(dayAfter)) score += 2;
    
    // Bonus for including holidays
    const holidayCount = countHolidayDays(startDate, endDate, offDays);
    score += holidayCount * 3;
    
    if (score > bestScore) {
      bestScore = score;
      bestBreak = { startDate, endDate };
    }
  }
  
  return bestBreak;
}
