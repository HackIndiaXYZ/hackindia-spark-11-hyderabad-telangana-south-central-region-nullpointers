import React from 'react';

export const PassengerFlowHeatmap: React.FC = () => {
  return (
    <div className="glass-panel p-6 flex flex-col items-center justify-center w-full max-w-sm mx-auto">
      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-6 self-start">Passenger Flow Density</h3>
      
      <div className="flex flex-col items-center gap-1 w-full text-center font-mono">
        <div className="text-sm text-slate-400">Entry</div>
        <div className="text-xs text-slate-600">↓</div>
        
        <div className="text-sm text-slate-400 mt-2">Ticket Gates</div>
        <div className="text-xs text-[#2563EB] tracking-widest font-bold">↓↓↓↓</div>
        
        <div className="text-sm text-slate-400 mt-2">Concourse</div>
        <div className="text-xs text-[#10B981] tracking-widest">██████</div>
        
        <div className="text-xs text-[#10B981]">↓</div>
        
        <div className="text-sm text-slate-400 mt-2">Escalator</div>
        <div className="text-xs text-[#F59E0B] tracking-widest">██████████</div>
        
        <div className="text-xs text-[#F59E0B]">↓</div>
        
        <div className="text-sm text-slate-400 mt-2">Platform</div>
        <div className="text-xs text-[#EF4444] tracking-widest">██████████████</div>
      </div>
    </div>
  );
};
