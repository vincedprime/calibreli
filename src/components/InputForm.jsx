import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker, MultiDatePicker } from '@/components/ui/date-picker';
import { WorkWeekSelector } from '@/components/ui/work-week-selector';
import { ArrowRight, ChevronDown } from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import { VACATION_STYLES, VACATION_STYLE_LABELS } from '@/utils/ptoOptimizer';


export function InputForm({ onSubmit, isLoading, initialValues }) {
  const [formData, setFormData] = useState(() => ({
    ptoDays: initialValues?.ptoDays?.toString() ?? '',
    startDate: initialValues?.startDate ?? null,
    endDate: initialValues?.endDate ?? null,
    vacationStyle: initialValues?.vacationStyle ?? VACATION_STYLES.BALANCED_MIX,
    holidays: initialValues?.holidays ?? [],
    weekendDays: initialValues?.weekendDays ?? [0, 6]
  }));

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Validate PTO days
    const ptoDays = Number(formData.ptoDays);
    if (!Number.isSafeInteger(ptoDays) || ptoDays <= 0) {
      newErrors.ptoDays = 'Enter a positive whole number of days';
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
      ptoDays: Number(formData.ptoDays),
      startDate: formData.startDate,
      endDate: formData.endDate,
      holidays: formData.holidays,
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
    <form onSubmit={handleSubmit} className="planner-form min-w-0">
      <h2 className="font-semibold mb-5">Your schedule</h2>
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="ptoDays">Available vacation days</Label>
          <div className="relative">
            <Input id="ptoDays" type="number" min="1" step="1" placeholder="20"
              aria-invalid={!!errors.ptoDays} aria-describedby={errors.ptoDays ? 'ptoDays-error' : undefined}
              value={formData.ptoDays} onChange={e => handleInputChange('ptoDays', e.target.value)}
              className="pr-16 bg-card" />
            <span className="absolute right-3 top-2.5 text-sm text-muted-foreground pointer-events-none">days</span>
          </div>
          {errors.ptoDays && <p id="ptoDays-error" role="alert" className="text-xs text-destructive">{errors.ptoDays}</p>}
        </div>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium mb-2">Planning period</legend>
          <div className="grid grid-cols-2 gap-3">
            {[['startDate', 'From'], ['endDate', 'To']].map(([field, label]) => (
              <div key={field} className="space-y-1.5 min-w-0">
                <Label className="text-xs text-muted-foreground" htmlFor={field}>{label}</Label>
                <DatePicker id={field} date={formData[field]} displayFormat="MMM d, yyyy"
                  onDateChange={date => handleInputChange(field, date)} placeholder="Choose date"
                  aria-invalid={!!errors[field]} aria-describedby={errors[field] ? `${field}-error` : undefined}
                  className="bg-card px-2 text-xs" />
                {errors[field] && <p id={`${field}-error`} role="alert" className="text-xs text-destructive">{errors[field]}</p>}
              </div>
            ))}
          </div>
        </fieldset>
        <div className="space-y-2">
          <Label htmlFor="vacationStyle">Break preference</Label>
          <Select value={formData.vacationStyle} onValueChange={value => handleInputChange('vacationStyle', value)}>
            <SelectTrigger id="vacationStyle" className="bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>{Object.entries(VACATION_STYLE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}</SelectContent>
          </Select>
        </div>
      </div>
      <details className="schedule-details mt-6 border-t">
        <summary className="flex items-center justify-between py-4 text-sm cursor-pointer gap-2">
          <span>Regular days off</span>
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            {formData.weekendDays.map(day => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]).join(', ')}
            <ChevronDown className="h-3.5 w-3.5 disclosure-chevron" />
          </span>
        </summary>
        <div className="pb-4"><WorkWeekSelector weekendDays={formData.weekendDays}
          onWeekendDaysChange={days => handleInputChange('weekendDays', days)} /></div>
      </details>
      <details className="schedule-details border-t border-b">
        <summary className="flex items-center justify-between py-4 text-sm cursor-pointer gap-2">
          <span>Holidays</span>
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            {formData.holidays.length || 'Optional'}
            <ChevronDown className="h-3.5 w-3.5 disclosure-chevron" />
          </span>
        </summary>
        <div className="space-y-4 pb-5">
          <p className="text-xs text-muted-foreground leading-relaxed">Add any public or company holidays that are already paid days off.</p>
          <div className="space-y-2">
            <Label htmlFor="holidays" className="text-xs">Holiday dates</Label>
            <MultiDatePicker id="holidays" dates={formData.holidays} onDatesChange={dates => handleInputChange('holidays', dates)}
              placeholder="Add dates" maxDisplay={2} className="bg-card" />
          </div>
        </div>
      </details>
      <Button type="submit" className="w-full mt-6 gap-2 h-11" disabled={isLoading}>
        {isLoading ? <><Spinner />Finding breaks…</> : <>Find breaks<ArrowRight className="h-4 w-4 ml-auto" /></>}
      </Button>
    </form>
  );
}
