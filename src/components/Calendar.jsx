import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Calendar({ 
  schedule, 
  holidays = [], 
  startDate, 
  endDate,
  onDateClick,
  className = ""
}) {
  const [currentMonth, setCurrentMonth] = useState(startDate || new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() + direction);
      return newMonth;
    });
  };

  const getDateType = (date) => {
    if (!date) return null;

    // Check if it's a weekend
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Check if it's a holiday
    const isHoliday = holidays.some(holiday => 
      date.toDateString() === holiday.toDateString()
    );

    // Check if it's a PTO day
    const isPtoDay = schedule?.schedule?.some(item => 
      date >= item.startDate && date <= item.endDate
    );

    // Check if it's outside the planning period
    const isOutsideRange = (startDate && date < startDate) || (endDate && date > endDate);

    return {
      isWeekend,
      isHoliday,
      isPtoDay,
      isOutsideRange
    };
  };

  const getDateStyles = (date, dateType) => {
    if (!date || !dateType) return '';

    const baseStyles = 'h-8 w-8 flex items-center justify-center text-sm rounded cursor-pointer transition-colors';
    
    if (dateType.isOutsideRange) {
      return `${baseStyles} text-gray-300 cursor-not-allowed`;
    }

    if (dateType.isPtoDay) {
      return `${baseStyles} bg-blue-500 text-white hover:bg-blue-600 font-medium`;
    }

    if (dateType.isHoliday) {
      return `${baseStyles} bg-red-500 text-white hover:bg-red-600 font-medium`;
    }

    if (dateType.isWeekend) {
      return `${baseStyles} bg-gray-100 text-gray-600 hover:bg-gray-200`;
    }

    return `${baseStyles} text-gray-900 hover:bg-gray-100`;
  };

  const getDateTooltip = (date, dateType) => {
    if (!date || !dateType) return '';

    const tooltips = [];
    
    if (dateType.isPtoDay) {
      const ptoItem = schedule?.schedule?.find(item => 
        date >= item.startDate && date <= item.endDate
      );
      tooltips.push(`PTO: ${ptoItem?.reason || 'Planned time off'}`);
    }
    
    if (dateType.isHoliday) {
      tooltips.push('Holiday');
    }
    
    if (dateType.isWeekend) {
      tooltips.push('Weekend');
    }

    return tooltips.join(', ');
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        
        <h2 className="text-lg font-semibold text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        
        <button
          onClick={() => navigateMonth(1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-xs text-gray-500 text-center py-2 font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {getDaysInMonth(currentMonth).map((date, index) => {
          const dateType = getDateType(date);
          const styles = getDateStyles(date, dateType);
          const tooltip = getDateTooltip(date, dateType);

          return (
            <button
              key={index}
              onClick={() => date && onDateClick?.(date)}
              className={styles}
              disabled={!date || dateType?.isOutsideRange}
              title={tooltip}
              aria-label={date ? `${date.getDate()}, ${tooltip}` : ''}
            >
              {date?.getDate()}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-blue-500 rounded"></div>
            <span>PTO Days</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-red-500 rounded"></div>
            <span>Holidays</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-gray-100 rounded"></div>
            <span>Weekends</span>
          </div>
        </div>
      </div>
    </div>
  );
}
