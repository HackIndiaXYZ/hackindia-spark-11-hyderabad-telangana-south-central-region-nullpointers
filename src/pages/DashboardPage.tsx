import React, { useState } from 'react';
import { useAppState, type RoleType } from '../context/AppStateContext';
import { DigitalTwin } from '../components/DigitalTwin';
import { OperationsConsole } from '../components/OperationsConsole';
import { ScenarioSimulator } from '../components/ScenarioSimulator';
import { DecisionReplay } from '../components/DecisionReplay';
import { RoleOverlay } from '../components/RoleOverlay';
import { DataSourcesPage } from './DataSourcesPage';
import { InfoModal } from '../components/common/InfoModal';
import { 
  Play, Pause, RotateCcw, Shield, Activity, 
  Users, Truck, Cpu, ChevronDown, Radio, Database, LayoutDashboard
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
    missionControlTimer,
    
    // New tab state and lineage modal hooks
    activeTab,
    setActiveTab,
    lineageModalData,
    setLineageModalData,
    getIngestFeeds,
    activeScenario,
    approvedScenarios
  } = useAppState();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  if (!telemetry) return null;

  const currentRoleDetails = ROLE_INFO[currentRole || 'commander'];
  const CurrentRoleIcon = currentRoleDetails.icon;

  const activeFeeds = getIngestFeeds();

  return (
    <div className="w-full min-h-screen bg-[#08090d] text-slate-200 flex flex-col p-4 md:p-6 select-none grid-bg">
      
      {/* 1. STADIUM HUD HEADER */}
      <header className="w-full grid grid-cols-1 xl:grid-cols-3 items-center justify-between gap-4 border-b border-white/5 pb-4 mb-4 z-35">
        
        {/* Left: Role Switcher Dropdown */}
        <div className="flex items-center gap-3 justify-start">
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#11131c] border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 transition-all cursor-pointer text-slate-200"
            >
              <CurrentRoleIcon className="w-4 h-4 text-blue-400" />
              <span className="font-mono text-xs font-semibold tracking-wide">
                {currentRoleDetails.title}
              </span>
              <ChevronDown className="w-4 h-4 text-white/40" />
            </button>

          {roleDropdownOpen && (
            <div className="absolute left-0 mt-2 w-56 rounded-xl border border-zinc-800 bg-[#11131c] p-1.5 shadow-2xl z-50">
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

        {/* Center: Executive Summary stats strip */}
        <div className="flex justify-center flex-1 max-w-4xl mx-auto">
          <div className="flex items-center justify-around w-full px-6 py-2.5 rounded-xl border border-zinc-800 bg-[#11131c] text-xs font-mono">
            
            {/* 1. Operational Health */}
            <div className="text-center px-4">
              <span className="text-[9px] text-slate-500 uppercase block tracking-wider font-bold">OPERATIONAL HEALTH</span>
              <span className={`text-sm font-bold mt-0.5 block ${
                telemetry.operationalHealth >= 88 ? 'text-emerald-400' :
                telemetry.operationalHealth >= 70 ? 'text-amber-400' : 'text-red-400 animate-pulse'
              }`}>{telemetry.operationalHealth}%</span>
            </div>
            
            <div className="w-px h-6 bg-zinc-800" />
            
            {/* 2. Active Alerts */}
            <div className="text-center px-4">
              <span className="text-[9px] text-slate-500 uppercase block tracking-wider font-bold">ACTIVE ALERTS</span>
              <span className={`text-sm font-bold mt-0.5 block ${
                telemetry.incidents.length > 0 ? 'text-red-400 font-extrabold' : 'text-slate-400'
              }`}>
                {telemetry.incidents.length}
              </span>
            </div>
            
            <div className="w-px h-6 bg-zinc-800" />
            
            {/* 3. Actions Approved */}
            <div className="text-center px-4">
              <span className="text-[9px] text-slate-500 uppercase block tracking-wider font-bold">ACTIONS APPROVED</span>
              <span className="text-sm font-bold text-blue-400 mt-0.5 block">
                {7 + Object.keys(approvedScenarios).length}
              </span>
            </div>
            
            <div className="w-px h-6 bg-zinc-800" />
            
            {/* 4. Critical Risk */}
            <div className="text-center px-4">
              <span className="text-[9px] text-slate-500 uppercase block tracking-wider font-bold">CRITICAL RISKS</span>
              <span className={`text-sm font-bold mt-0.5 block ${
                activeScenario !== 'normal' ? 'text-red-400 font-extrabold' : 'text-slate-400'
              }`}>
                {activeScenario !== 'normal' ? '1' : '0'}
              </span>
            </div>
            
            <div className="w-px h-6 bg-zinc-800" />
            
            {/* 5. Staff Online */}
            <div className="text-center px-4">
              <span className="text-[9px] text-slate-500 uppercase block tracking-wider font-bold">STAFF ONLINE</span>
              <span className="text-sm font-bold text-emerald-400 mt-0.5 block">
                {telemetry.volunteers.deployed || 842}
              </span>
            </div>
            
          </div>
        </div>

        {/* Right: Mission Control Mode & Global Simulation Controllers */}
        <div className="flex items-center justify-end gap-3.5">
          {/* Start Auto-Play Presentation button */}
          <button
            onClick={isMissionControlActive ? stopMissionControl : startMissionControl}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 font-sans text-xs font-semibold cursor-pointer ${
              isMissionControlActive
                ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-600/10'
                : 'bg-blue-600 text-white border-transparent hover:bg-blue-500 hover:shadow-md hover:shadow-blue-500/10'
            }`}
          >
            <Radio className="w-4 h-4" />
            {isMissionControlActive ? `Auto-Play [ ${missionControlTimer}s ]` : 'Start Auto-Play Presentation'}
          </button>

          {/* Ticking Controls */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#11131c] border border-zinc-800">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              disabled={isMissionControlActive}
              className={`p-2 rounded-lg hover:bg-zinc-800 text-slate-400 hover:text-white cursor-pointer ${isMissionControlActive ? 'opacity-30 cursor-not-allowed' : ''}`}
              title={isSimulating ? "Pause Simulation" : "Start Simulation"}
            >
              {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={resetSimulation}
              className="p-2 rounded-lg hover:bg-zinc-800 text-slate-400 hover:text-white cursor-pointer"
              title="Reset Simulation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </header>

      {/* 2. SUB-HEADER: SLEEK SYSTEM TABS */}
      <div className="flex gap-2 mb-6 border-b border-zinc-800 pb-3 justify-start shrink-0">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-sans font-semibold tracking-wide transition-all border cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-[#181a24] text-white border-zinc-800 shadow-sm'
              : 'bg-transparent text-slate-500 border-transparent hover:text-slate-200 hover:bg-zinc-800/40'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Control Center
        </button>
        <button
          onClick={() => setActiveTab('sources')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-sans font-semibold tracking-wide transition-all border cursor-pointer ${
            activeTab === 'sources'
              ? 'bg-[#181a24] text-white border-zinc-800 shadow-sm'
              : 'bg-transparent text-slate-500 border-transparent hover:text-slate-200 hover:bg-zinc-800/40'
          }`}
        >
          <Database className="w-4 h-4" />
          Data Sources ({activeFeeds.length} Feeds)
        </button>
      </div>

      {/* 3. DYNAMIC BODY PANELS */}
      {activeTab === 'sources' ? (
        <div className="flex-1 overflow-y-auto">
          <DataSourcesPage />
        </div>
      ) : (
        <>
          {/* Main Grid View */}
          <main className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch mb-6">
            
            {/* Left Column: Role Details Overlay + Scenario Selector */}
            <section className="col-span-1 flex flex-col gap-6">
              <RoleOverlay />
              <ScenarioSimulator />
            </section>

            {/* Center Hero Column: Digital Twin stadium (60% screen width anchor) */}
            <section className="lg:col-span-3 flex flex-col items-stretch">
              <DigitalTwin />
            </section>

            {/* Right Column: Operations Console */}
            <section className="col-span-1 flex flex-col items-stretch">
              <OperationsConsole />
            </section>

          </main>

          {/* Footer Grid: Decision Replay Timeline */}
          <footer className="w-full shrink-0">
            <DecisionReplay />
          </footer>
        </>
      )}

      {/* 4. SYSTEM-WIDE INFO LINEAGE POPUPS */}
      <InfoModal 
        data={lineageModalData} 
        onClose={() => setLineageModalData(null)} 
      />

    </div>
  );
};
