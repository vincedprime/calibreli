import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { InputForm } from './components/InputForm';
import { ScheduleView } from './components/ScheduleView';
import { ToastContainer, ToastTypes } from './components/Toast';
import { useState, useEffect } from 'react';

function AppContent() {
  const { state } = useApp();
  const [toasts, setToasts] = useState([]);

  // Show error toasts
  useEffect(() => {
    if (state.error) {
      addToast({
        message: state.error,
        type: ToastTypes.ERROR,
        duration: 5000
      });
    }
  }, [state.error]);

  const addToast = (toast) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Calibreli
              </h1>
              <span className="ml-2 text-sm text-gray-500">
                PTO Optimizer
              </span>
            </div>
            
            <nav className="flex space-x-4">
              <button
                onClick={() => state.actions?.setCurrentView('form')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  state.currentView === 'form'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Plan PTO
              </button>
              
              {state.optimizedSchedule && (
                <button
                  onClick={() => state.actions?.setCurrentView('schedule')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    state.currentView === 'schedule'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  View Schedule
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        {state.currentView === 'form' ? (
          <InputForm />
        ) : state.currentView === 'schedule' ? (
          <ScheduleView />
        ) : (
          <InputForm />
        )}
      </main>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
