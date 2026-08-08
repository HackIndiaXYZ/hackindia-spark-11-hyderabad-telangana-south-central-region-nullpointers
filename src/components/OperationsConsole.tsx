import React, { useEffect, useState, useRef } from 'react';
import { useAppState } from '../context/AppStateContext';
import { aiService } from '../services/aiService';
import { LINEAGE_REGISTRY } from '../services/lineageRegistry';
import { CheckCircle2, RefreshCw, Terminal, ChevronDown, ChevronUp, AlertTriangle, HelpCircle } from 'lucide-react';
import { WhyThisDecisionModal } from './common/WhyThisDecisionModal';

export const OperationsConsole: React.FC = () => {
  const { 
    activeScenario, 
    telemetry, 
    isIntervened, 
    approveIntervention,
    approvalLogs,
    isApproving,
    liveEventsLog,
    getConfidenceBreakdown,
    getTrustPenalty,
    setLineageModalData
  } = useAppState();

  const [briefing, setBriefing] = useState<string>("Initializing secure channel...");
  const [mitigation, setMitigation] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [showWhy, setShowWhy] = useState<boolean>(false);
  const [showExplainModal, setShowExplainModal] = useState<boolean>(false);

  const timelineEndRef = useRef<HTMLDivElement | null>(null);

  // Trigger analysis sequence when scenario or step changes
  useEffect(() => {
    if (!telemetry) return;
    
    setIsAnalyzing(true);
    setBriefing("Ingesting telemetry frame...");
    setShowWhy(false); // ResetWhy drawer on scenario shift
    
    const delayTimer = setTimeout(async () => {
      try {
        const brief = await aiService.getSituationBriefing(activeScenario, telemetry);
        const protocol = await aiService.getMitigationProtocol(activeScenario, telemetry);
        
        setBriefing(brief);
        setMitigation(protocol);
      } catch (err) {
        console.error("Operations Console briefings update failed", err);
      } finally {
        setIsAnalyzing(false);
      }
    }, 800);

    return () => clearTimeout(delayTimer);
  }, [activeScenario, telemetry, isIntervened]);

  // Scroll Ingestion timeline to bottom automatically
  useEffect(() => {
    if (timelineEndRef.current) {
      timelineEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [liveEventsLog, activeScenario]);

  if (!telemetry) return null;

  const timelineLogs = liveEventsLog;
  const confidenceBreakdown = getConfidenceBreakdown();
  const trustPenalty = getTrustPenalty();

  // Calculate adjusted confidence rating
  const baseConfidence = mitigation?.confidence || 95;
  const adjustedConfidence = trustPenalty ? Math.max(50, baseConfidence - trustPenalty.penalty) : baseConfidence;

  // Active triggers for the Reasoning Graph
  const getGraphTriggers = () => {
    switch (activeScenario) {
      case 'heavy-rain':
        return [
          { label: 'Weather API', val: 'Heavy Rain (18mm/h)', status: 'warning', registryKey: 'weather', typeBadge: 'LIVE', timeInfo: 'Live // 18s ago' },
          { label: 'Crowd Density', val: 'Gate B Occupancy 96%', status: 'critical', registryKey: 'stands-density', typeBadge: 'SIMULATED', timeInfo: 'Simulated // 2s ago' },
          { label: 'Road Traffic', val: 'Plaza Delay +8m', status: 'warning', registryKey: 'traffic', typeBadge: 'LIVE', timeInfo: 'Live // 2.5m ago' }
        ];
      case 'metro-delay':
        return [
          { label: 'Metro ATS Ingest', val: 'Signaling Delay', status: 'critical', registryKey: 'metro-status', typeBadge: 'LIVE', timeInfo: 'Delayed // 6m ago' },
          { label: 'Citizen Reports', val: 'Commuter Backup', status: 'warning', registryKey: 'citizen', typeBadge: 'LIVE', timeInfo: 'Live // 12s ago' }
        ];
      case 'medical-emergency':
        return [
          { label: 'Medical Ingest', val: 'Cardiac alert active', status: 'critical', registryKey: 'medical-response', typeBadge: 'DERIVED', timeInfo: 'Derived // 5s ago' },
          { label: 'Stands Density', val: 'Stands Occupancy 92%', status: 'critical', registryKey: 'stands-density', typeBadge: 'SIMULATED', timeInfo: 'Simulated // 3s ago' }
        ];
      case 'gate-failure':
        return [
          { label: 'Turnstile Counter', val: 'Gate D Reader Offline', status: 'critical', registryKey: 'gate-occupancy', typeBadge: 'SIMULATED', timeInfo: 'Offline // 4m ago' },
          { label: 'Crowd Density', val: 'Gate D Plaza 8k count', status: 'critical', registryKey: 'flow-rate', typeBadge: 'SIMULATED', timeInfo: 'Simulated // 2s ago' }
        ];
      case 'power-failure':
        return [
          { label: 'Security RFID', val: 'Substation Blackout', status: 'critical', registryKey: 'active-alerts', typeBadge: 'LIVE', timeInfo: 'Offline // 12m ago' },
          { label: 'Citizen Reports', val: 'Dark Corridor Stairwell', status: 'warning', registryKey: 'citizen', typeBadge: 'LIVE', timeInfo: 'Live // 15s ago' }
        ];
      default:
        return [
          { label: 'Weather API', val: 'Nominal Clear', status: 'healthy', registryKey: 'weather', typeBadge: 'LIVE', timeInfo: 'Live // 20s ago' },
          { label: 'Turnstile Counter', val: 'Nominal flow rate', status: 'healthy', registryKey: 'flow-rate', typeBadge: 'SIMULATED', timeInfo: 'Simulated // 2s ago' },
          { label: 'Transit ATS', val: 'Nominal intervals', status: 'healthy', registryKey: 'metro-status', typeBadge: 'LIVE', timeInfo: 'Live // 14s ago' }
        ];
    }
  };

  const graphTriggers = getGraphTriggers();

  return (
    <div className="w-full h-full glass-panel rounded-2xl flex flex-col p-5 overflow-hidden font-sans">
      
      {/* HUD Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <span className="font-mono text-xs uppercase tracking-widest text-white/70">Operations Console</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-white/40">
          <span className={`w-1.5 h-1.5 rounded-full ${isAnalyzing ? 'bg-amber-400 animate-spin' : 'bg-green-400'}`} />
          {isAnalyzing ? 'INGESTING' : 'READY'}
        </div>
      </div>

      {/* A. OPERATIONAL TIMELINE */}
      <div className="w-full h-36 rounded-xl bg-[#11131c] border border-zinc-800 p-4 mb-4 flex flex-col justify-between overflow-hidden text-left">
        <div className="flex justify-between items-center text-slate-500 border-b border-zinc-800 pb-2 mb-2 text-[9px] font-mono shrink-0 font-bold tracking-wider">
          <span>Operational Timeline</span>
          <span>Active Ingestion Feeds</span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs scrollbar-thin">
          {timelineLogs.map((log: any, idx: number) => {
            const cleanMessage = log.message
              .replace('[DI_CORE] ', '')
              .replace('INGEST // ', '')
              .replace('FUSION // ', '');
            
            return (
              <div key={idx} className="flex gap-3 text-slate-300 leading-tight">
                <span className="text-[10px] font-mono text-slate-500 shrink-0 select-none mt-0.5">{log.time}</span>
                <span className="font-sans font-medium text-slate-300">
                  <span className="text-blue-400 font-bold mr-2">[{log.source}]</span>
                  {cleanMessage}
                </span>
              </div>
            );
          })}
          <div ref={timelineEndRef} />
        </div>
      </div>

      {/* B. EXECUTIVE BRIEFING SUMMARY */}
      <div className="relative flex-1 flex flex-col justify-between overflow-y-auto mb-4 min-h-[140px] p-4 rounded-xl bg-[#11131c] border border-zinc-800 font-sans text-xs leading-relaxed text-left">
        {isAnalyzing ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-500 animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
            <span className="font-mono text-[10px] tracking-wider uppercase font-bold">Analyzing Active Corridors...</span>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2 mb-2 shrink-0">
                <span className="text-slate-300 font-bold tracking-tight text-xs uppercase">Situation Analysis Summary</span>
                <button 
                  onClick={() => setLineageModalData(LINEAGE_REGISTRY['risk-score'])}
                  className="p-0.5 rounded hover:bg-zinc-800 text-slate-500 hover:text-blue-400 cursor-pointer"
                  title="View Details"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-slate-300 font-normal leading-relaxed text-xs">
                {briefing}
              </p>
            </div>

            <div className="border-t border-zinc-800 mt-4 pt-2 flex justify-between items-center text-[10px] text-slate-500 font-mono">
              <span>Core: Ingestion & Fusion</span>
              <span>Data Trust Level: 98.4%</span>
            </div>
          </div>
        )}
      </div>

      {/* C. MITIGATION PROTOCOL & WHY DRAWER */}
      <div className="z-10 text-left">
        {isApproving || isIntervened ? (
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
                <span className="font-semibold uppercase tracking-wider text-[10px]">Action Implemented // Restoring Systems</span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-zinc-800 bg-[#11131c] flex flex-col justify-between text-left">
            <div>
              {/* Header */}
              <div className="flex justify-between items-start mb-2">
                <div className="text-left">
                  <h4 className="text-sm font-semibold text-slate-200 tracking-tight">{mitigation?.title || "Evaluating Protocols..."}</h4>
                  <button 
                    onClick={() => setShowWhy(!showWhy)}
                    className="font-mono text-[9px] text-blue-400 hover:text-blue-300 hover:underline block mt-0.5 cursor-pointer text-left focus:outline-none"
                  >
                    Based on {graphTriggers.length} Ingest Feeds (Click to view Reasoning Pipeline)
                  </button>
                </div>
                <div className="flex flex-col items-end">
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] font-mono text-blue-400 font-bold">
                    Confidence: {adjustedConfidence}%
                  </span>
                </div>
              </div>

              {/* Trust Warning Message */}
              {trustPenalty && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/5 border border-amber-500/20 text-amber-400 text-[10px] font-mono mb-3">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Stale feed alert: {trustPenalty.feedName} feed is delayed (-{trustPenalty.penalty}% confidence penalty).</span>
                </div>
              )}

              <p className="text-slate-400 text-xs font-normal leading-relaxed mb-3">
                {mitigation?.description}
              </p>

              {/* Expanded Why? Reasoning Graph Drawer */}
              {showWhy && (
                <div className="border-t border-white/5 pt-4 mt-3 space-y-4 animate-in slide-in-from-top-4 duration-300">
                  
                  {/* Reasoning Flow diagram */}
                  <div className="flex flex-col items-center gap-2 font-mono text-[10px] text-center">
                    
                    {/* Ingestion stream nodes */}
                    <div className="grid grid-cols-3 gap-2 w-full">
                      {graphTriggers.map((n, idx) => (
                        <button 
                          key={idx} 
                          onClick={() => setLineageModalData(LINEAGE_REGISTRY[n.registryKey])}
                          className="p-2 rounded-xl border border-zinc-800 bg-[#161822] hover:bg-[#1a1d29] hover:border-zinc-700 transition-all text-left flex flex-col justify-between cursor-pointer select-none focus:outline-none"
                        >
                          {/* Node Header: Indicator dot + Label + Type-Badge */}
                          <div className="flex justify-between items-center w-full mb-1 border-b border-zinc-800 pb-1">
                            <span className="flex items-center gap-1 min-w-0">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                n.status === 'critical' ? 'bg-red-500' :
                                n.status === 'warning' ? 'bg-amber-500' :
                                'bg-emerald-500'
                              }`} />
                              <span className="text-[7px] font-bold text-slate-450 uppercase truncate">{n.label}</span>
                            </span>
                            <span className={`text-[6px] font-mono px-1 rounded font-bold uppercase scale-[0.9] ${
                              n.typeBadge === 'LIVE' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                              n.typeBadge === 'SIMULATED' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' :
                              n.typeBadge === 'DERIVED' ? 'text-purple-400 bg-purple-500/10 border-purple-500/20' :
                              'text-amber-400 bg-amber-500/10 border-amber-500/20'
                            }`}>
                              {n.typeBadge}
                            </span>
                          </div>
                          {/* Value */}
                          <span className="font-semibold text-[9px] leading-tight truncate text-slate-200">{n.val}</span>
                          {/* Freshness Timestamp */}
                          <span className="text-[7px] text-slate-500 font-mono mt-1 uppercase block">{n.timeInfo}</span>
                        </button>
                      ))}
                    </div>

                    {/* Arrow down to Fusion */}
                    <div className="flex justify-center my-0.5">
                      <svg width="12" height="20" viewBox="0 0 12 20" fill="none" className="text-zinc-700">
                        <path d="M6 0V18M6 18L2 14M6 18L10 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 3" />
                      </svg>
                    </div>

                    {/* Data Fusion Node */}
                    <div className="p-2.5 w-full rounded-xl border border-zinc-800 bg-[#161822] text-slate-200 font-bold flex justify-between items-center shadow-lg">
                      <span className="text-xs tracking-tight">Data Fusion Engine</span>
                      <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-400 font-mono font-bold">Feeds Correlated</span>
                    </div>

                    {/* Arrow down to Reasoning Engine */}
                    <div className="flex justify-center my-0.5">
                      <svg width="12" height="20" viewBox="0 0 12 20" fill="none" className="text-zinc-700">
                        <path d="M6 0V18M6 18L2 14M6 18L10 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>

                    {/* Decision Reasoning Engine & Breakdown details */}
                    <div className="p-3 w-full rounded-xl border border-zinc-800 bg-[#161822] text-left space-y-2">
                      <div className="flex justify-between items-center text-slate-300 font-bold text-xs tracking-tight">
                        <span className="flex items-center gap-1">
                          Operations Decision Engine
                          <button 
                            onClick={() => setLineageModalData(LINEAGE_REGISTRY['operational-health'])}
                            className="p-0.5 hover:bg-zinc-800 rounded text-slate-500 hover:text-blue-400 cursor-pointer"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                          </button>
                        </span>
                        <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded font-bold">Confidence: {adjustedConfidence}%</span>
                      </div>
                      
                      {/* Contributors breakdown bars */}
                      <div className="space-y-1.5 pt-1.5 border-t border-zinc-800">
                        {confidenceBreakdown.map((c, i) => (
                          <div key={i} className="flex items-center justify-between text-[8px] text-slate-500">
                            <span className="font-semibold">{c.label} Weight</span>
                            <div className="flex items-center gap-2 flex-1 mx-3">
                              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${c.value}%` }} />
                              </div>
                            </div>
                            <span className="font-bold text-slate-300">{c.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Arrow down to output */}
                    <div className="flex justify-center my-0.5">
                      <svg width="12" height="20" viewBox="0 0 12 20" fill="none" className="text-zinc-700">
                        <path d="M6 0V18M6 18L2 14M6 18L10 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>

                    {/* Action Directives */}
                    <div className="p-2.5 w-full rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 font-bold flex justify-between items-center">
                      <span className="text-xs tracking-tight">Action Directives</span>
                      <span className="text-[8px] bg-emerald-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider font-mono font-bold">Ready</span>
                    </div>

                  </div>

                </div>
              )}

              {/* Bottom stats and "Why?" button */}
              <div className="grid grid-cols-12 gap-2 text-[10px] font-mono border-t border-zinc-800 pt-3 items-center">
                <div className="col-span-5 text-left">
                  <span className="text-slate-500 block uppercase font-bold tracking-wide">Expected Impact</span>
                  <span className="text-emerald-400 font-semibold">{mitigation?.expectedImpact}</span>
                </div>
                <div className="col-span-4 text-left">
                  <span className="text-slate-500 block uppercase font-bold tracking-wide">Backup Protocol</span>
                  <span className="text-slate-400">{mitigation?.alternative}</span>
                </div>
                <div className="col-span-3 text-right flex justify-end gap-1.5">
                  <button
                    onClick={() => setShowExplainModal(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/40 hover:bg-indigo-500/30 transition-all font-mono text-[10px] text-indigo-300 font-bold cursor-pointer"
                  >
                    WHY THIS DECISION?
                  </button>
                  <button
                    onClick={() => setShowWhy(!showWhy)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 transition-all font-mono text-[10px] text-blue-400 font-bold cursor-pointer"
                  >
                    {showWhy ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {showWhy ? 'CLOSE' : 'GRAPH'}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={approveIntervention}
              disabled={isAnalyzing}
              className={`w-full mt-4 py-3 rounded-xl font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer transition-all ${
                isAnalyzing 
                  ? 'bg-zinc-800 text-slate-500 border border-zinc-700 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/15'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Execute Mitigation Plan
            </button>
          </div>
        )}
      </div>

      <WhyThisDecisionModal
        isOpen={showExplainModal}
        onClose={() => setShowExplainModal(false)}
        recommendationTitle={mitigation?.title || "Deploy Two Supervisors to Platform 3 & Open Exit C"}
        confidence={adjustedConfidence}
        videoSrc="/Crowd-at-Ameerpet-Metro-Station.mp4"
      />
    </div>
  );
};
