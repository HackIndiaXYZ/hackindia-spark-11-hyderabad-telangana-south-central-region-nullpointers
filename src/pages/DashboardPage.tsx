import React, { useState } from 'react';
import { useAppState, type RoleType } from '../context/AppStateContext';
import { DigitalTwin } from '../components/DigitalTwin';
import { OperationsConsole } from '../components/OperationsConsole';
import { ScenarioSimulator } from '../components/ScenarioSimulator';
import { DecisionReplay } from '../components/DecisionReplay';
import { RoleOverlay } from '../components/RoleOverlay';
import { 
  Play, Pause, RotateCcw, Shield, Activity, 
  Users, Truck, Cpu, ChevronDown, Radio
} from 'lucide-react';

const ROLE_INFO = {
  commander: { title: 'Operations Commander', icon: Cpu, color: 'text-blue-400' },
  security: { title: 'Security Lead', icon: Shield, color: 'text-red-400' },
  medical: { title: 'Medical Officer', icon: Activity, color: 'text-emerald-400' },
  volunteer: { title: 'Volunteer Coordinator', icon: Users, color: 'text-amber-400' },
  transport: { title: 'Transport Manager', icon: Truck, color: 'text-indigo-400' }
};

export const DashboardPage: React.FC = () => {
  const {
    currentRole,
    setRole,
    simulationStep,
    isSimulating,
    setIsSimulating,
    telemetry,
    resetSimulation,
    isMissionControlActive,
    startMissionControl,
    stopMissionControl,
    missionControlTimer
  } = useAppState();


  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  if (!telemetry) return null;

  const currentRoleDetails = ROLE_INFO[currentRole || 'commander'];
  const CurrentRoleIcon = currentRoleDetails.icon;

  // Operational Health Color mapping
  const getHealthStatus = (health: number) => {
    if (health >= 88) return { label: 'NOMINAL', color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5 glow-green' };
    if (health >= 70) return { label: 'CAUTION', color: 'text-amber-400 border-amber-500/20 bg-amber-500/5 glow-yellow' };
    return { label: 'CRITICAL', color: 'text-red-400 border-red-500/20 bg-red-500/5 glow-red animate-pulse' };
  };

  const healthStatus = getHealthStatus(telemetry.operationalHealth);

  return (
    <div className="w-full h-full min-h-screen bg-[#020205] text-white flex flex-col p-4 md:p-6 select-none grid-bg scanline">
      
      {/* 1. STADIUM HUD HEADER */}
      <header className="w-full grid grid-cols-1 lg:grid-cols-3 items-center justify-between gap-4 border-b border-white/5 pb-4 mb-6 z-30">
        
        {/* Left: Role Switcher Dropdown */}
        <div className="flex items-center gap-3 justify-start">
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
            >
              <CurrentRoleIcon className={`w-4 h-4 ${currentRoleDetails.color}`} />
              <span className="font-mono text-xs font-bold tracking-wide text-white/95">
                {currentRoleDetails.title}
              </span>
              <ChevronDown className="w-4 h-4 text-white/40" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute left-0 mt-2 w-56 rounded-xl border border-white/10 bg-[#07070e] p-1.5 shadow-2xl z-50">
                {(Object.keys(ROLE_INFO) as RoleType[]).map((rKey) => {
                  if (!rKey) return null;
                  const item = ROLE_INFO[rKey];
                  const ItemIcon = item.icon;
                  const isSelected = currentRole === rKey;

                  return (
                    <button
                      key={rKey}
                      onClick={() => {
                        setRole(rKey);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-xs font-mono transition-colors ${
                        isSelected 
                          ? 'bg-white/10 text-white' 
                          : 'text-white/60 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <ItemIcon className={`w-3.5 h-3.5 ${item.color}`} />
                      <span>{item.title}</span>
                    </button>
                  );
                })}
                <div className="border-t border-white/5 my-1.5" />
                <button
                  onClick={() => {
                    setRole(null);
                    setRoleDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-xs font-mono text-red-400 hover:bg-red-500/10 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Logout Station</span>
                </button>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-white/40 uppercase">
              STEP: {simulationStep + 1}/5
            </span>
          </div>
        </div>

        {/* Center: Operational Health gauge */}
        <div className="flex justify-center">
          <div className={`flex items-center gap-4 px-6 py-2 rounded-xl border ${healthStatus.color} transition-all duration-500`}>
            <div className="text-left">
              <span className="text-[9px] font-mono text-white/40 block uppercase tracking-widest">OPERATIONAL HEALTH</span>
              <span className="text-2xl font-bold tracking-tight">{telemetry.operationalHealth}%</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-left font-mono">
              <span className="text-[9px] text-white/40 block uppercase tracking-widest">STATUS</span>
              <span className="text-xs font-bold">{healthStatus.label}</span>
            </div>
          </div>
        </div>

        {/* Right: Mission Control Mode & Global Simulation Controllers */}
        <div className="flex items-center justify-end gap-3.5">
          {/* Mission Control mode button */}
          <button
            onClick={isMissionControlActive ? stopMissionControl : startMissionControl}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 font-mono text-xs font-bold cursor-pointer ${
              isMissionControlActive
                ? 'bg-amber-500 text-black border-amber-400 animate-pulse glow-yellow'
                : 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/25 hover:border-indigo-400'
            }`}
          >
            <Radio className={`w-4 h-4 ${isMissionControlActive ? 'animate-spin' : ''}`} />
            {isMissionControlActive ? `MC ACTIVE [${missionControlTimer}S]` : 'MISSION CONTROL'}
          </button>

          {/* Ticking Controls */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              disabled={isMissionControlActive}
              className={`p-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white cursor-pointer ${isMissionControlActive ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isSimulating ? "Pause Telemetry Tick" : "Play Telemetry Tick"}
            >
              {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={resetSimulation}
              className="p-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white cursor-pointer"
              title="Reset Simulation State"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </header>

      {/* 2. CORE WORKSPACE GRID */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch mb-6">
        
        {/* Left Column: Role Details Overlay + Scenario Selector */}
        <section className="col-span-1 flex flex-col gap-6">
          <RoleOverlay />
          <ScenarioSimulator />
        </section>

        {/* Center Hero Column: Digital Twin stadium */}
        <section className="lg:col-span-2 flex flex-col items-stretch">
          <DigitalTwin />
        </section>

        {/* Right Column: NASA-like Operations Console */}
        <section className="col-span-1 flex flex-col items-stretch">
          <OperationsConsole />
        </section>

      </main>

      {/* 3. FOOTER GRID: Decision Replay Timeline */}
      <footer className="w-full">
        <DecisionReplay />
      </footer>

    </div>
  );
};
