import React, { useEffect, useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { aiService } from '../services/aiService';
import { Cpu, CheckCircle2, RefreshCw, Terminal } from 'lucide-react';

export const OperationsConsole: React.FC = () => {
  const { 
    activeScenario, 
    simulationStep, 
    telemetry, 
    isIntervened, 
    approveIntervention,
    approvalLogs,
    isApproving
  } = useAppState();

  const [briefing, setBriefing] = useState<string>("Initializing secure channel...");
  const [mitigation, setMitigation] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Trigger analysis sequence when scenario or simulation step advances
  useEffect(() => {
    if (!telemetry) return;
    
    setIsAnalyzing(true);
    setBriefing("Ingesting telemetry frame...");
    
    const delayTimer = setTimeout(async () => {
      try {
        const brief = await aiService.getSituationBriefing(activeScenario, telemetry);
        const protocol = await aiService.getMitigationProtocol(activeScenario, telemetry);
        
        setBriefing(brief);
        setMitigation(protocol);
      } catch (err) {
        console.error("Operations Console briefing update failed", err);
      } finally {
        setIsAnalyzing(false);
      }
    }, 800); // 800ms analysis simulation for authentic command center feel

    return () => clearTimeout(delayTimer);
  }, [activeScenario, simulationStep, isIntervened]);

  return (
    <div className="w-full h-full glass-panel rounded-2xl flex flex-col p-5 overflow-hidden font-sans">
      
      {/* HUD Bar */}
      <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <span className="font-mono text-xs uppercase tracking-widest text-white/70">DECISION INTELLIGENCE // ADVISORY CORE</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-white/40">
          <span className={`w-1.5 h-1.5 rounded-full ${isAnalyzing ? 'bg-amber-400 animate-spin' : 'bg-green-400'}`} />
          {isAnalyzing ? 'ANALYSING' : 'ONLINE'}
        </div>
      </div>

      {/* Terminal Briefing Window */}
      <div className="relative flex-1 flex flex-col justify-between overflow-y-auto mb-4 min-h-[140px] p-4 rounded-xl bg-black/40 border border-white/5 font-mono text-xs leading-relaxed">
        {isAnalyzing ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-white/30 animate-pulse">
            <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
            <span>[ANALYSING LIVE TELEMETRY STREAM...]</span>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between">
            <div className="text-left text-white/80 whitespace-pre-wrap">
              <span className="text-indigo-400 font-bold block mb-1">$&gt; SYSTEM_OPERATIONS_BRIEF</span>
              {briefing}
            </div>

            <div className="border-t border-white/5 mt-4 pt-3 flex justify-between items-center text-[10px] text-white/30">
              <span>SOURCE: DECISION_INTELLIGENCE_REASONER</span>
              <span>EST_CONFIDENCE: {mitigation?.confidence || 95}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Mitigation Recommendation Panel */}
      <div className="z-10 text-left">
        {isApproving || isIntervened ? (
          /* SEQUENTIAL LOGS ANIMATION / RESOLVED STATE */
          <div className="p-4 rounded-xl border border-green-500/20 bg-green-950/5 min-h-[160px] flex flex-col justify-between font-mono text-xs">
            <div className="space-y-1.5">
              {approvalLogs.map((log, index) => (
                <div key={index} className="flex items-center gap-2 text-green-400 animate-pulse">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  <span>{log}</span>
                </div>
              ))}
            </div>

            {!isApproving && isIntervened && (
              <div className="mt-4 pt-3 border-t border-green-500/20 flex items-center gap-2 text-green-400">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-semibold uppercase tracking-wider text-[10px]">MITIGATION ACTIVE // SYSTEM STATUS: RECOVERING</span>
              </div>
            )}
          </div>
        ) : (
          /* ACTIVE RECOMMENDATION DETAILS */
          <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-950/5 min-h-[160px] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-sm font-semibold text-white tracking-wide">{mitigation?.title || "Evaluating Protocols..."}</h4>
                <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-mono text-indigo-400 font-bold">
                  CONFIDENCE: {mitigation?.confidence || 95}%
                </span>
              </div>
              <p className="text-white/60 text-xs font-light leading-relaxed mb-3">
                {mitigation?.description}
              </p>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-white/5 pt-3">
                <div>
                  <span className="text-white/30 block uppercase">Expected Impact</span>
                  <span className="text-green-400">{mitigation?.expectedImpact}</span>
                </div>
                <div>
                  <span className="text-white/30 block uppercase">Alternative Path</span>
                  <span className="text-white/50">{mitigation?.alternative}</span>
                </div>
              </div>
            </div>

            <button
              onClick={approveIntervention}
              disabled={isAnalyzing}
              className={`w-full mt-4 py-3 rounded-lg font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-indigo-500/10 transition-all ${
                isAnalyzing 
                  ? 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
                  : 'bg-white text-black hover:bg-white/90'
              }`}
            >
              <Cpu className="w-4 h-4" />
              APPROVE RECOMMENDATION
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
