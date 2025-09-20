import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { VACATION_STYLES } from '../utils/ptoOptimizer';
import { DatePicker } from './DatePicker';
import { MultiDatePicker } from './MultiDatePicker';
import { Button } from './Button';
import { Calendar, MapPin, Building, Settings } from 'lucide-react';

export function InputForm() {
  const { state, actions } = useApp();
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!state.ptoDays || state.ptoDays <= 0) {
      newErrors.ptoDays = 'PTO days must be a positive number';
    }

    if (state.startDate >= state.endDate) {
      newErrors.dateRange = 'Start date must be before end date';
    }

    // Check if holidays are within the selected date range
    const invalidHolidays = state.nationalHolidays.filter(
      holiday => holiday < state.startDate || holiday > state.endDate
    );
    if (invalidHolidays.length > 0) {
      newErrors.nationalHolidays = 'All national holidays must be within the selected date range';
    }

    const invalidOffDays = state.companyOffDays.filter(
      offDay => offDay < state.startDate || offDay > state.endDate
    );
    if (invalidOffDays.length > 0) {
      newErrors.companyOffDays = 'All company off days must be within the selected date range';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      await actions.generateSchedule();
      actions.setCurrentView('schedule');
    }
  };

  const vacationStyleOptions = [
    {
      value: VACATION_STYLES.BALANCED_MIX,
      label: 'Balanced Mix',
      description: 'Spread PTO days evenly across months for consistent breaks',
      icon: '⚖️'
    },
    {
      value: VACATION_STYLES.LONG_WEEKENDS,
      label: 'Long Weekends',
      description: 'Extend weekends around holidays for maximum time off',
      icon: '🏖️'
    },
    {
      value: VACATION_STYLES.MINI_BREAKS,
      label: 'Mini Breaks',
      description: 'Create multiple short 2-3 day breaks throughout the year',
      icon: '🎯'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Plan Your PTO
        </h1>
        <p className="text-gray-600">
          Optimize your paid time off by combining it with holidays and weekends
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* PTO Days Input */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">PTO Details</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="ptoDays" className="block text-sm font-medium text-gray-700 mb-2">
                Number of PTO Days
              </label>
              <input
                type="number"
                id="ptoDays"
                min="1"
                max="365"
                value={state.ptoDays}
                onChange={(e) => actions.setPtoDays(parseInt(e.target.value) || 0)}
                className={`
                  w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors.ptoDays ? 'border-red-300' : 'border-gray-300'}
                `}
                placeholder="Enter number of PTO days"
                aria-describedby={errors.ptoDays ? 'ptoDays-error' : undefined}
              />
              {errors.ptoDays && (
                <p id="ptoDays-error" className="mt-1 text-sm text-red-600">
                  {errors.ptoDays}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="vacationStyle" className="block text-sm font-medium text-gray-700 mb-2">
                Vacation Style
              </label>
              <select
                id="vacationStyle"
                value={state.vacationStyle}
                onChange={(e) => actions.setVacationStyle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {vacationStyleOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Vacation Style Description */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>{vacationStyleOptions.find(opt => opt.value === state.vacationStyle)?.label}:</strong>{' '}
              {vacationStyleOptions.find(opt => opt.value === state.vacationStyle)?.description}
            </p>
          </div>
        </div>

        {/* Date Range */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Planning Period</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <DatePicker
                value={state.startDate}
                onChange={actions.setStartDate}
                placeholder="Select start date"
                maxDate={state.endDate}
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <DatePicker
                value={state.endDate}
                onChange={actions.setEndDate}
                placeholder="Select end date"
                minDate={state.startDate}
                className="w-full"
              />
            </div>
          </div>
          
          {errors.dateRange && (
            <p className="mt-2 text-sm text-red-600">
              {errors.dateRange}
            </p>
          )}
        </div>

        {/* National Holidays */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-semibold text-gray-900">National Holidays</h2>
          </div>
          
          <div>
            <label htmlFor="nationalHolidays" className="block text-sm font-medium text-gray-700 mb-2">
              Select National Holidays
            </label>
            <MultiDatePicker
              value={state.nationalHolidays}
              onChange={actions.setNationalHolidays}
              placeholder="Add national holidays"
              minDate={state.startDate}
              maxDate={state.endDate}
              className="w-full"
            />
            {errors.nationalHolidays && (
              <p className="mt-1 text-sm text-red-600">
                {errors.nationalHolidays}
              </p>
            )}
          </div>
        </div>

        {/* Company Off Days */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Building className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Company Off Days</h2>
          </div>
          
          <div>
            <label htmlFor="companyOffDays" className="block text-sm font-medium text-gray-700 mb-2">
              Select Company-Specific Off Days
            </label>
            <MultiDatePicker
              value={state.companyOffDays}
              onChange={actions.setCompanyOffDays}
              placeholder="Add company off days"
              minDate={state.startDate}
              maxDate={state.endDate}
              className="w-full"
            />
            {errors.companyOffDays && (
              <p className="mt-1 text-sm text-red-600">
                {errors.companyOffDays}
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={state.isLoading}
            className="px-8 py-3 text-lg"
          >
            {state.isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating Schedule...
              </>
            ) : (
              <>
                <Settings className="h-4 w-4 mr-2" />
                Generate PTO Schedule
              </>
            )}
          </Button>
        </div>

        {/* Error Display */}
        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-red-500 rounded-full"></div>
              <p className="text-red-800 font-medium">Error</p>
            </div>
            <p className="text-red-700 mt-1">{state.error}</p>
          </div>
        )}
      </form>
    </div>
  );
}
