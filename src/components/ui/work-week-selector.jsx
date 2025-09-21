import React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const DAYS_OF_WEEK = [
  { id: 0, label: 'Sunday', short: 'Sun' },
  { id: 1, label: 'Monday', short: 'Mon' },
  { id: 2, label: 'Tuesday', short: 'Tue' },
  { id: 3, label: 'Wednesday', short: 'Wed' },
  { id: 4, label: 'Thursday', short: 'Thu' },
  { id: 5, label: 'Friday', short: 'Fri' },
  { id: 6, label: 'Saturday', short: 'Sat' }
];

export function WorkWeekSelector({ 
  weekendDays = [0, 6], // Default: Sunday and Saturday
  onWeekendDaysChange,
  className 
}) {
  const toggleDay = (dayId) => {
    const isCurrentlySelected = weekendDays.includes(dayId);
    
    if (isCurrentlySelected) {
      // Remove the day (but ensure at least one weekend day remains)
      if (weekendDays.length > 1) {
        onWeekendDaysChange(weekendDays.filter(id => id !== dayId));
      }
    } else {
      // Add the day
      onWeekendDaysChange([...weekendDays, dayId].sort());
    }
  };

  const getPresetName = () => {
    const sortedDays = [...weekendDays].sort();
    
    // Common presets
    if (JSON.stringify(sortedDays) === JSON.stringify([0, 6])) {
      return "Standard (Sat-Sun)";
    } else if (JSON.stringify(sortedDays) === JSON.stringify([5, 6])) {
      return "Middle East (Fri-Sat)";
    } else if (JSON.stringify(sortedDays) === JSON.stringify([6])) {
      return "Six-day week (Sat only)";
    } else if (JSON.stringify(sortedDays) === JSON.stringify([0])) {
      return "Six-day week (Sun only)";
    } else if (sortedDays.length === 0) {
      return "Seven-day work week";
    } else {
      return "Custom schedule";
    }
  };

  const applyPreset = (preset) => {
    switch (preset) {
      case 'standard':
        onWeekendDaysChange([0, 6]); // Sunday, Saturday
        break;
      case 'middle-east':
        onWeekendDaysChange([5, 6]); // Friday, Saturday
        break;
      case 'six-day-sat':
        onWeekendDaysChange([6]); // Saturday only
        break;
      case 'six-day-sun':
        onWeekendDaysChange([0]); // Sunday only
        break;
      default:
        break;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <Label className="text-base font-medium">Work Week Configuration</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Select which days are considered weekends/off days in your organization
        </p>
      </div>

      {/* Quick Presets */}
      <div className="space-y-2">
        <Label className="text-sm">Quick Presets:</Label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => applyPreset('standard')}
            className="px-3 py-1 text-xs rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Standard (Sat-Sun)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('middle-east')}
            className="px-3 py-1 text-xs rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Middle East (Fri-Sat)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('six-day-sat')}
            className="px-3 py-1 text-xs rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            6-day (Sat only)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('six-day-sun')}
            className="px-3 py-1 text-xs rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            6-day (Sun only)
          </button>
        </div>
      </div>

      {/* Day Selector */}
      <div className="space-y-2">
        <Label className="text-sm">Custom Selection:</Label>
        <div className="grid grid-cols-7 gap-2">
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = weekendDays.includes(day.id);
            return (
              <button
                key={day.id}
                type="button"
                onClick={() => toggleDay(day.id)}
                className={cn(
                  "p-2 text-xs rounded-md border transition-colors text-center",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-input"
                )}
              >
                <div className="font-medium">{day.short}</div>
                <div className="text-[10px] opacity-75">{day.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Selection Display */}
      <div className="p-3 bg-muted rounded-md">
        <div className="text-sm">
          <strong>Current Schedule:</strong> {getPresetName()}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Weekend days: {weekendDays.length === 0 
            ? "None (7-day work week)" 
            : weekendDays.map(id => DAYS_OF_WEEK[id].label).join(", ")
          }
        </div>
        <div className="text-xs text-muted-foreground">
          Work days per week: {7 - weekendDays.length}
        </div>
      </div>
    </div>
  );
}

export { DAYS_OF_WEEK };
