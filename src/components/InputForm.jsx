import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, CalendarDays, Settings } from 'lucide-react';
import { VACATION_STYLES, VACATION_STYLE_LABELS } from '@/utils/ptoOptimizer';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function InputForm({ onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    ptoDays: '',
    startMonth: '',
    endMonth: '',
    vacationStyle: VACATION_STYLES.BALANCED_MIX,
    holidays: '',
    companyOffDays: '',
    year: new Date().getFullYear()
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Validate PTO days
    const ptoDays = parseInt(formData.ptoDays);
    if (!ptoDays || ptoDays <= 0) {
      newErrors.ptoDays = 'PTO days must be a positive number';
    }

    // Validate months
    if (formData.startMonth === '') {
      newErrors.startMonth = 'Start month is required';
    }
    if (formData.endMonth === '') {
      newErrors.endMonth = 'End month is required';
    }
    if (formData.startMonth !== '' && formData.endMonth !== '' && 
        parseInt(formData.startMonth) > parseInt(formData.endMonth)) {
      newErrors.endMonth = 'End month must be after start month';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const parseDate = (dateStr) => {
    if (!dateStr.trim()) return null;
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return null;
      return date;
    } catch {
      return null;
    }
  };

  const parseDates = (datesStr) => {
    if (!datesStr.trim()) return [];
    return datesStr
      .split(',')
      .map(d => parseDate(d.trim()))
      .filter(d => d !== null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const holidays = parseDates(formData.holidays);
    const companyOffDays = parseDates(formData.companyOffDays);

    const optimizationParams = {
      ptoDays: parseInt(formData.ptoDays),
      startMonth: parseInt(formData.startMonth),
      endMonth: parseInt(formData.endMonth),
      holidays,
      companyOffDays,
      vacationStyle: formData.vacationStyle,
      year: formData.year
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

          {/* Year */}
          <div className="space-y-2">
            <Label htmlFor="year">Planning Year</Label>
            <Input
              id="year"
              type="number"
              min="2024"
              max="2030"
              value={formData.year}
              onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
            />
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startMonth">Start Month</Label>
              <Select 
                value={formData.startMonth} 
                onValueChange={(value) => handleInputChange('startMonth', value)}
              >
                <SelectTrigger className={errors.startMonth ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select start month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.startMonth && (
                <p className="text-sm text-red-500">{errors.startMonth}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endMonth">End Month</Label>
              <Select 
                value={formData.endMonth} 
                onValueChange={(value) => handleInputChange('endMonth', value)}
              >
                <SelectTrigger className={errors.endMonth ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select end month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.endMonth && (
                <p className="text-sm text-red-500">{errors.endMonth}</p>
              )}
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

          {/* Holidays */}
          <div className="space-y-2">
            <Label htmlFor="holidays">National Holidays (optional)</Label>
            <Input
              id="holidays"
              placeholder="e.g., 2024-07-04, 2024-11-28, 2024-12-25"
              value={formData.holidays}
              onChange={(e) => handleInputChange('holidays', e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Enter dates in YYYY-MM-DD format, separated by commas
            </p>
          </div>

          {/* Company Off Days */}
          <div className="space-y-2">
            <Label htmlFor="companyOffDays">Company Off Days (optional)</Label>
            <Input
              id="companyOffDays"
              placeholder="e.g., 2024-12-24, 2024-12-31"
              value={formData.companyOffDays}
              onChange={(e) => handleInputChange('companyOffDays', e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Enter additional company-specific off days
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
