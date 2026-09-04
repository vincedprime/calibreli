import React from 'react';
import { format } from 'date-fns';

export function ScheduleView({ recommendations, totalPTOUsed, availablePTO }) {
  if (!recommendations?.length) {
    return <div className="py-12 text-sm leading-relaxed text-muted-foreground">
      No breaks fit this period. Try a longer date range or a different break preference.
    </div>;
  }

  const totalDaysOff = recommendations.reduce((sum, rec) => sum + rec.totalDays, 0);
  return (
    <div>
      <dl className="grid grid-cols-3 gap-4 py-6 border-b tabular-nums">
        {[[totalDaysOff, 'days away'], [totalPTOUsed, 'PTO days used'], [availablePTO - totalPTOUsed, 'days remaining']].map(([value, label]) => (
          <div key={label}><dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="text-3xl tracking-tight font-semibold mt-1">{value}</dd></div>
        ))}
      </dl>
      <ol className="divide-y">
        {recommendations.map(rec => {
          const freeDays = [
            rec.weekendDays > 0 && `${rec.weekendDays} regular day${rec.weekendDays === 1 ? '' : 's'} off`,
            rec.holidayDays > 0 && `${rec.holidayDays} holiday${rec.holidayDays === 1 ? '' : 's'}`,
          ].filter(Boolean).join(' + ');
          return (
          <li key={rec.startDate.toISOString()} className="py-5 flex gap-4 sm:gap-5">
            <div className="date-stamp shrink-0" aria-hidden="true">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{format(rec.startDate, 'MMM')}</span>
              <span className="text-xl tabular-nums font-medium">{format(rec.startDate, 'd')}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap justify-between gap-x-3 gap-y-1">
                <h3 className="text-sm font-semibold">{rec.dateRange}</h3>
                <span className="text-sm tabular-nums">{rec.totalDays} days away</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">{rec.type} · {rec.ptoDaysUsed} PTO day{rec.ptoDaysUsed === 1 ? '' : 's'}</p>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{freeDays}</p>
            </div>
          </li>
          );
        })}
      </ol>
    </div>
  );
}
