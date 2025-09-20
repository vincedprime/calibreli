import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar } from './Calendar';
import { Button } from './Button';
import { 
  Calendar as CalendarIcon, 
  List, 
  Download, 
  Save, 
  ArrowLeft,
  Share2,
  FileText,
  Clock,
  MapPin,
  Building
} from 'lucide-react';

export function ScheduleView() {
  const { state, actions } = useApp();
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [planName, setPlanName] = useState('');

  if (!state.optimizedSchedule) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Schedule Generated</h1>
          <p className="text-gray-600 mb-6">
            Please go back and generate a PTO schedule first.
          </p>
          <Button onClick={() => actions.setCurrentView('form')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Form
          </Button>
        </div>
      </div>
    );
  }

  const schedule = state.optimizedSchedule;
  const totalDaysOff = schedule.schedule.reduce((total, item) => total + item.days, 0);
  const totalDaysInRange = schedule.metadata.totalDaysInRange;
  const weekendDays = schedule.metadata.weekendDays;
  const holidayDays = schedule.metadata.holidayDays;

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateRange = (startDate, endDate) => {
    if (startDate.toDateString() === endDate.toDateString()) {
      return formatDate(startDate);
    }
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  const handleSavePlan = () => {
    if (planName.trim()) {
      actions.savePlan({
        ptoDays: state.ptoDays,
        startDate: state.startDate,
        endDate: state.endDate,
        nationalHolidays: state.nationalHolidays,
        companyOffDays: state.companyOffDays,
        vacationStyle: state.vacationStyle,
        optimizedSchedule: schedule
      }, planName);
      
      setShowSaveDialog(false);
      setPlanName('');
    }
  };

  const handleExport = (format) => {
    const data = actions.exportSchedule(format);
    if (data) {
      const blob = new Blob([data], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pto-schedule-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const getVacationStyleLabel = (style) => {
    const styles = {
      'balanced_mix': 'Balanced Mix',
      'long_weekends': 'Long Weekends',
      'mini_breaks': 'Mini Breaks'
    };
    return styles[style] || style;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Your PTO Schedule
            </h1>
            <p className="text-gray-600">
              {getVacationStyleLabel(schedule.vacationStyle)} • {schedule.usedPtoDays} of {schedule.totalPtoDays} PTO days used
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => actions.setCurrentView('form')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Form
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowSaveDialog(true)}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Plan
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">PTO Days</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{schedule.usedPtoDays}</p>
            <p className="text-sm text-blue-700">of {schedule.totalPtoDays} used</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-900">Total Days Off</span>
            </div>
            <p className="text-2xl font-bold text-green-900">{totalDaysOff}</p>
            <p className="text-sm text-green-700">including weekends</p>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-900">Holidays</span>
            </div>
            <p className="text-2xl font-bold text-red-900">{holidayDays}</p>
            <p className="text-sm text-red-700">national holidays</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Building className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-900">Company Days</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">{state.companyOffDays.length}</p>
            <p className="text-sm text-purple-700">company off days</p>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 rounded-md transition-colors ${
              viewMode === 'calendar' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <CalendarIcon className="h-4 w-4 mr-2 inline" />
            Calendar View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-md transition-colors ${
              viewMode === 'list' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <List className="h-4 w-4 mr-2 inline" />
            List View
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'calendar' ? (
        <Calendar
          schedule={schedule}
          holidays={[...state.nationalHolidays, ...state.companyOffDays]}
          startDate={state.startDate}
          endDate={state.endDate}
          className="mb-6"
        />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">PTO Schedule</h2>
          <div className="space-y-3">
            {schedule.schedule.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatDateRange(item.startDate, item.endDate)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {item.days} day{item.days > 1 ? 's' : ''} • {item.reason || 'Planned time off'}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-medium text-blue-600">
                  {item.days} day{item.days > 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export Options */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Schedule</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => handleExport('json')}
          >
            <FileText className="h-4 w-4 mr-2" />
            Export as JSON
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleExport('csv')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export as CSV
          </Button>
          
          <Button
            variant="outline"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'My PTO Schedule',
                  text: `Check out my optimized PTO schedule!`,
                  url: window.location.href
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                // You could show a toast here
              }
            }}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Save Plan Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Save PTO Plan</h3>
            
            <div className="mb-4">
              <label htmlFor="planName" className="block text-sm font-medium text-gray-700 mb-2">
                Plan Name
              </label>
              <input
                type="text"
                id="planName"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter plan name"
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSaveDialog(false);
                  setPlanName('');
                }}
              >
                Cancel
              </Button>
              
              <Button
                onClick={handleSavePlan}
                disabled={!planName.trim()}
              >
                Save Plan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
