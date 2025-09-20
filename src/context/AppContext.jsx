import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { optimizePTO, VACATION_STYLES } from '../utils/ptoOptimizer';

// Initial state
const initialState = {
  // User inputs
  ptoDays: 0,
  startDate: new Date(new Date().getFullYear(), 0, 1), // January 1st of current year
  endDate: new Date(new Date().getFullYear(), 11, 31), // December 31st of current year
  nationalHolidays: [],
  companyOffDays: [],
  vacationStyle: VACATION_STYLES.BALANCED_MIX,
  
  // Generated results
  optimizedSchedule: null,
  isLoading: false,
  error: null,
  
  // UI state
  currentView: 'form', // 'form', 'schedule', 'calendar'
  savedPlans: []
};

// Action types
const ActionTypes = {
  SET_PTO_DAYS: 'SET_PTO_DAYS',
  SET_START_DATE: 'SET_START_DATE',
  SET_END_DATE: 'SET_END_DATE',
  SET_NATIONAL_HOLIDAYS: 'SET_NATIONAL_HOLIDAYS',
  SET_COMPANY_OFF_DAYS: 'SET_COMPANY_OFF_DAYS',
  SET_VACATION_STYLE: 'SET_VACATION_STYLE',
  GENERATE_SCHEDULE: 'GENERATE_SCHEDULE',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_CURRENT_VIEW: 'SET_CURRENT_VIEW',
  SAVE_PLAN: 'SAVE_PLAN',
  LOAD_PLAN: 'LOAD_PLAN',
  DELETE_PLAN: 'DELETE_PLAN',
  LOAD_SAVED_PLANS: 'LOAD_SAVED_PLANS'
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_PTO_DAYS:
      return { ...state, ptoDays: action.payload };
    
    case ActionTypes.SET_START_DATE:
      return { ...state, startDate: action.payload };
    
    case ActionTypes.SET_END_DATE:
      return { ...state, endDate: action.payload };
    
    case ActionTypes.SET_NATIONAL_HOLIDAYS:
      return { ...state, nationalHolidays: action.payload };
    
    case ActionTypes.SET_COMPANY_OFF_DAYS:
      return { ...state, companyOffDays: action.payload };
    
    case ActionTypes.SET_VACATION_STYLE:
      return { ...state, vacationStyle: action.payload };
    
    case ActionTypes.GENERATE_SCHEDULE:
      return { 
        ...state, 
        optimizedSchedule: action.payload,
        isLoading: false,
        error: null
      };
    
    case ActionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };
    
    case ActionTypes.SET_ERROR:
      return { 
        ...state, 
        error: action.payload,
        isLoading: false
      };
    
    case ActionTypes.SET_CURRENT_VIEW:
      return { ...state, currentView: action.payload };
    
    case ActionTypes.SAVE_PLAN:
      const newPlan = {
        id: Date.now().toString(),
        name: action.payload.name || `PTO Plan ${new Date().toLocaleDateString()}`,
        createdAt: new Date().toISOString(),
        ...action.payload.data
      };
      return {
        ...state,
        savedPlans: [...state.savedPlans, newPlan]
      };
    
    case ActionTypes.LOAD_PLAN:
      const plan = state.savedPlans.find(p => p.id === action.payload);
      if (plan) {
        return {
          ...state,
          ptoDays: plan.ptoDays,
          startDate: new Date(plan.startDate),
          endDate: new Date(plan.endDate),
          nationalHolidays: plan.nationalHolidays.map(d => new Date(d)),
          companyOffDays: plan.companyOffDays.map(d => new Date(d)),
          vacationStyle: plan.vacationStyle,
          optimizedSchedule: plan.optimizedSchedule,
          currentView: 'schedule'
        };
      }
      return state;
    
    case ActionTypes.DELETE_PLAN:
      return {
        ...state,
        savedPlans: state.savedPlans.filter(p => p.id !== action.payload)
      };
    
    case ActionTypes.LOAD_SAVED_PLANS:
      return {
        ...state,
        savedPlans: action.payload
      };
    
    default:
      return state;
  }
}

