import React from 'react';
import { useAppState } from '../context/AppStateContext';

export const DecisionPanel: React.FC = () => {
  const { activeRecommendation, approveIntervention, isApproving, isIntervened } = useAppState();

  const isActionable = !!activeRecommendation;

  if (!isActionable || !activeRecommendation) {
    return (
      <div className="glass-panel w-full flex flex-col p-5 h-full items-center justify-center text-slate-500">
        <span className="text-sm font-medium">Monitoring Operations...</span>
        <span className="text-xs mt-2">No critical recommendations at this time.</span>
      </div>
    );
  }

  const rec = activeRecommendation;
  // Dynamic confidence adjustment could be pulled from context if desired. For now use base.
  const confidence = rec.confidence || 94;

  return (
    <div className="glass-panel w-full flex flex-col p-5 h-full relative overflow-hidden">
      {/* Accent strip based on intervention status */}
      <div className={`absolute top-0 left-0 w-1 h-full ${isIntervened ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`} />
      
      <div className="pl-2">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-2">Recommendation</h3>
        <p className="text-sm text-slate-300 leading-relaxed mb-4">
          {rec.description}
        </p>

        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Recommended Actions</h4>
        <ul className="flex flex-col gap-2 mb-6">
          {rec.actions?.map((action: string, idx: number) => (
            <li key={idx} className="flex items-center gap-2 text-sm text-slate-300">
              <span className="text-[#10B981] font-bold">✓</span> {action}
            </li>
          ))}
        </ul>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="glass-panel-light p-3 rounded-lg flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Expected Impact</span>
            <div className="text-sm font-bold text-slate-200">
              {rec.expectedImpact}
            </div>
          </div>
          <div className="glass-panel-light p-3 rounded-lg flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Confidence & ETA</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#2563EB]">{confidence}%</span>
              <span className="text-slate-500 text-xs">| 4 min recovery</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-auto">
          <button
            onClick={approveIntervention}
            disabled={isIntervened || isApproving}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
              isIntervened 
                ? 'bg-[#10B981]/20 text-[#10B981] cursor-not-allowed border border-[#10B981]/30'
                : isApproving
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-[#2563EB] text-white hover:bg-[#1d4ed8] border border-transparent'
            }`}
          >
            {isIntervened ? 'Approved & Executing' : isApproving ? 'Authorizing...' : 'Approve Plan'}
          </button>
          {!isIntervened && !isApproving && (
            <button className="px-4 py-2.5 rounded-lg text-sm font-semibold border border-[#27272a] text-slate-400 hover:bg-[#27272a] hover:text-white transition-all">
              Reject
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
