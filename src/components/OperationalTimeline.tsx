import React from 'react';
import { useAppState } from '../context/AppStateContext';

export const OperationalTimeline: React.FC = () => {
  const { liveEventsLog } = useAppState();
  const timeline = liveEventsLog;

  return (
    <div className="glass-panel w-full flex flex-col p-5 h-full overflow-y-auto">
      <div className="flex justify-between items-center border-b border-[#27272a] pb-3 mb-4">
        <span className="font-semibold text-sm tracking-wide text-slate-200">Live Operational Timeline</span>
      </div>
      <div className="flex flex-col gap-0">
        {timeline.map((log: any, idx: number) => (
          <div key={idx} className="flex flex-col">
            <div className="flex items-start gap-4">
              <span className="text-[#9CA3AF] text-xs font-mono font-medium whitespace-nowrap mt-0.5">{log.time}</span>
              <span className="text-slate-300 text-sm leading-snug">
                <span className={`mr-2 font-bold ${log.type === 'critical' ? 'text-red-400' : log.type === 'warning' ? 'text-amber-400' : log.type === 'success' ? 'text-emerald-400' : 'text-blue-400'}`}>[{log.source}]</span>
                {log.message}
              </span>
            </div>
            {idx !== timeline.length - 1 && (
              <div className="ml-[42px] my-2 text-[#4B5563] text-xs font-mono">
                ↓
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
