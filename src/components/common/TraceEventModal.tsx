import React from 'react';
import { X, Server, Brain, Activity, Target, ShieldAlert, Video, Radio, Navigation, Thermometer, Box, ShieldCheck, HeartPulse, Smartphone } from 'lucide-react';
import type { LiveEvent } from '../../context/AppStateContext';

interface TraceEventModalProps {
  event: LiveEvent | null;
  onClose: () => void;
}

export const TraceEventModal: React.FC<TraceEventModalProps> = ({ event, onClose }) => {
  if (!event) return null;

  const getSourceIcon = (source: string) => {
    const s = source.toLowerCase();
    if (s.includes('cctv')) return <Video className="w-5 h-5 text-indigo-400" />;
    if (s.includes('afc')) return <Radio className="w-5 h-5 text-emerald-400" />;
    if (s.includes('ats')) return <Navigation className="w-5 h-5 text-blue-400" />;
    if (s.includes('weather')) return <Thermometer className="w-5 h-5 text-yellow-400" />;
    if (s.includes('traffic')) return <Navigation className="w-5 h-5 text-orange-400" />;
    if (s.includes('escalator') || s.includes('lift')) return <Box className="w-5 h-5 text-slate-400" />;
    if (s.includes('security')) return <ShieldAlert className="w-5 h-5 text-red-400" />;
    if (s.includes('medical')) return <HeartPulse className="w-5 h-5 text-rose-400" />;
    if (s.includes('sos')) return <Smartphone className="w-5 h-5 text-pink-400" />;
    return <Server className="w-5 h-5 text-slate-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blur background */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-filter backdrop-blur-sm transition-all duration-300 animate-in fade-in" 
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl bg-[#0B1120] rounded-xl p-8 overflow-y-auto max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-300 border border-slate-700 shadow-2xl">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8 border-b border-slate-800 pb-6">
          <div className="p-3 bg-slate-800 rounded-lg">
            {getSourceIcon(event.source)}
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Event Trace Lineage</div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
              {event.source} 
              <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-1 rounded">
                ID: {event.packetId || event.id}
              </span>
            </h2>
          </div>
        </div>

        {/* The Pipeline */}
        <div className="flex flex-col gap-0 relative">
          
          {/* Vertical Line Connecting Nodes */}
          <div className="absolute left-[27px] top-8 bottom-8 w-0.5 bg-slate-800 z-0"></div>

          {/* Node 1: Raw Input */}
          <div className="flex gap-6 relative z-10 mb-8 group">
            <div className="w-14 h-14 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center shrink-0 group-hover:border-indigo-500 transition-colors">
              <Server className="w-6 h-6 text-slate-400 group-hover:text-indigo-400" />
            </div>
            <div className="flex-1 bg-slate-900/50 rounded-xl p-5 border border-slate-800 group-hover:border-indigo-500/50 transition-colors">
              <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">Stage 1: Ingestion</div>
              <h3 className="text-lg font-bold text-slate-200 mb-2">Raw Input</h3>
              <p className="text-sm font-mono text-slate-400 bg-slate-950 p-3 rounded-lg border border-slate-800">
                {event.rawInput || 'No raw data captured.'}
              </p>
            </div>
          </div>

          {/* Node 2: AI Model */}
          <div className="flex gap-6 relative z-10 mb-8 group">
            <div className="w-14 h-14 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center shrink-0 group-hover:border-blue-500 transition-colors">
              <Brain className="w-6 h-6 text-slate-400 group-hover:text-blue-400" />
            </div>
            <div className="flex-1 bg-slate-900/50 rounded-xl p-5 border border-slate-800 group-hover:border-blue-500/50 transition-colors">
              <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">Stage 2: Processing</div>
              <h3 className="text-lg font-bold text-slate-200 mb-2">AI Model Applied</h3>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 font-bold text-sm">
                <ShieldCheck className="w-4 h-4" />
                {event.aiModel || 'Standard Parsing'}
              </div>
            </div>
          </div>

          {/* Node 3: Extracted Insights */}
          <div className="flex gap-6 relative z-10 mb-8 group">
            <div className="w-14 h-14 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center shrink-0 group-hover:border-emerald-500 transition-colors">
              <Activity className="w-6 h-6 text-slate-400 group-hover:text-emerald-400" />
            </div>
            <div className="flex-1 bg-slate-900/50 rounded-xl p-5 border border-slate-800 group-hover:border-emerald-500/50 transition-colors">
              <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">Stage 3: Extraction</div>
              <h3 className="text-lg font-bold text-slate-200 mb-2">Extracted Insights</h3>
              <p className="text-sm text-slate-300">
                {event.extractedInsights || event.message}
              </p>
            </div>
          </div>

          {/* Node 4: Context Fusion & Prediction */}
          <div className="flex gap-6 relative z-10 mb-8 group">
            <div className="w-14 h-14 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center shrink-0 group-hover:border-purple-500 transition-colors">
              <Target className="w-6 h-6 text-slate-400 group-hover:text-purple-400" />
            </div>
            <div className="flex-1 bg-slate-900/50 rounded-xl p-5 border border-slate-800 group-hover:border-purple-500/50 transition-colors">
              <div className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-2">Stage 4: Operational Reasoning</div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 mb-1">Context Fusion</h3>
                  <p className="text-sm text-slate-200">{event.contextFusion || 'Standalone event'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-400 mb-1">Prediction</h3>
                  <p className="text-sm text-slate-200">{event.prediction || 'No immediate risk predicted'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Node 5: Decision */}
          <div className="flex gap-6 relative z-10 group">
            <div className="w-14 h-14 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center shrink-0 group-hover:border-rose-500 transition-colors">
              <ShieldAlert className="w-6 h-6 text-slate-400 group-hover:text-rose-400" />
            </div>
            <div className="flex-1 bg-slate-900/50 rounded-xl p-5 border border-slate-800 group-hover:border-rose-500/50 transition-colors">
              <div className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-2">Stage 5: Intelligence Output</div>
              <h3 className="text-lg font-bold text-slate-200 mb-2">Decision Triggered</h3>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 font-bold text-sm">
                {event.decision || 'No action required'}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
