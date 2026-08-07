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
  const { activeScenario, selectScenario, isMissionControlActive } = useAppState();

  return (
    <div className="w-full glass-panel rounded-2xl flex flex-col p-5 overflow-hidden">
      
      {/* Header HUD */}
      <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Play className="w-4 h-4 text-indigo-400" />
          <span className="font-mono text-xs uppercase tracking-widest text-white/70">TELEMETRY SCENARIOS</span>
        </div>
        <span className="font-mono text-[9px] text-white/30 uppercase">7 PROFILES LOADED</span>
      </div>

      {/* Scenarios Grid */}
      <div className="flex flex-col gap-2.5">
        {SCENARIOS.map((sc) => {
          const IconComponent = sc.icon;
          const isActive = activeScenario === sc.id;

          return (
            <button
              key={sc.id}
              disabled={isMissionControlActive}
              onClick={() => selectScenario(sc.id)}
              className={`group flex items-center justify-between p-3.5 rounded-xl border text-left transition-all duration-300 ${
                isActive
                  ? 'bg-white text-black border-white shadow-xl'
                  : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10 hover:border-white/10'
              } ${isMissionControlActive ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg flex items-center justify-center transition-colors ${
                  isActive ? 'bg-black/10 text-black' : 'bg-white/5 text-white/50 group-hover:text-white'
                }`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold tracking-wide">{sc.name}</span>
              </div>
              
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 border rounded uppercase ${
                isActive 
                  ? 'bg-black/15 text-black border-black/20' 
                  : sc.badgeColor
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
