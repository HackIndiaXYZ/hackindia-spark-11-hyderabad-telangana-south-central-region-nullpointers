import React from 'react';
import { useAppState } from '../context/AppStateContext';
import { DigitalTwin } from '../components/DigitalTwin';
import { DecisionReplay } from '../components/DecisionReplay';
import { RoleOverlay } from '../components/RoleOverlay';
import { ScenarioSimulator } from '../components/ScenarioSimulator';
import { MetroVisionIntelligence } from '../components/MetroVisionIntelligence';
import { InfoModal } from '../components/common/InfoModal';
import { 
  LayoutDashboard, Map as MapIcon, AlertTriangle, 
  Database, Zap, RotateCcw, Settings, Activity, ArrowRight, Camera
} from 'lucide-react';

import { DecisionCenterPage } from './DecisionCenterPage';
import { DataPipelinePage } from './DataPipelinePage';

export const DashboardPage: React.FC = () => {
  const {
    telemetry,
    activeTab,
    setActiveTab,
    lineageModalData,
    setLineageModalData,
    activeScenario
  } = useAppState();

  if (!telemetry) return null;
  // Compute some basic stats for the header
  const activeIncidents = telemetry.incidents?.length || (activeScenario !== 'normal' ? 3 : 0);
  const predictions = activeScenario !== 'normal' ? 2 : 0;
  const recommendations = activeScenario !== 'normal' ? 1 : 0;

  return (
    <div className="w-full min-h-screen bg-[#09090b] text-slate-200 flex flex-col p-4 md:p-6 select-none font-sans">
      
      {/* ENTERPRISE 7-TAB NAVIGATION */}
      <nav className="flex flex-wrap items-center gap-2 mb-6 border-b border-[#27272a] pb-4">
        {[
          { id: 'vision-intelligence', label: 'Metro Vision Intelligence', icon: Camera, highlight: true },
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'data-pipeline', label: 'Data Pipeline', icon: Database },
          { id: 'decision-center', label: 'Decision Center', icon: Zap },
          { id: 'replay', label: 'Replay', icon: RotateCcw },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors border cursor-pointer ${
                isActive
                  ? tab.highlight 
                    ? 'bg-[#18181b] text-cyan-400 border-cyan-500/50'
                    : 'bg-[#18181b] text-slate-200 border-[#27272a]'
                  : tab.highlight
                    ? 'bg-transparent text-cyan-500/70 border-transparent hover:bg-[#18181b] hover:text-cyan-400'
                    : 'bg-transparent text-slate-400 border-transparent hover:bg-[#18181b] hover:text-slate-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${tab.highlight ? 'text-cyan-400 animate-pulse' : ''}`} />
              {tab.label}
              {tab.highlight && (
                <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase ml-1">
                  LIVE AI
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* DYNAMIC BODY */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'overview' && (
          <div className="flex flex-col h-full gap-6">
            {/* Executive Summary Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Good Morning</h1>
                <p className="text-sm text-slate-400 font-medium">Hyderabad Metro OCC</p>
              </div>

              <div className="flex items-center gap-6 glass-panel px-6 py-3">
                <div className="flex items-center gap-4 border-r border-[#27272a] pr-6">
                  <Activity className="w-8 h-8 text-[#10B981]" />
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Operational Health</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-[#10B981]">{telemetry.operationalHealth}</span>
                      <span className="text-sm font-medium text-[#10B981]">Excellent</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col px-4 text-center">
                  <span className="text-xl font-bold text-slate-200">{activeIncidents}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Active Incidents</span>
                </div>

                <div className="flex flex-col px-4 text-center border-l border-[#27272a]">
                  <span className="text-xl font-bold text-[#F59E0B]">{predictions}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Predictions</span>
                </div>

                <div className="flex flex-col pl-6 text-center border-l border-[#27272a]">
                  <span className="text-xl font-bold text-[#2563EB]">{recommendations}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Recommendation Waiting</span>
                </div>
              </div>
            </div>

            {/* Narrative Overview Flow */}
            <div className="flex-1 flex gap-4 h-[600px]">
              
              {/* Step 1: Digital Twin Observation */}
              <div className="flex-[3] glass-panel p-4 flex flex-col gap-4 relative overflow-hidden">
                 <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 z-10 absolute top-4 left-6">
                  <MapIcon className="w-4 h-4 text-[#3B82F6]" />
                  1. Digital Twin Observation
                </h3>
                <div className="flex-1 mt-8 w-full rounded-lg overflow-hidden border border-[#27272a]">
                  <DigitalTwin />
                </div>
              </div>

              <div className="flex items-center justify-center text-[#3f3f46]">
                <ArrowRight className="w-6 h-6" />
              </div>

              {/* Step 3: Decision & Action */}
              <div className="flex-[1] glass-panel p-6 flex flex-col gap-4">
                 <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#F59E0B]" />
                  2. Decision Intelligence
                </h3>
                <div className="flex-1 bg-[#09090b] rounded-lg border border-[#27272a] flex flex-col items-center justify-center p-4 text-center">
                   <div className="w-12 h-12 rounded-full bg-[#F59E0B]/20 flex items-center justify-center mb-4">
                     <AlertTriangle className="w-6 h-6 text-[#F59E0B]" />
                   </div>
                   <div className="text-xl font-bold text-white mb-2">1 Action Required</div>
                   <div className="text-xs text-slate-400">AI Recommendation Ready</div>
                   <button 
                     onClick={() => setActiveTab('decision-center')}
                     className="mt-6 w-full py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold rounded-lg transition-colors text-sm"
                   >
                     Review Decision
                   </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'vision-intelligence' && (
          <div className="flex-1 overflow-hidden">
            <MetroVisionIntelligence />
          </div>
        )}

        {activeTab === 'digital-twin' && (
          <div className="flex-1 rounded-xl overflow-hidden glass-panel relative h-[800px]">
             <DigitalTwin />
          </div>
        )}

        {activeTab === 'decision-center' && (
          <div className="flex-1 overflow-hidden h-[800px]">
            <DecisionCenterPage />
          </div>
        )}

        {activeTab === 'data-pipeline' && (
          <div className="flex-1 overflow-y-auto">
            <DataPipelinePage />
          </div>
        )}

        {activeTab === 'replay' && (
          <div className="flex-1">
             <DecisionReplay />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="grid grid-cols-2 gap-8 max-w-4xl">
            <div className="glass-panel p-6">
              <h2 className="text-lg font-bold mb-4 text-white">Scenario Triggers</h2>
              <p className="text-sm text-slate-400 mb-6">Select a scenario below to run the timeline simulations. (For demo purposes)</p>
              <ScenarioSimulator />
            </div>
            <div className="glass-panel p-6">
               <h2 className="text-lg font-bold mb-4 text-white">Role Settings</h2>
               <RoleOverlay />
            </div>
          </div>
        )}
      </main>

      <InfoModal 
        data={lineageModalData} 
        onClose={() => setLineageModalData(null)} 
      />
    </div>
  );
};

