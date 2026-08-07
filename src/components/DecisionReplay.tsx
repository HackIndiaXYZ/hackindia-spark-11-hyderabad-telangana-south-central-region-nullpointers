import React from 'react';
import { useAppState } from '../context/AppStateContext';
import { Clock, ShieldCheck, AlertTriangle, Zap, CheckCircle, ArrowDown } from 'lucide-react';

export const DecisionReplay: React.FC = () => {
  const { replayHistory, activeScenario } = useAppState();

  const mockTimeline = [
    { time: '08:45', title: 'Train delayed', desc: 'Metro transit logs indicate 6 min delay.', icon: AlertTriangle, color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/20', border: 'border-[#F59E0B]/40' },
    { time: '08:46', title: 'Platform reaches 82%', desc: 'Context Fusion Engine detects density spike.', icon: Clock, color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/20', border: 'border-[#EF4444]/40' },
    { time: '08:47', title: 'AI predicts congestion', desc: 'Prediction engine forecasts stampede risk.', icon: Zap, color: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/20', border: 'border-[#3B82F6]/40' },
    { time: '08:48', title: 'Recommendation generated', desc: 'Confidence 94% to open Exit C.', icon: ShieldCheck, color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/20', border: 'border-[#8B5CF6]/40' },
    { time: '08:49', title: 'Operator approved', desc: 'Action executed by Commander.', icon: CheckCircle, color: 'text-[#10B981]', bg: 'bg-[#10B981]/20', border: 'border-[#10B981]/40' },
    { time: '08:51', title: 'Exit C opened', desc: 'Turnstile logs show outflow increased.', icon: CheckCircle, color: 'text-[#10B981]', bg: 'bg-[#10B981]/20', border: 'border-[#10B981]/40' },
    { time: '08:54', title: 'Occupancy reduced', desc: 'Platform density down to 74%.', icon: CheckCircle, color: 'text-[#10B981]', bg: 'bg-[#10B981]/20', border: 'border-[#10B981]/40' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto h-full flex flex-col p-6 overflow-hidden font-sans">
      
      <div className="flex items-center gap-3 mb-8 border-b border-[#1F2937] pb-4">
        <Clock className="w-6 h-6 text-[#3B82F6]" />
        <div>
          <h2 className="text-xl font-bold text-slate-200">Incident Replay: Platform 2 Congestion</h2>
          <p className="text-sm text-slate-400">Chronological lifecycle of a mitigated event</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-4 pb-12 flex flex-col items-center">
        {replayHistory.length === 0 && activeScenario === 'normal' ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Clock className="w-12 h-12 mb-4 text-[#1F2937]" />
            <span className="font-bold text-slate-400 text-lg">No decisions recorded yet</span>
            <span className="text-sm mt-2 text-slate-500">Run a scenario and execute a decision to view its lifecycle.</span>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full max-w-lg">
            {mockTimeline.map((step, idx) => {
              const Icon = step.icon;
              return (
                <React.Fragment key={idx}>
                  
                  {/* Timeline Node */}
                  <div className="flex items-center gap-6 w-full group">
                    <div className="w-16 text-right font-mono text-sm font-bold text-slate-400 group-hover:text-slate-200 transition-colors">
                      {step.time}
                    </div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${step.bg} ${step.border} shadow-lg z-10`}>
                      <Icon className={`w-5 h-5 ${step.color}`} />
                    </div>
                    <div className="flex-1 bg-[#0F172A] border border-[#1F2937] p-4 rounded-lg group-hover:border-slate-700 transition-colors">
                      <div className="font-bold text-slate-200 text-sm mb-1">{step.title}</div>
                      <div className="text-xs text-slate-400">{step.desc}</div>
                    </div>
                  </div>

                  {/* Connector Line */}
                  {idx < mockTimeline.length - 1 && (
                    <div className="w-full flex items-center gap-6 py-2">
                      <div className="w-16" />
                      <div className="w-12 flex justify-center">
                        <ArrowDown className="w-4 h-4 text-[#1F2937]" />
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
