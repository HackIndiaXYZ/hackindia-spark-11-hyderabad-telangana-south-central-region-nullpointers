import React from 'react';
import { X, Database, Cpu } from 'lucide-react';

export interface LineageData {
  title: string;
  type: 'LIVE DATA' | 'SIMULATED DATA' | 'DERIVED METRICS' | 'AI INSIGHTS';
  sourceName: string;
  hackathonSource: string;
  productionSource: string;
  refreshRate: string;
  logic: string;
  usage: string;
}

interface InfoModalProps {
  data: LineageData | null;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ data, onClose }) => {
  if (!data) return null;

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'LIVE DATA': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'SIMULATED DATA': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'DERIVED METRICS': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      default: return 'text-amber-400 bg-amber-500/10 border-amber-500/20 animate-pulse';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blur background */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-filter backdrop-blur-xl transition-all duration-300 animate-in fade-in" 
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md glass-panel-heavy rounded-2xl p-6 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-300 border border-indigo-500/25 shadow-2xl shadow-indigo-500/10">
        
        {/* Decorative glow lines */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title & Badge */}
        <div className="text-left mb-6">
          <span className={`inline-flex px-2 py-0.5 rounded border text-[9px] font-mono font-bold tracking-widest uppercase mb-2 ${getTypeStyle(data.type)}`}>
            {data.type}
          </span>
          <h3 className="text-lg font-bold text-white tracking-tight">{data.title}</h3>
        </div>

        {/* Lineage Table */}
        <div className="space-y-4 text-left text-xs">
          
          <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-3">
            <div>
              <span className="text-white/30 text-[9px] font-mono uppercase block">Data Feed</span>
              <span className="text-white font-semibold flex items-center gap-1.5 mt-0.5">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                {data.sourceName}
              </span>
            </div>
            <div>
              <span className="text-white/30 text-[9px] font-mono uppercase block">Refresh Interval</span>
              <span className="text-white font-mono mt-0.5 block">{data.refreshRate}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 border-b border-white/5 pb-3">
            <div>
              <span className="text-white/30 text-[9px] font-mono uppercase block">Mock Data (Hackathon)</span>
              <span className="text-indigo-300 font-mono mt-0.5 block">{data.hackathonSource}</span>
            </div>
            <div>
              <span className="text-white/30 text-[9px] font-mono uppercase block">Equipment (Production)</span>
              <span className="text-green-400 font-mono mt-0.5 block">{data.productionSource}</span>
            </div>
          </div>

          <div>
            <span className="text-white/30 text-[9px] font-mono uppercase block mb-1">How it's calculated</span>
            <p className="text-white/70 font-light leading-relaxed">
              {data.logic}
            </p>
          </div>

          <div>
            <span className="text-white/30 text-[9px] font-mono uppercase block mb-1 flex items-center gap-1">
              <Cpu className="w-3 h-3 text-indigo-400" />
              How the platform uses it
            </span>
            <p className="text-white/70 font-light leading-relaxed">
              {data.usage}
            </p>
          </div>

        </div>

        <button 
          onClick={onClose}
          className="w-full mt-6 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 font-medium text-xs tracking-wider uppercase transition-all cursor-pointer"
        >
          Close Details
        </button>

      </div>
    </div>
  );
};
