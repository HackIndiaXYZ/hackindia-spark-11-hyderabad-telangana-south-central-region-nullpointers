import React from 'react';
import { useAppState } from '../context/AppStateContext';
import { Play, ShieldAlert, Cloud, Train, Activity, AlertOctagon, Sparkles, Zap } from 'lucide-react';

interface ScenarioOption {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  icon: any;
}

const SCENARIOS: ScenarioOption[] = [
  { id: 'normal', name: 'Nominal Operations', badge: 'Nominal', badgeColor: 'bg-green-500/10 text-green-400 border-green-500/20', icon: Sparkles },
  { id: 'heavy-rain', name: 'Heavy Rain Deluge', badge: 'Caution', badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Cloud },
  { id: 'metro-delay', name: 'Metro Transit Delay', badge: 'Caution', badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Train },
  { id: 'medical-emergency', name: 'Medical Emergency', badge: 'Critical', badgeColor: 'bg-red-500/10 text-red-400 border-red-500/20', icon: Activity },
  { id: 'gate-failure', name: 'Gate Scanner Failure', badge: 'Critical', badgeColor: 'bg-red-500/10 text-red-400 border-red-500/20', icon: AlertOctagon },
  { id: 'vip-arrival', name: 'VIP Arrival Sweeps', badge: 'Caution', badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: ShieldAlert },
  { id: 'power-failure', name: 'Power Grid Failure', badge: 'Critical', badgeColor: 'bg-red-500/10 text-red-400 border-red-500/20', icon: Zap }
];

export const ScenarioSimulator: React.FC = () => {
  const { activeScenario, selectScenario } = useAppState();

  return (
    <div className="w-full glass-panel rounded-2xl flex flex-col p-5 overflow-hidden">
      
      {/* Header HUD */}
      <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Play className="w-4 h-4 text-blue-500" />
          <span className="font-mono text-xs uppercase tracking-widest text-slate-400 font-bold">Scenario Profiles</span>
        </div>
        <span className="font-mono text-[9px] text-slate-500 font-bold uppercase">7 Active</span>
      </div>

      {/* Scenarios Grid */}
      <div className="flex flex-col gap-2">
        {SCENARIOS.map((sc) => {
          const IconComponent = sc.icon;
          const isActive = activeScenario === sc.id;

          return (
            <button
              key={sc.id}
              onClick={() => selectScenario(sc.id)}
              className={`group flex items-center justify-between p-3.5 rounded-xl border text-left transition-all duration-200 ${
                isActive
                  ? 'bg-[#181a24] border-l-2 border-l-blue-500 border-y-[#1d202d] border-r-[#1d202d] text-slate-100 font-semibold'
                  : 'bg-transparent border-transparent text-slate-400 hover:bg-zinc-800/40 hover:text-slate-200'
              } cursor-pointer`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg flex items-center justify-center border transition-colors ${
                  isActive 
                    ? 'bg-blue-600/10 text-blue-400 border-blue-500/20' 
                    : 'bg-zinc-800 text-slate-500 border-transparent group-hover:text-slate-350'
                }`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <span className="text-xs tracking-tight">{sc.name}</span>
              </div>
              
              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 border rounded uppercase ${
                isActive 
                  ? sc.badgeColor.replace('/10', '/20')
                  : 'bg-zinc-900 border-zinc-800 text-slate-500'
              }`}>
                {sc.badge}
              </span>
            </button>
          );
        })}
      </div>

    </div>
  );
};
