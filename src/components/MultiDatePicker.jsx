import React, { useState } from 'react';
import { Calendar, X, Plus } from 'lucide-react';
import { DatePicker } from './DatePicker';

export function MultiDatePicker({ 
  value = [], 
  onChange, 
  placeholder = "Select dates",
  minDate,
  maxDate,
  className = "",
  disabled = false,
  maxSelections
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempDate, setTempDate] = useState(null);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const addDate = (date) => {
    if (!date) return;
    
    const dateString = date.toDateString();
    const isAlreadySelected = value.some(d => d.toDateString() === dateString);
    
    if (!isAlreadySelected && (!maxSelections || value.length < maxSelections)) {
      const newDates = [...value, date].sort((a, b) => a - b);
      onChange(newDates);
    }
    
    setTempDate(null);
  };

  const removeDate = (dateToRemove) => {
    const newDates = value.filter(date => date.toDateString() !== dateToRemove.toDateString());
    onChange(newDates);
  };

  const handleAddClick = () => {
    if (tempDate) {
      addDate(tempDate);
    } else {
      setIsOpen(true);
    }
  };

  const handleDateSelect = (date) => {
    setTempDate(date);
    setIsOpen(false);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Selected dates display */}
      <div className="min-h-[40px] p-2 border border-gray-300 rounded-md bg-white">
        {value.length === 0 ? (
          <span className="text-gray-500">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-2">
            {value.map((date, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
              >
                {formatDate(date)}
                <button
                  type="button"
                  onClick={() => removeDate(date)}
                  className="hover:bg-blue-200 rounded p-0.5"
                  aria-label={`Remove ${formatDate(date)}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Add date section */}
      <div className="flex gap-2">
        <DatePicker
          value={tempDate}
          onChange={handleDateSelect}
          placeholder="Select a date to add"
          minDate={minDate}
          maxDate={maxDate}
          className="flex-1"
          disabled={disabled}
        />
        
        <button
          type="button"
          onClick={handleAddClick}
          disabled={disabled || !tempDate || (maxSelections && value.length >= maxSelections)}
          className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      {/* Date picker modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Select Date</h3>
            
            <DatePicker
              value={tempDate}
              onChange={setTempDate}
              minDate={minDate}
              maxDate={maxDate}
              className="mb-4"
            />
            
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setTempDate(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={() => {
                  if (tempDate) {
                    addDate(tempDate);
                    setIsOpen(false);
                  }
                }}
                disabled={!tempDate}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
              >
                Add Date
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Helper text */}
      {maxSelections && (
        <p className="text-sm text-gray-500">
          {value.length} of {maxSelections} dates selected
        </p>
      )}
    </div>
  );
}
