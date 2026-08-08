import React, { useState, useEffect } from 'react';
import { useAppState } from '../context/AppStateContext';
import { LINEAGE_REGISTRY } from '../services/lineageRegistry';
import { AlertTriangle, Heart, HelpCircle, Loader2 } from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, 
  Tooltip, BarChart, Bar 
} from 'recharts';
import { getDynamicScenarioPriorities } from '../services/groqService';


export const RoleOverlay: React.FC = () => {
  const { currentRole, telemetry, setLineageModalData, activeScenario } = useAppState();
  const [dynamicPriorities, setDynamicPriorities] = useState<{critical: string[], warning: string[], normal: string[]}>({
    critical: [], warning: [], normal: ['All venue telemetry streams nominal']
  });
  const [isGeneratingPriorities, setIsGeneratingPriorities] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchPriorities = async () => {
      setIsGeneratingPriorities(true);
      const priorities = await getDynamicScenarioPriorities(activeScenario, telemetry);
      if (isMounted) {
        setDynamicPriorities(priorities);
        setIsGeneratingPriorities(false);
      }
    };
    fetchPriorities();
    return () => { isMounted = false; };
  }, [activeScenario, telemetry?.operationalHealth, telemetry?.riskLevel]);

  if (!telemetry) return null;

  // Chart data generators
  const getFlowData = () => [
    { name: '18:00', flow: 70 },
    { name: '18:02', flow: 85 },
    { name: '18:04', flow: telemetry.crowd.flowRate - 10 },
    { name: '18:06', flow: telemetry.crowd.flowRate },
  ];

  const getResponseData = () => [
    { name: '18:00', time: 120 },
    { name: '18:02', time: 140 },
    { name: '18:04', time: telemetry.medical.responseTimeSec - 20 },
    { name: '18:06', time: telemetry.medical.responseTimeSec },
  ];

  const renderCommanderView = () => {
    const standsPct = Math.round(telemetry.crowd.standsDensity * 100);
    const concoursePct = Math.round(telemetry.crowd.concourseDensity * 100);

    return (
      <div className="space-y-4">
        <h3 className="font-mono text-xs text-blue-400 uppercase tracking-widest border-b border-white/5 pb-2">System Status</h3>
        
        {/* Stadium Occupancy Radial Gauge */}
        <div className="p-4 rounded-xl bg-white/2 border border-white/5 flex items-center justify-between">
          <div className="text-left">
            <span className="text-white/30 text-[9px] font-mono uppercase flex items-center gap-1">
              Stands Capacity
              <button 
                onClick={() => setLineageModalData(LINEAGE_REGISTRY['stands-density'])}
                className="hover:text-indigo-400 p-0.5 rounded cursor-pointer"
              >
                <HelpCircle className="w-2.5 h-2.5" />
              </button>
            </span>
            <span className="text-2xl font-bold text-white">{standsPct}%</span>
            <span className="text-[9px] font-mono text-white/40 block mt-0.5">{(telemetry.crowd.standsDensity * 80000).toLocaleString()} / 80k Seats</span>
          </div>
          <div className="w-16 h-16 flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-full border-4 border-white/5" />
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/50 border-t-transparent border-r-transparent animate-spin-slow" />
            <span className="font-mono text-xs text-white/80">{standsPct}%</span>
          </div>
        </div>

        {/* Global Concourse Density Card */}
        <div className="p-4 rounded-xl bg-white/2 border border-white/5 text-left">
          <span className="text-white/30 text-[9px] font-mono uppercase flex items-center gap-1 mb-1.5">
            Concourse Circulation Flow
            <button 
              onClick={() => setLineageModalData(LINEAGE_REGISTRY['concourse-density'])}
              className="hover:text-indigo-400 p-0.5 rounded cursor-pointer"
            >
              <HelpCircle className="w-2.5 h-2.5" />
            </button>
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{concoursePct}%</span>
            <span className={`text-[10px] font-mono font-bold ${concoursePct > 75 ? 'text-red-400' : 'text-green-400'}`}>
              {concoursePct > 75 ? 'CONGESTION ALERT' : 'OPTIMAL'}
            </span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-700 ${
                concoursePct > 75 ? 'bg-red-500' : concoursePct > 50 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${concoursePct}%` }}
            />
          </div>
        </div>

        {/* Global Alerts Feed */}
        <div className="p-4 rounded-xl bg-white/2 border border-white/5 text-left">
          <span className="text-white/30 text-[9px] font-mono uppercase flex items-center gap-1 mb-3">
            Critical Alerts Log
            <button 
              onClick={() => setLineageModalData(LINEAGE_REGISTRY['active-alerts'])}
              className="hover:text-indigo-400 p-0.5 rounded cursor-pointer"
            >
              <HelpCircle className="w-2.5 h-2.5" />
            </button>
          </span>
          {telemetry.incidents.length === 0 ? (
            <div className="text-xs text-white/30 font-mono py-4 text-center border border-dashed border-white/5 rounded-lg">
              NO ACTIVE ALERTS
            </div>
          ) : (
            <div className="space-y-2">
              {telemetry.incidents.map((inc: any) => (
                <div key={inc.id} className="flex gap-2.5 p-2 rounded bg-black/30 border border-white/5 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-mono font-bold text-white/90 block">{inc.id} // {inc.type}</span>
                    <span className="text-[10px] text-white/40 block leading-tight">{inc.description}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSecurityView = () => {
    const alertLevel = telemetry.security.alertLevel || "STANDARD";

    return (
      <div className="space-y-4">
        <h3 className="font-mono text-xs text-red-400 uppercase tracking-widest border-b border-white/5 pb-2">Security Status</h3>
        
        {/* Security Posture Index */}
        <div className="p-4 rounded-xl bg-white/2 border border-white/5 text-left">
          <span className="text-white/30 text-[9px] font-mono uppercase flex items-center gap-1">
            Security Posture
            <button 
              onClick={() => setLineageModalData(LINEAGE_REGISTRY['active-alerts'])}
              className="hover:text-indigo-400 p-0.5 rounded cursor-pointer"
            >
              <HelpCircle className="w-2.5 h-2.5" />
            </button>
          </span>
          <span className={`text-2xl font-bold block mt-1 ${alertLevel === 'CRITICAL' ? 'text-red-400 animate-pulse' : alertLevel === 'ELEVATED' ? 'text-amber-400' : 'text-blue-400'}`}>
            {alertLevel}
          </span>
          <span className="text-[10px] font-mono text-white/40 block mt-1">FORCE STRENGTH: {telemetry.security.deployedUnits || 180} ACTIVE UNITS</span>
        </div>

        {/* Dynamic Gate Intake List */}
        <div className="p-4 rounded-xl bg-white/2 border border-white/5 text-left">
          <span className="text-white/30 text-[9px] font-mono uppercase flex items-center gap-1 mb-3">
            Perimeter Gate Queue Densities
            <button 
              onClick={() => setLineageModalData(LINEAGE_REGISTRY['gate-occupancy'])}
              className="hover:text-indigo-400 p-0.5 rounded cursor-pointer"
            >
              <HelpCircle className="w-2.5 h-2.5" />
            </button>
          </span>
          <div className="space-y-2.5">
            {telemetry.gates.map((g: any) => {
              const occ = Math.round(g.occupancy * 100);
              return (
                <div key={g.id} className="flex items-center justify-between text-xs font-mono">
                  <span className="text-white/50">Gate {g.id}</span>
                  <div className="flex items-center gap-2.5 flex-1 mx-4">
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ${
                          g.status === 'OFFLINE' ? 'bg-red-600' : occ > 80 ? 'bg-amber-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${g.status === 'OFFLINE' ? 100 : occ}%` }}
                      />
                    </div>
                  </div>
                  <span className={`font-bold ${g.status === 'OFFLINE' ? 'text-red-500 animate-pulse' : occ > 80 ? 'text-amber-400' : 'text-white'}`}>
                    {g.status === 'OFFLINE' ? 'OFFLINE' : `${occ}%`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderMedicalView = () => {
    return (
      <div className="space-y-4">
        <h3 className="font-mono text-xs text-emerald-400 uppercase tracking-widest border-b border-white/5 pb-2">Medical Status</h3>
        
        {/* Dispatch Metrics */}
        <div className="p-4 rounded-xl bg-white/2 border border-white/5 text-left">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/30 text-[9px] font-mono uppercase flex items-center gap-1">
              Avg Response Time
              <button 
                onClick={() => setLineageModalData(LINEAGE_REGISTRY['medical-response'])}
                className="hover:text-indigo-400 p-0.5 rounded cursor-pointer"
              >
                <HelpCircle className="w-2.5 h-2.5" />
              </button>
            </span>
            <span className="text-xs font-mono text-white/40">{telemetry.medical.responseTimeSec}s</span>
          </div>
          <div className="h-16 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getResponseData()} margin={{ top: 2, right: 2, left: -20, bottom: 2 }}>
                <defs>
                  <linearGradient id="medGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip contentStyle={{ background: '#0a0a12', borderColor: 'rgba(255,255,255,0.08)', fontSize: 10 }} />
                <Area type="monotone" dataKey="time" stroke="#10b981" fillOpacity={1} fill="url(#medGrad)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stations load list */}
        <div className="p-4 rounded-xl bg-white/2 border border-white/5 text-left">
          <span className="text-[10px] font-mono text-white/30 uppercase block mb-3">Medical Stations load</span>
          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="text-white/50 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-emerald-400" />
                Bay 1 (Sector C)
              </span>
              <span className="text-white font-bold">{Math.round(telemetry.medical.stationOccupancy * 100)}% Capacity</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/50 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-emerald-400" />
                Bay 2 (Sector B)
              </span>
              <span className="text-white font-bold">{Math.round(telemetry.medical.stationOccupancy * 0.7 * 100)}% Capacity</span>
            </div>
            <div className="flex justify-between items-center border-t border-white/5 pt-2.5 text-[10px] text-white/40">
              <span>ACTIVE DISPATCH SQUADS</span>
              <span>{telemetry.medical.activeIncidents} UNITS DEPLOYED</span>
            </div>
          </div>
        </div>
      </div>
    );
  };


  const renderTransportView = () => {
    return (
      <div className="space-y-4">
        <h3 className="font-mono text-xs text-indigo-400 uppercase tracking-widest border-b border-white/5 pb-2">Transit Status</h3>
        
        {/* Metro Wait times chart */}
        <div className="p-4 rounded-xl bg-white/2 border border-white/5 text-left">
          <span className="text-white/30 text-[9px] font-mono uppercase flex items-center gap-1 mb-1.5">
            Metro Line 1 Status
            <button 
              onClick={() => setLineageModalData(LINEAGE_REGISTRY['metro-status'])}
              className="hover:text-indigo-400 p-0.5 rounded cursor-pointer"
            >
              <HelpCircle className="w-2.5 h-2.5" />
            </button>
          </span>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold uppercase ${telemetry.transport.metroStatus === 'DELAYED' ? 'text-red-400 animate-pulse' : 'text-green-400'}`}>
              {telemetry.transport.metroStatus}
            </span>
            <span className="text-[10px] font-mono text-white/40">INTERVAL: {telemetry.transport.metroIntervalMin || 4}M</span>
          </div>
        </div>

        {/* Bus Queue chart */}
        <div className="p-4 rounded-xl bg-white/2 border border-white/5 text-left">
          <span className="text-white/30 text-[9px] font-mono uppercase flex items-center gap-1 mb-1">
            Transit Bus plaza wait queue
            <button 
              onClick={() => setLineageModalData(LINEAGE_REGISTRY['metro-status'])}
              className="hover:text-indigo-400 p-0.5 rounded cursor-pointer"
            >
              <HelpCircle className="w-2.5 h-2.5" />
            </button>
          </span>
          <span className="text-xs font-mono text-white/40 block mb-2">{telemetry.transport.busTerminalQueue} Commuters waiting</span>
          <div className="h-16 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getFlowData()} margin={{ top: 2, right: 2, left: -20, bottom: 2 }}>
                <Tooltip contentStyle={{ background: '#0a0a12', borderColor: 'rgba(255,255,255,0.08)', fontSize: 10 }} />
                <Bar dataKey="flow" fill="#818cf8" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  // Dynamic Priority Panel helper based on the active scenario
  const renderPrioritiesPanel = () => {
    const { critical: criticalItems, warning: warningItems, normal: normalItems } = dynamicPriorities;

    return (
      <div className="border-b border-zinc-800 pb-4 mb-4 text-left min-h-[120px]">
        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center justify-between">
          <span>Priority Action Center</span>
          {isGeneratingPriorities && (
            <span className="flex items-center gap-1 text-indigo-400">
              <Loader2 className="w-3 h-3 animate-spin" />
              Generating RAG Analysis...
            </span>
          )}
        </h4>
        
        {/* Critical Alerts */}
        {criticalItems.length > 0 && (
          <div className="space-y-1.5 mb-3">
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 font-mono tracking-wider block w-fit uppercase">Critical</span>
            {criticalItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-red-400 pl-1">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        )}

        {/* Warning Alerts */}
        {warningItems.length > 0 && (
          <div className="space-y-1.5 mb-3">
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono tracking-wider block w-fit uppercase">Warning</span>
            {warningItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-amber-400 pl-1">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        )}

        {/* Normal Subsystems */}
        {normalItems.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-slate-500 font-mono tracking-wider block w-fit uppercase">Normal</span>
            {normalItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-slate-400 pl-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderStationView = () => {
    return (
      <div className="space-y-4">
        <h3 className="font-mono text-xs text-amber-400 uppercase tracking-widest border-b border-white/5 pb-2">Station Facilities Status</h3>
        
        <div className="p-4 rounded-xl bg-white/2 border border-white/5 text-left">
          <span className="text-white/30 text-[9px] font-mono uppercase flex items-center gap-1 mb-2">
            Escalators & Elevators
          </span>
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-white/50">Concourse Escalators</span>
              <span className="text-green-400 font-semibold">12/12 Operational</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Platform Lifts</span>
              <span className="text-green-400 font-semibold">4/4 Operational</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/2 border border-white/5 text-left">
          <span className="text-[10px] font-mono text-white/30 uppercase block mb-2">Environmental Controls</span>
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-white/50">HVAC System</span>
              <span className="text-white font-semibold">Nominal (23.5°C)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Primary Power Grid</span>
              <span className="text-green-400 font-semibold">Active (99.8%)</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPassengerView = () => {
    const concoursePct = Math.round(telemetry.crowd.concourseDensity * 100);
    return (
      <div className="space-y-4">
        <h3 className="font-mono text-xs text-violet-400 uppercase tracking-widest border-b border-white/5 pb-2">Passenger Flow Status</h3>
        
        <div className="p-4 rounded-xl bg-white/2 border border-white/5 text-left">
          <span className="text-white/30 text-[9px] font-mono uppercase flex items-center gap-1 mb-1.5">
            Concourse Circulation Flow
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{concoursePct}%</span>
            <span className={`text-[10px] font-mono font-bold ${concoursePct > 75 ? 'text-red-400' : 'text-green-400'}`}>
              {concoursePct > 75 ? 'CONGESTION ALERT' : 'OPTIMAL'}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/2 border border-white/5 text-left">
          <span className="text-[10px] font-mono text-white/30 uppercase block mb-2">Throughput Analytics</span>
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-white/50">Entry Rate</span>
              <span className="text-white font-semibold">{telemetry.crowd.flowRate} pax/min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Total Checked In</span>
              <span className="text-white font-semibold">{telemetry.crowd.totalInside.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-5 overflow-hidden">
      {renderPrioritiesPanel()}
      {currentRole === 'commander' && renderCommanderView()}
      {currentRole === 'station' && renderStationView()}
      {currentRole === 'passenger' && renderPassengerView()}
      {currentRole === 'security' && renderSecurityView()}
      {currentRole === 'transit' && renderTransportView()}
      {currentRole === 'emergency' && renderMedicalView()}
      {!currentRole && renderCommanderView()}
    </div>
  );
};
