import React, { useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import type { LiveEvent } from '../context/AppStateContext';
import { Clock, AlertTriangle, Zap, CheckCircle, ArrowDown, Activity } from 'lucide-react';
import { TraceEventModal } from './common/TraceEventModal';

export const DecisionReplay: React.FC = () => {
  const { liveEventsLog } = useAppState();
  const [selectedTraceEvent, setSelectedTraceEvent] = useState<LiveEvent | null>(null);

  const getIconData = (type: string) => {
    switch(type) {
      case 'critical': return { icon: AlertTriangle, color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/20', border: 'border-[#EF4444]/40' };
      case 'warning': return { icon: Zap, color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/20', border: 'border-[#F59E0B]/40' };
      case 'success': return { icon: CheckCircle, color: 'text-[#10B981]', bg: 'bg-[#10B981]/20', border: 'border-[#10B981]/40' };
      default: return { icon: Clock, color: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/20', border: 'border-[#3B82F6]/40' };
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto h-full flex flex-col p-6 overflow-hidden font-sans">
      
      <TraceEventModal event={selectedTraceEvent} onClose={() => setSelectedTraceEvent(null)} />
      
      <div className="flex items-center gap-3 mb-8 border-b border-[#27272a] pb-4">
        <Clock className="w-6 h-6 text-[#3B82F6]" />
        <div>
          <h2 className="text-xl font-bold text-slate-200">Live Operations Ledger</h2>
          <p className="text-sm text-slate-400">Chronological lifecycle of events</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-4 pb-12 flex flex-col items-center">
        {liveEventsLog.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Clock className="w-12 h-12 mb-4 text-[#3f3f46]" />
            <span className="font-bold text-slate-400 text-lg">Awaiting events...</span>
            <span className="text-sm mt-2 text-slate-500">The simulation engine is starting up.</span>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full max-w-lg">
            {liveEventsLog.map((step, idx) => {
              const { icon: Icon, color, bg, border } = getIconData(step.type);
              return (
                <React.Fragment key={step.id}>
                  
                  {/* Timeline Node */}
                  <div className="flex items-center gap-6 w-full group">
                    <div className="w-16 text-right font-mono text-sm font-bold text-slate-400 group-hover:text-slate-200 transition-colors">
                      {step.time}
                    </div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${bg} ${border} shadow-lg z-10 shrink-0`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div className="flex-1 bg-[#09090b] border border-[#27272a] p-4 rounded-lg group-hover:border-slate-700 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-slate-200 text-sm mb-1">{step.source}</div>
                          <div className="text-xs text-slate-400">{step.message}</div>
                        </div>
                        <button 
                          onClick={() => setSelectedTraceEvent(step)}
                          className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-3 py-1.5 rounded flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-colors"
                        >
                          <Activity className="w-3 h-3" />
                          Trace Event
                        </button>
                      </div>
                      {step.affectedModules && (
                         <div className="mt-3 flex gap-2 flex-wrap">
                           {step.affectedModules.map((mod, i) => (
                             <span key={i} className="text-[9px] text-slate-500 font-mono bg-[#27272a] px-1.5 py-0.5 rounded border border-[#374151]">
                               {mod}
                             </span>
                           ))}
                         </div>
                      )}
                    </div>
                  </div>

                  {/* Connector Line */}
                  {idx < liveEventsLog.length - 1 && (
                    <div className="w-full flex items-center gap-6 py-2">
                      <div className="w-16 shrink-0" />
                      <div className="w-12 flex justify-center shrink-0">
                        <ArrowDown className="w-4 h-4 text-[#3f3f46]" />
                      </div>
                      <div className="flex-1" />
                    </div>
                  )}

                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
