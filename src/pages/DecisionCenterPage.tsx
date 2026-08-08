import React, { useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { Zap, Users, CheckCircle, XCircle, AlertTriangle, ArrowRight, ShieldCheck, Brain, HelpCircle } from 'lucide-react';
import { WhyThisDecisionModal } from '../components/common/WhyThisDecisionModal';

export const DecisionCenterPage: React.FC = () => {
  const { approveIntervention, isIntervened, isApproving, telemetry } = useAppState();

  if (!telemetry) return null;

  const [dispatchStates, setDispatchStates] = useState<Record<string, boolean>>({});
  const [showExplainModal, setShowExplainModal] = useState<boolean>(false);

  const handleDispatch = (id: string) => {
    setDispatchStates(prev => ({ ...prev, [id]: true }));
  };

  const officers = [
    { id: 'rahul', name: 'Officer Rahul', role: 'Crowd Control', location: 'Platform 3', eta: '90 sec', idle: !dispatchStates['rahul'] },
    { id: 'priya', name: 'Officer Priya', role: 'Medical Ops', location: 'Concourse A', eta: '2 min', idle: !dispatchStates['priya'] },
    { id: 'amit', name: 'Sgt Amit', role: 'Tactical', location: 'Gate B', eta: '1 min', idle: !dispatchStates['amit'] },
    { id: 'sneha', name: 'Officer Sneha', role: 'Evacuation', location: 'Exit C', eta: '45 sec', idle: !dispatchStates['sneha'] },
  ];

  return (
    <div className="w-full h-full p-6 flex gap-6 overflow-hidden max-w-7xl mx-auto">
      
      {/* Left Column: Incidents & Resources */}
      <div className="w-1/3 flex flex-col gap-6 overflow-y-auto pr-2">
        
        {/* Real Incidents */}
        <div className="glass-panel p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
            Active Incidents
          </h2>
          <div className="flex flex-col gap-4">
            
            <div className="flex flex-col gap-2 border-b border-[#27272a] pb-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#EF4444]">High Priority</span>
                <span className="text-[10px] font-mono text-slate-400">Predicted • 6 min</span>
              </div>
              <div className="font-bold text-slate-200 text-sm">Platform 3 Congestion</div>
            </div>

            <div className="flex flex-col gap-2 border-b border-[#27272a] pb-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#F59E0B]">Medium Priority</span>
                <span className="text-[10px] font-mono text-slate-400">Active</span>
              </div>
              <div className="font-bold text-slate-200 text-sm">Escalator B Failure</div>
            </div>

            <div className="flex flex-col gap-2 border-b border-[#27272a] pb-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#3B82F6]">Low Priority</span>
                <span className="text-[10px] font-mono text-slate-400">Advisory</span>
              </div>
              <div className="font-bold text-slate-200 text-sm">Weather Advisory: Heavy Rain</div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#10B981]">Resolved</span>
                <span className="text-[10px] font-mono text-slate-400">08:10</span>
              </div>
              <div className="font-bold text-slate-500 text-sm line-through">Medical Response Team 2</div>
            </div>

          </div>
        </div>

        {/* Resources Dispatch */}
        <div className="glass-panel p-6 flex-1">
          <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#3B82F6]" />
            Field Units
          </h2>
          <div className="flex flex-col gap-4">
            {officers.map(officer => (
              <div key={officer.id} className="flex items-center justify-between p-3 rounded-lg border border-[#27272a] bg-[#09090b]">
                <div className="flex flex-col">
                  <div className="font-bold text-slate-200 text-sm">{officer.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{officer.role} • {officer.location}</div>
                </div>
                <div className="flex items-center gap-3">
                  {officer.idle ? (
                    <>
                      <span className="text-[10px] uppercase font-bold text-[#10B981] tracking-wider">Idle</span>
                      <button 
                        onClick={() => handleDispatch(officer.id)}
                        className="px-3 py-1 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-bold rounded transition-colors"
                      >
                        Dispatch
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] uppercase font-bold text-[#F59E0B] tracking-wider animate-pulse">En Route</span>
                      <span className="text-[10px] font-mono text-slate-400">{officer.eta}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Right Column: Massive Recommendation UI */}
      <div className="w-2/3 glass-panel p-8 flex flex-col relative overflow-hidden">
        {/* Glow effect behind the recommendation */}
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-[#3B82F6]/10 to-transparent pointer-events-none" />
        
        <h2 className="text-xl font-bold text-slate-200 mb-8 flex items-center gap-2">
          <Zap className="w-6 h-6 text-[#F59E0B]" />
          Decision Intelligence
        </h2>

        {false ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <ShieldCheck className="w-24 h-24 text-[#10B981] mb-6 opacity-80" />
            <h3 className="text-2xl font-bold text-white mb-2">No Actions Required</h3>
            <p className="text-slate-400 max-w-md">The Context Fusion Engine detects nominal operations across all sectors. Prediction Engine forecasts stable state for the next 45 minutes.</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between z-10">
            
            {/* The Recommendation */}
            <div className="flex flex-col gap-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-bold uppercase tracking-widest text-[#3B82F6] mb-2">Primary Recommendation</div>
                  <h1 className="text-4xl font-extrabold text-white tracking-tight">Open Exit C & Dispatch Crowd Control</h1>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-sm font-bold uppercase tracking-widest text-[#10B981] mb-2">Confidence</div>
                  <div className="text-5xl font-extrabold text-[#10B981]">94%</div>
                </div>
              </div>

              {/* AI Explainability Panel (WHY THIS DECISION?) */}
              <div className="grid grid-cols-2 gap-8 mt-4">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-[#8B5CF6]" />
                      <h3 className="text-xs font-bold uppercase tracking-widest text-[#8B5CF6]">Why This Decision?</h3>
                    </div>

                    <button
                      onClick={() => setShowExplainModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1 bg-[#8B5CF6]/20 hover:bg-[#8B5CF6]/30 text-[#8B5CF6] border border-[#8B5CF6]/40 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      INSPECT PIPELINE
                    </button>
                  </div>
                  
                  <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-4 flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AI Reasoning Chain</span>
                      <ul className="text-sm text-slate-300 space-y-2 list-disc list-inside marker:text-indigo-500">
                        <li>CCTV (YOLOv11) detected {Math.floor(telemetry.crowd.totalInside * 0.08)} pax on Platform 3</li>
                        <li>Escalator B Failure (IoT Model) reduced capacity</li>
                        <li>Train Delay (+{telemetry.transport.metroIntervalMin}m) increases accumulation rate</li>
                        <li>Fusion Engine predicts critical bottleneck in 4 mins</li>
                      </ul>
                    </div>
                    
                    <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-[#27272a]">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Models Triggered</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-[10px] font-bold px-2 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded">YOLOv11 Person Detection</span>
                        <span className="text-[10px] font-bold px-2 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded">IoT Predictive Maintenance</span>
                        <span className="text-[10px] font-bold px-2 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded">Context Fusion Engine</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Expected Impact</h3>
                  
                  <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-4 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-300">Platform Density</span>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-[#EF4444]">{Math.round(telemetry.crowd.standsDensity * 100)}%</span>
                        <ArrowRight className="w-4 h-4 text-slate-500" />
                        <span className="text-lg font-bold text-[#10B981]">{Math.max(0, Math.round(telemetry.crowd.standsDensity * 100) - 17)}%</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-300">Evacuation Risk</span>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-[#F59E0B]">Critical</span>
                        <ArrowRight className="w-4 h-4 text-slate-500" />
                        <span className="text-lg font-bold text-[#10B981]">Nominal</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Alternatives & Approval */}
            <div className="flex flex-col gap-6 mt-12">
              <div className="flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Alternatives Assessed</h3>
                <div className="flex items-center justify-between bg-[#09090b] border border-[#27272a] p-4 rounded-lg opacity-60">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-[#EF4444]" />
                    <span className="font-bold text-slate-300">Close Gate B</span>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#EF4444]">Rejected (Causes external cascading crush risk)</span>
                </div>
              </div>

              {/* Action Bar */}
              <div className="mt-8 flex items-center justify-between p-6 bg-[#18181b] border border-[#27272a] rounded-xl shadow-2xl">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white">Execute Operational Plan</span>
                  <span className="text-xs text-slate-400">Requires Commander Auth</span>
                </div>
                
                {isIntervened ? (
                  <div className="flex items-center gap-3 px-6 py-3 bg-[#10B981]/20 border border-[#10B981]/40 rounded-lg text-[#10B981]">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-bold">Plan Executed</span>
                  </div>
                ) : (
                  <button
                    onClick={approveIntervention}
                    disabled={isApproving}
                    className={`px-8 py-4 font-bold rounded-lg transition-all flex items-center gap-3 shadow-lg ${
                      isApproving 
                        ? 'bg-[#3B82F6]/50 text-white cursor-not-allowed animate-pulse' 
                        : 'bg-[#3B82F6] hover:bg-[#2563EB] text-white hover:scale-105'
                    }`}
                  >
                    <Zap className="w-5 h-5" />
                    {isApproving ? 'Authorizing & Dispatching...' : 'Approve & Execute Plan'}
                  </button>
                )}
              </div>
            </div>

          </div>
        )}
      </div>

      <WhyThisDecisionModal
        isOpen={showExplainModal}
        onClose={() => setShowExplainModal(false)}
        recommendationTitle="Open Exit C & Dispatch Crowd Control"
        confidence={94}
        videoSrc="/Crowd-at-Ameerpet-Metro-Station.mp4"
      />
    </div>
  );
};
