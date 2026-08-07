import React, { useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { Clock, CheckSquare, XCircle, Scale, ChevronDown, ChevronUp } from 'lucide-react';


export const DecisionReplay: React.FC = () => {
  const { replayHistory } = useAppState();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="w-full glass-panel rounded-2xl flex flex-col p-5 overflow-hidden font-sans">
      
      {/* HUD Ticker */}
      <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span className="font-mono text-xs uppercase tracking-widest text-white/70">DECISION REPLAY // INCIDENT JOURNAL</span>
        </div>
        <span className="font-mono text-[9px] text-white/30 uppercase">
          {replayHistory.length} ENTRIES LOGGED
        </span>
      </div>

      {/* History Timeline */}
      <div className="flex-1 overflow-y-auto max-h-[460px] pr-1 space-y-4">
        {replayHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-white/5 rounded-xl text-white/20 font-mono text-xs">
            <Scale className="w-8 h-8 mb-3 text-white/10" />
            <span>[SYSTEM STANDBY: NO DIRECTIVES ISSUED]</span>
            <span className="text-[10px] mt-1 opacity-50">Trigger a scenario incident to generate entries.</span>
          </div>
        ) : (
          replayHistory.map((item) => {
            const isExpanded = expandedId === item.id;

            return (
              <div 
                key={item.id} 
                className={`rounded-xl border transition-all duration-300 ${
                  isExpanded 
                    ? 'border-indigo-500/30 bg-indigo-950/5' 
                    : 'border-white/5 bg-white/2 hover:border-white/10'
                }`}
              >
                {/* Header Collapsible Toggle */}
                <div 
                  onClick={() => toggleExpand(item.id)}
                  className="flex justify-between items-center p-4 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-indigo-400">{item.id}</span>
                    <span className="text-white/20 font-mono text-xs">|</span>
                    <div className="text-left">
                      <span className="font-mono text-[10px] uppercase text-white/30 block tracking-wider">
                        {item.timestamp} // {item.scenario.replace('-', ' ').toUpperCase()}
                      </span>
                      <span className="text-xs font-semibold text-white tracking-wide">
                        {item.recommendationTitle}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-green-400 font-bold hidden sm:inline">
                      IMPACT: {item.expectedImpact.split(',')[0]}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-white/40" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-white/40" />
                    )}
                  </div>
                </div>

                {/* Expanded Comparison Sandbox */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-white/5 pt-4 text-left">
                    <p className="text-xs text-white/60 font-light leading-relaxed mb-4">
                      <span className="font-semibold text-white block mb-1">Approved Protocol:</span>
                      {item.recommendationDesc}
                    </p>

                    {/* Side-by-side sandbox comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-2">
                      
                      {/* Intervened State */}
                      <div className="p-3.5 rounded-xl bg-green-500/5 border border-green-500/20 glow-green">
                        <div className="flex justify-between items-center border-b border-green-500/10 pb-2 mb-3">
                          <span className="text-[10px] font-mono font-bold text-green-400 uppercase tracking-widest flex items-center gap-1.5">
                            <CheckSquare className="w-3.5 h-3.5" />
                            Actual Intervention
                          </span>
                          <span className="text-[9px] font-mono text-green-500/60">APPROVED STATUS</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div className="p-2 rounded bg-black/30 border border-green-500/10">
                            <span className="text-[9px] font-mono text-white/30 block uppercase">Operational Health</span>
                            <span className="text-xl font-bold text-green-400">{item.actualHealth}%</span>
                            <span className="text-[9px] font-mono text-green-500/70 block">STABLE</span>
                          </div>
                          <div className="p-2 rounded bg-black/30 border border-green-500/10">
                            <span className="text-[9px] font-mono text-white/30 block uppercase">Risk Factor</span>
                            <span className="text-xl font-bold text-green-400">{Math.round(item.actualRisk * 100)}%</span>
                            <span className="text-[9px] font-mono text-green-500/70 block">MINIMIZED</span>
                          </div>
                        </div>
                      </div>

                      {/* Counterfactual (No Intervention) */}
                      <div className="p-3.5 rounded-xl bg-red-500/5 border border-red-500/20 glow-red">
                        <div className="flex justify-between items-center border-b border-red-500/10 pb-2 mb-3">
                          <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                            <XCircle className="w-3.5 h-3.5" />
                            No Intervention
                          </span>
                          <span className="text-[9px] font-mono text-red-500/60">COUNTERFACTUAL</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div className="p-2 rounded bg-black/30 border border-red-500/10 animate-pulse">
                            <span className="text-[9px] font-mono text-white/30 block uppercase">Operational Health</span>
                            <span className="text-xl font-bold text-red-400">{item.counterfactualHealth}%</span>
                            <span className="text-[9px] font-mono text-red-500/70 block">CRITICAL SPIKE</span>
                          </div>
                          <div className="p-2 rounded bg-black/30 border border-red-500/10 animate-pulse">
                            <span className="text-[9px] font-mono text-white/30 block uppercase">Risk Factor</span>
                            <span className="text-xl font-bold text-red-400">{Math.round(item.counterfactualRisk * 100)}%</span>
                            <span className="text-[9px] font-mono text-red-500/70 block">STAMPEDE RISK</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
