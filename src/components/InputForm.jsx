import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker, MultiDatePicker } from '@/components/ui/date-picker';
import { WorkWeekSelector } from '@/components/ui/work-week-selector';
import { Calendar, CalendarDays, Settings } from 'lucide-react';
import { VACATION_STYLES, VACATION_STYLE_LABELS } from '@/utils/ptoOptimizer';
import { addYears } from 'date-fns';

export function InputForm({ onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    ptoDays: '',
    startDate: null,
    endDate: null,
    vacationStyle: VACATION_STYLES.BALANCED_MIX,
    holidays: [],
    companyOffDays: [],
    weekendDays: [0, 6] // Default: Sunday and Saturday
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Validate PTO days
    const ptoDays = parseInt(formData.ptoDays);
    if (!ptoDays || ptoDays <= 0) {
      newErrors.ptoDays = 'PTO days must be a positive number';
    }

    // Validate date range
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const optimizationParams = {
      ptoDays: parseInt(formData.ptoDays),
      startDate: formData.startDate,
      endDate: formData.endDate,
      holidays: formData.holidays,
      companyOffDays: formData.companyOffDays,
      vacationStyle: formData.vacationStyle,
      weekendDays: formData.weekendDays
    };

    onSubmit(optimizationParams);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-6 w-6" />
          PTO Planning Configuration
        </CardTitle>
        <CardDescription>
          Enter your details to generate an optimized vacation schedule
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PTO Days */}
          <div className="space-y-2">
            <Label htmlFor="ptoDays">Available PTO Days</Label>
            <Input
              id="ptoDays"
              type="number"
              min="1"
              placeholder="e.g., 20"
              value={formData.ptoDays}
              onChange={(e) => handleInputChange('ptoDays', e.target.value)}
              className={errors.ptoDays ? 'border-red-500' : ''}
            />
            {errors.ptoDays && (
              <p className="text-sm text-red-500">{errors.ptoDays}</p>
            )}
          </div>

          {/* Planning Period */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Planning Start Date</Label>
              <DatePicker
                date={formData.startDate}
                onDateChange={(date) => handleInputChange('startDate', date)}
                placeholder="Select start date"
                className={errors.startDate ? 'border-red-500' : ''}
              />
              {errors.startDate && (
                <p className="text-sm text-red-500">{errors.startDate}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Start of your planning period (e.g., beginning of fiscal year)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Planning End Date</Label>
              <DatePicker
                date={formData.endDate}
                onDateChange={(date) => handleInputChange('endDate', date)}
                placeholder="Select end date"
                className={errors.endDate ? 'border-red-500' : ''}
              />
              {errors.endDate && (
                <p className="text-sm text-red-500">{errors.endDate}</p>
              )}
              <p className="text-sm text-muted-foreground">
                End of your planning period
              </p>
            </div>
          </div>

          {/* Vacation Style */}
          <div className="space-y-2">
            <Label htmlFor="vacationStyle">Vacation Style</Label>
            <Select 
              value={formData.vacationStyle} 
              onValueChange={(value) => handleInputChange('vacationStyle', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(VACATION_STYLE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground">
              <div className="mt-2 space-y-1">
                <p><strong>Balanced Mix:</strong> Combines long weekends and mini breaks</p>
                <p><strong>Long Weekends:</strong> Extends weekends around holidays</p>
                <p><strong>Mini Breaks:</strong> Short 2-3 day breaks throughout the year</p>
              </div>
            </div>
          </div>

          {/* Work Week Configuration */}
          <WorkWeekSelector
            weekendDays={formData.weekendDays}
            onWeekendDaysChange={(days) => handleInputChange('weekendDays', days)}
          />

          {/* Holidays */}
          <div className="space-y-2">
            <Label htmlFor="holidays">National Holidays (optional)</Label>
            <MultiDatePicker
              dates={formData.holidays}
              onDatesChange={(dates) => handleInputChange('holidays', dates)}
              placeholder="Select national holidays"
              maxDisplay={2}
            />
            <p className="text-sm text-muted-foreground">
              Click to select multiple holiday dates from the calendar
            </p>
          </div>

          {/* Company Off Days */}
          <div className="space-y-2">
            <Label htmlFor="companyOffDays">Company Off Days (optional)</Label>
            <MultiDatePicker
              dates={formData.companyOffDays}
              onDatesChange={(dates) => handleInputChange('companyOffDays', dates)}
              placeholder="Select company off days"
              maxDisplay={2}
            />
            <p className="text-sm text-muted-foreground">
              Select additional company-specific off days (e.g., floating holidays, company closure days)
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <CalendarDays className="mr-2 h-4 w-4 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                Generate PTO Plan
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
