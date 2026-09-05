import React, { lazy, Suspense, useEffect, useState } from 'react';
const InputForm = lazy(() => import('./components/InputForm').then(module => ({ default: module.InputForm })));
const ScheduleView = lazy(() => import('./components/ScheduleView').then(module => ({ default: module.ScheduleView })));

import { optimizePTO } from './utils/ptoOptimizer';
import { downloadPlanPdf } from './utils/exportPlanPdf';
import { Calendar, Download, RotateCcw, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';

const SAVED_PLAN_KEY = 'calibreli:current-plan';

const serializeParams = params => ({
  ...params,
  startDate: params.startDate.toISOString(),
  endDate: params.endDate.toISOString(),
  holidays: params.holidays.map(date => date.toISOString()),
});

const reviveParams = params => ({
  ...params,
  startDate: new Date(params.startDate),
  endDate: new Date(params.endDate),
  // Fold the old two-list shape into the single holiday input on restore.
  holidays: [...(params.holidays ?? []), ...(params.companyOffDays ?? [])].map(date => new Date(date)),
});

const readSavedPlan = () => {
  try {
    const savedParams = JSON.parse(localStorage.getItem(SAVED_PLAN_KEY) || 'null');
    return savedParams ? reviveParams(savedParams) : null;
  } catch {
    return null;
  }
};

function App() {
  const [savedPlan] = useState(readSavedPlan);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    const keyboard = () => { document.documentElement.dataset.input = 'keyboard'; };
    const pointer = () => { document.documentElement.dataset.input = 'pointer'; };
    document.addEventListener('keydown', keyboard, true);
    document.addEventListener('pointerdown', pointer, true);
    return () => {
      document.removeEventListener('keydown', keyboard, true);
      document.removeEventListener('pointerdown', pointer, true);
    };
  }, []);
  const [recommendations, setRecommendations] = useState(() => savedPlan ? optimizePTO(savedPlan) : null);
  const [isLoading, setIsLoading] = useState(false);
  const [optimizationParams, setOptimizationParams] = useState(savedPlan);
  const [error, setError] = useState(null);
  const [formInitialValues, setFormInitialValues] = useState(savedPlan);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (optimizationParams) localStorage.setItem(SAVED_PLAN_KEY, JSON.stringify(serializeParams(optimizationParams)));
    else localStorage.removeItem(SAVED_PLAN_KEY);
  }, [optimizationParams]);

  const handleOptimization = (params) => {
    setIsLoading(true);
    setError(null);
    setOptimizationParams(params);
    try {
      const plan = optimizePTO(params);
      setRecommendations(plan);
    } catch (error) {
      setError(error.message || 'Could not create a plan. Please check your dates.');
    } finally {
      setIsLoading(false);
    }
  };
  const totalPTOUsed = recommendations?.reduce((sum, rec) => sum + rec.ptoDaysUsed, 0) || 0;
  const resetPlanner = () => {
    setRecommendations(null);
    setOptimizationParams(null);
    setError(null);
    setFormInitialValues(null);
    setFormKey(key => key + 1);
  };

  return (

    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar aria-hidden="true" className="h-5 w-5 text-primary" />
            <span className="font-semibold tracking-tight">Calibreli</span>
            <span className="h-4 border-l mx-1" aria-hidden="true" />
            <span className="text-sm text-muted-foreground">Vacation planner</span>
          </div>
          <button type="button" onClick={() => {
            document.documentElement.classList.toggle('dark', !dark);
            setDark(!dark);
          }} className="press-feedback flex h-9 w-9 items-center justify-center rounded-md"
            aria-label={dark ? 'Use light theme' : 'Use dark theme'} aria-pressed={dark}>
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 sm:px-8 py-8 sm:py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Maximize your holidays</h1>
          <p className="text-sm text-muted-foreground mt-2">Plan your time off</p>
        </div>
        <div className="planner-layout">
          <Suspense fallback={<div role="status"><Spinner />Loading planner…</div>}>
            <InputForm key={formKey} initialValues={formInitialValues} onSubmit={handleOptimization} isLoading={isLoading} />
          </Suspense>
          <section className="plan-output min-w-0" aria-label="Your plan" aria-live="polite" aria-busy={isLoading}>
            <div className="flex items-center justify-between pb-5 border-b">
              <h2 className="font-semibold">Your plan</h2>
              <div className="flex items-center gap-2">
                {recommendations && <Button type="button" variant="outline" size="sm" onClick={() => downloadPlanPdf({
                  params: optimizationParams,
                  recommendations,
                  totalPTOUsed,
                })}>
                  <Download className="mr-1.5 h-3.5 w-3.5" /> Export PDF
                </Button>}
                <Button type="button" variant="ghost" size="sm" onClick={resetPlanner}>
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset
                </Button>
              </div>
            </div>
            {error && <p role="alert" className="py-4 text-sm text-destructive">{error}</p>}
            {isLoading ? <div className="py-12" role="status"><Spinner /><p>Finding breaks…</p></div>
              : recommendations ? (
                <Suspense fallback={<Spinner />}><ScheduleView recommendations={recommendations}
                  totalPTOUsed={totalPTOUsed} availablePTO={optimizationParams?.ptoDays || 0} />
                </Suspense>
              ) : (
                <div className="empty-plan">
                  <div className="example-week" aria-label="Example: take Friday and Monday off to make a four-day break">
                    {['Fri', 'Sat', 'Sun', 'Mon'].map((day, index) => (
                      <div key={day} className={index === 0 || index === 3 ? 'example-day example-leave' : 'example-day'}>
                        <span>{day}</span><span>{index === 0 || index === 3 ? 'PTO' : 'Off'}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">Example · 2 vacation days → 4 days away</p>
                  <h3 className="font-medium mt-9">Start with your available days.</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-2 max-w-xs mx-auto">Set a planning period, then add any holidays you already have off. Your suggested dates will appear here.</p>
                </div>
              )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