// Context
const AppContext = createContext();

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load saved plans from localStorage on mount
  useEffect(() => {
    const savedPlans = localStorage.getItem('calibreli-saved-plans');
    if (savedPlans) {
      try {
        const parsed = JSON.parse(savedPlans);
        dispatch({ type: ActionTypes.LOAD_SAVED_PLANS, payload: parsed });
      } catch (error) {
        console.error('Error loading saved plans:', error);
      }
    }
  }, []);

  // Save plans to localStorage whenever savedPlans changes
  useEffect(() => {
    if (state.savedPlans.length > 0) {
      localStorage.setItem('calibreli-saved-plans', JSON.stringify(state.savedPlans));
    }
  }, [state.savedPlans]);

  // Actions
  const actions = {
    setPtoDays: (days) => dispatch({ type: ActionTypes.SET_PTO_DAYS, payload: days }),
    setStartDate: (date) => dispatch({ type: ActionTypes.SET_START_DATE, payload: date }),
    setEndDate: (date) => dispatch({ type: ActionTypes.SET_END_DATE, payload: date }),
    setNationalHolidays: (holidays) => dispatch({ type: ActionTypes.SET_NATIONAL_HOLIDAYS, payload: holidays }),
    setCompanyOffDays: (offDays) => dispatch({ type: ActionTypes.SET_COMPANY_OFF_DAYS, payload: offDays }),
    setVacationStyle: (style) => dispatch({ type: ActionTypes.SET_VACATION_STYLE, payload: style }),
    setCurrentView: (view) => dispatch({ type: ActionTypes.SET_CURRENT_VIEW, payload: view }),
    
    generateSchedule: async () => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      
      try {
        const result = optimizePTO({
          ptoDays: state.ptoDays,
          startDate: state.startDate,
          endDate: state.endDate,
          nationalHolidays: state.nationalHolidays,
          companyOffDays: state.companyOffDays,
          vacationStyle: state.vacationStyle
        });
        
        dispatch({ type: ActionTypes.GENERATE_SCHEDULE, payload: result });
      } catch (error) {
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      }
    },
    
    savePlan: (planData, name) => {
      dispatch({ 
        type: ActionTypes.SAVE_PLAN, 
        payload: { data: planData, name } }
      );
    },
    
    loadPlan: (planId) => {
      dispatch({ type: ActionTypes.LOAD_PLAN, payload: planId });
    },
    
    deletePlan: (planId) => {
      dispatch({ type: ActionTypes.DELETE_PLAN, payload: planId });
    },
    
    exportSchedule: (format = 'json') => {
      if (!state.optimizedSchedule) return null;
      
      const exportData = {
        plan: {
          ptoDays: state.ptoDays,
          startDate: state.startDate.toISOString(),
          endDate: state.endDate.toISOString(),
          nationalHolidays: state.nationalHolidays.map(d => d.toISOString()),
          companyOffDays: state.companyOffDays.map(d => d.toISOString()),
          vacationStyle: state.vacationStyle
        },
        schedule: state.optimizedSchedule,
        exportedAt: new Date().toISOString()
      };
      
      if (format === 'csv') {
        return exportToCSV(exportData);
      }
      
      return JSON.stringify(exportData, null, 2);
    },
    
    importSchedule: (data) => {
      try {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        
        if (parsed.plan) {
          dispatch({ type: ActionTypes.SET_PTO_DAYS, payload: parsed.plan.ptoDays });
          dispatch({ type: ActionTypes.SET_START_DATE, payload: new Date(parsed.plan.startDate) });
          dispatch({ type: ActionTypes.SET_END_DATE, payload: new Date(parsed.plan.endDate) });
          dispatch({ type: ActionTypes.SET_NATIONAL_HOLIDAYS, payload: parsed.plan.nationalHolidays.map(d => new Date(d)) });
          dispatch({ type: ActionTypes.SET_COMPANY_OFF_DAYS, payload: parsed.plan.companyOffDays.map(d => new Date(d)) });
          dispatch({ type: ActionTypes.SET_VACATION_STYLE, payload: parsed.plan.vacationStyle });
          
          if (parsed.schedule) {
            dispatch({ type: ActionTypes.GENERATE_SCHEDULE, payload: parsed.schedule });
          }
        }
        
        return true;
      } catch (error) {
        dispatch({ type: ActionTypes.SET_ERROR, payload: 'Invalid import data' });
        return false;
      }
    }
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Helper function to export to CSV
function exportToCSV(data) {
  const headers = ['Start Date', 'End Date', 'Days', 'Type', 'Reason'];
  const rows = data.schedule.schedule.map(item => [
    item.startDate.toISOString().split('T')[0],
    item.endDate.toISOString().split('T')[0],
    item.days,
    item.type,
    item.reason || ''
  ]);
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
  
  return csvContent;
}
