import React, { useEffect, useState, useRef } from 'react';
import { useAppState } from '../context/AppStateContext';
import { aiService } from '../services/aiService';
import { LINEAGE_REGISTRY } from '../services/lineageRegistry';
import { Cpu, CheckCircle2, RefreshCw, Terminal, ChevronDown, ChevronUp, AlertTriangle, HelpCircle } from 'lucide-react';

export const OperationsConsole: React.FC = () => {
  const { 
    activeScenario, 
    simulationStep, 
    telemetry, 
    isIntervened, 
    approveIntervention,
    approvalLogs,
    isApproving,
    getIngestTimeline,
    getConfidenceBreakdown,
    getTrustPenalty,
    setLineageModalData
  } = useAppState();

  const [briefing, setBriefing] = useState<string>("Initializing secure channel...");
  const [mitigation, setMitigation] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [showWhy, setShowWhy] = useState<boolean>(false);

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
  }, [activeScenario, simulationStep, isIntervened]);

  // Scroll Ingestion timeline to bottom automatically
  useEffect(() => {
    if (timelineEndRef.current) {
      timelineEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [simulationStep, activeScenario]);

  if (!telemetry) return null;

  const timelineLogs = getIngestTimeline();
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

      {/* A. REAL-TIME DATA INGESTION TIMELINE TICKER */}
      <div className="w-full h-32 rounded-xl bg-black/55 border border-white/5 p-3 mb-4 flex flex-col justify-between overflow-hidden">
        <div className="flex justify-between items-center text-white/30 border-b border-white/5 pb-1 mb-1.5 text-[9px] font-mono shrink-0">
          <span>Live Ingestion Feed</span>
          <span>Active Streams</span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 font-mono text-[10px] text-left scrollbar-thin">
          {timelineLogs.map((log, idx) => (
            <div key={idx} className="flex gap-2">
              <span className="text-white/30 shrink-0">{log.time}</span>
              <span className={log.message.includes('[DI_CORE]') ? 'text-indigo-400' : log.message.includes('warning') || log.message.includes('STALE') || log.message.includes('OFFLINE') ? 'text-amber-400' : 'text-green-400'}>
                {log.message}
              </span>
            </div>
          ))}
          <div ref={timelineEndRef} />
        </div>
      </div>

      {/* B. TERMINAL BRIEFING WINDOW */}
      <div className="relative flex-1 flex flex-col justify-between overflow-y-auto mb-4 min-h-[140px] p-4 rounded-xl bg-black/40 border border-white/5 font-mono text-xs leading-relaxed">
        {isAnalyzing ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-white/30 animate-pulse">
            <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
            <span>[FUSING ACTIVE CORRIDORS...]</span>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between">
            <div className="text-left text-white/80 whitespace-pre-wrap">
              <div className="flex justify-between items-center border-b border-white/5 pb-1.5 mb-2 shrink-0">
                <span className="text-indigo-400 font-bold">$&gt; Live Briefing Summary</span>
                <button 
                  onClick={() => setLineageModalData(LINEAGE_REGISTRY['risk-score'])}
                  className="p-0.5 rounded hover:bg-white/5 text-white/30 hover:text-indigo-400 cursor-pointer"
                  title="View Lineage Logic"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
              {briefing}
            </div>

            <div className="border-t border-white/5 mt-4 pt-3 flex justify-between items-center text-[10px] text-white/30">
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
          <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-950/5 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex justify-between items-start mb-2">
                <div className="text-left">
                  <h4 className="text-sm font-semibold text-white tracking-wide">{mitigation?.title || "Evaluating Protocols..."}</h4>
                  <button 
                    onClick={() => setShowWhy(!showWhy)}
                    className="font-mono text-[9px] text-indigo-400 hover:text-indigo-300 hover:underline block mt-0.5 cursor-pointer text-left focus:outline-none"
                  >
                    Data Provenance: Generated from {graphTriggers.length} feeds (Click to trace)
                  </button>
                </div>
                <div className="flex flex-col items-end">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-mono text-indigo-400 font-bold">
                    CONFIDENCE: {adjustedConfidence}%
                  </span>
                </div>
              </div>

              {/* Trust Warning Message */}
              {trustPenalty && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/5 border border-amber-500/20 text-amber-400 text-[10px] font-mono mb-3">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Recommendation confidence reduced because {trustPenalty.feedName} feed is stale (-{trustPenalty.penalty}% penalty).</span>
                </div>
              )}

              <p className="text-white/60 text-xs font-light leading-relaxed mb-3">
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
                          className={`p-2 rounded border text-left flex flex-col justify-between cursor-pointer hover:bg-white/5 hover:border-white/20 transition-all select-none focus:outline-none ${
                            n.status === 'critical' ? 'bg-red-500/5 border-red-500/20 text-red-400' :
                            n.status === 'warning' ? 'bg-amber-500/5 border-amber-500/20 text-amber-400' :
                            'bg-green-500/5 border-green-500/20 text-green-400'
                          }`}
                        >
                          {/* Node Header: Indicator dot + Label + Type-Badge */}
                          <div className="flex justify-between items-center w-full mb-1 border-b border-white/5 pb-1">
                            <span className="flex items-center gap-1 min-w-0">
                              <span className={`w-1 h-1 rounded-full shrink-0 ${
                                n.status === 'critical' ? 'bg-red-500 animate-pulse' :
                                n.status === 'warning' ? 'bg-amber-500' :
                                'bg-green-500'
                              }`} />
                              <span className="text-[7px] font-bold opacity-75 uppercase truncate">{n.label}</span>
                            </span>
                            <span className={`text-[6px] font-mono px-1 rounded font-bold uppercase scale-[0.9] ${
                              n.typeBadge === 'LIVE' ? 'text-green-400 bg-green-500/10 border-green-500/20' :
                              n.typeBadge === 'SIMULATED' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' :
                              n.typeBadge === 'DERIVED' ? 'text-purple-400 bg-purple-500/10 border-purple-500/20' :
                              'text-amber-400 bg-amber-500/10 border-amber-500/20 animate-pulse'
                            }`}>
                              {n.typeBadge}
                            </span>
                          </div>
                          {/* Value */}
                          <span className="font-semibold text-[9px] leading-tight truncate text-white/90">{n.val}</span>
                          {/* Freshness Timestamp */}
                          <span className="text-[7px] text-white/30 font-mono mt-1 uppercase block">{n.timeInfo}</span>
                        </button>
                      ))}
                    </div>

                    {/* Arrow down to Fusion */}
                    <div className="text-white/20 text-sm leading-none h-4">↓</div>

                    {/* Data Fusion Node */}
                    <div className="p-2.5 w-full rounded border border-white/10 bg-white/2 text-white/80 font-bold flex justify-between items-center shadow-lg">
                      <span>Data Fusion Engine</span>
                      <span className="text-[8px] bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 rounded text-green-400 font-mono">Feeds Correlated</span>
                    </div>

                    {/* Arrow down to Reasoning Engine */}
                    <div className="text-white/20 text-sm leading-none h-4">↓</div>

                    {/* Decision Reasoning Engine & Breakdown details */}
                    <div className="p-3 w-full rounded border border-indigo-500/20 bg-indigo-950/10 text-left space-y-2">
                      <div className="flex justify-between items-center text-indigo-300 font-bold">
                        <span className="flex items-center gap-1">
                          Operations Decision Engine
                          <button 
                            onClick={() => setLineageModalData(LINEAGE_REGISTRY['operational-health'])}
                            className="p-0.5 hover:bg-white/5 rounded text-white/30 hover:text-indigo-400 cursor-pointer"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                          </button>
                        </span>
                        <span>Confidence: {adjustedConfidence}%</span>
                      </div>
                      
                      {/* Contributors breakdown bars */}
                      <div className="space-y-1.5 pt-1.5 border-t border-white/5">
                        {confidenceBreakdown.map((c, i) => (
                          <div key={i} className="flex items-center justify-between text-[8px] text-white/40">
                            <span>{c.label} Contribution</span>
                            <div className="flex items-center gap-2 flex-1 mx-3">
                              <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${c.value}%` }} />
                              </div>
                            </div>
                            <span className="font-bold text-white/70">{c.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Arrow down to output */}
                    <div className="text-white/20 text-sm leading-none h-4">↓</div>

                    {/* Action Directives */}
                    <div className="p-2.5 w-full rounded border border-green-500/20 bg-green-950/10 text-green-400 font-bold flex justify-between items-center">
                      <span>Action Directives</span>
                      <span className="text-[8px] bg-green-500/20 px-1.5 py-0.5 rounded uppercase">Ready</span>
                    </div>

                  </div>

                </div>
              )}

              {/* Bottom stats and "Why?" button */}
              <div className="grid grid-cols-12 gap-2 text-[10px] font-mono border-t border-white/5 pt-3 items-center">
                <div className="col-span-5">
                  <span className="text-white/30 block uppercase">Expected Impact</span>
                  <span className="text-green-400">{mitigation?.expectedImpact}</span>
                </div>
                <div className="col-span-4">
                  <span className="text-white/30 block uppercase">Alternative Path</span>
                  <span className="text-white/50">{mitigation?.alternative}</span>
                </div>
                <div className="col-span-3 text-right">
                  <button
                    onClick={() => setShowWhy(!showWhy)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all font-mono text-[10px] text-indigo-400 font-bold cursor-pointer"
                  >
                    {showWhy ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {showWhy ? 'CLOSE WHY' : 'WHY?'}
                  </button>
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
