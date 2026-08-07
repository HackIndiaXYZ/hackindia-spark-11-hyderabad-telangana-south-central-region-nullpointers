import React from 'react';
import { useAppState } from '../context/AppStateContext';
import { Users, AlertTriangle, Heart } from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, 
  Tooltip, BarChart, Bar 
} from 'recharts';


export const RoleOverlay: React.FC = () => {
  const { currentRole, telemetry } = useAppState();

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
        <h3 className="font-mono text-xs text-blue-400 uppercase tracking-widest border-b border-white/5 pb-2">COMMANDER HUD OVERLAYS</h3>
        
        {/* Stadium Occupancy Radial Gauge */}
        <div className="p-4 rounded-xl bg-white/2 border border-white/5 flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] font-mono text-white/30 uppercase block">Stands Capacity</span>
            <span className="text-2xl font-bold text-white">{standsPct}%</span>
            <span className="text-[9px] font-mono text-white/40 block mt-0.5">{(telemetry.crowd.totalInside * 0.7).toLocaleString()} / 80k Seats</span>
          </div>
          <div className="w-16 h-16 flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-full border-4 border-white/5" />
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/50 border-t-transparent border-r-transparent animate-spin-slow" />
            <span className="font-mono text-xs text-white/80">{standsPct}%</span>
          </div>
        </div>

        {/* Global Concourse Density Card */}
        <div className="p-4 rounded-xl bg-white/2 border border-white/5 text-left">
          <span className="text-[10px] font-mono text-white/30 uppercase block mb-1.5">Concourse Circulation Flow</span>
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
          <span className="text-[10px] font-mono text-white/30 uppercase block mb-3">Critical Alerts Log</span>
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
        <h3 className="font-mono text-xs text-red-400 uppercase tracking-widest border-b border-white/5 pb-2">SECURITY STATUS OVERLAYS</h3>
        
        {/* Security Posture Index */}
        <div className="p-4 rounded-xl bg-white/2 border border-white/5 text-left">
          <span className="text-[10px] font-mono text-white/30 uppercase block">Security Posture</span>
          <span className={`text-2xl font-bold block mt-1 ${alertLevel === 'CRITICAL' ? 'text-red-400 animate-pulse' : alertLevel === 'ELEVATED' ? 'text-amber-400' : 'text-blue-400'}`}>
            {alertLevel}
          </span>
          <span className="text-[10px] font-mono text-white/40 block mt-1">FORCE STRENGTH: {telemetry.security.deployedUnits || 180} ACTIVE UNITS</span>
        </div>

        {/* Dynamic Gate Intake List */}
        <div className="p-4 rounded-xl bg-white/2 border border-white/5 text-left">
          <span className="text-[10px] font-mono text-white/30 uppercase block mb-3">Perimeter Gate Queue Densities</span>
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
        <h3 className="font-mono text-xs text-emerald-400 uppercase tracking-widest border-b border-white/5 pb-2">MEDICAL UNIT OVERLAYS</h3>
        
        {/* Dispatch Metrics */}
        <div className="p-4 rounded-xl bg-white/2 border border-white/5 text-left">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-mono text-white/30 uppercase">Avg Response Time</span>
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

  const renderVolunteerView = () => {
    const fatigue = Math.round(telemetry.volunteers.fatigue * 100);
    return (
      <div className="space-y-4">
        <h3 className="font-mono text-xs text-amber-400 uppercase tracking-widest border-b border-white/5 pb-2">VOLUNTEER SERVICES</h3>
        
        {/* Fatigue dial index */}
        <div className="p-4 rounded-xl bg-white/2 border border-white/5 text-left flex justify-between items-center">
          <div>
            <span className="text-[10px] font-mono text-white/30 uppercase block">Staff Fatigue Index</span>
            <span className={`text-2xl font-bold block mt-1 ${fatigue > 40 ? 'text-amber-400' : 'text-green-400'}`}>
              {fatigue}%
            </span>
            <span className="text-[9px] font-mono text-white/40 block mt-0.5">Status: Nominal limits</span>
          </div>
          <Users className="w-8 h-8 text-amber-400/50" />
        </div>

        {/* Dispatch locations */}
        <div className="p-4 rounded-xl bg-white/2 border border-white/5 text-left">
          <span className="text-[10px] font-mono text-white/30 uppercase block mb-3">Volunteer Deployment Units</span>
          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-white/50">Information Desks</span>
              <span className="text-white font-semibold">45 Deployed</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Gate Queue Helpers</span>
              <span className="text-white font-semibold">120 Deployed</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Medical Triage Support</span>
              <span className="text-white font-semibold">25 Deployed</span>
            </div>
            <div className="flex justify-between border-t border-white/5 pt-2.5 text-[10px] text-white/30">
              <span>TOTAL FIELD DEPLOYED</span>
              <span className="text-white font-semibold">{telemetry.volunteers.deployed || 240} Staff</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTransportView = () => {
    return (
      <div className="space-y-4">
        <h3 className="font-mono text-xs text-indigo-400 uppercase tracking-widest border-b border-white/5 pb-2">TRANSIT SYSTEM HUD</h3>
        
        {/* Metro Wait times chart */}
        <div className="p-4 rounded-xl bg-white/2 border border-white/5 text-left">
          <span className="text-[10px] font-mono text-white/30 uppercase block mb-1.5">Metro Line 1 Status</span>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold uppercase ${telemetry.transport.metroStatus === 'DELAYED' ? 'text-red-400 animate-pulse' : 'text-green-400'}`}>
              {telemetry.transport.metroStatus}
            </span>
            <span className="text-[10px] font-mono text-white/40">INTERVAL: {telemetry.transport.metroIntervalMin || 4}M</span>
          </div>
        </div>

        {/* Bus Queue chart */}
        <div className="p-4 rounded-xl bg-white/2 border border-white/5 text-left">
          <span className="text-[10px] font-mono text-white/30 uppercase block mb-1">Transit Bus plaza wait queue</span>
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

  return (
    <div className="w-full glass-panel rounded-2xl p-5 overflow-hidden">
      {currentRole === 'commander' && renderCommanderView()}
      {currentRole === 'security' && renderSecurityView()}
      {currentRole === 'medical' && renderMedicalView()}
      {currentRole === 'volunteer' && renderVolunteerView()}
      {currentRole === 'transport' && renderTransportView()}
      {!currentRole && renderCommanderView()}
    </div>
  );
};
