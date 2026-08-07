import React, { useEffect, useState } from 'react';
import { X, Camera, ScanLine, Target, Brain, Cpu, Waves } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import type { IngestFeed } from '../../context/AppStateContext';

interface SourcePreviewModalProps {
  feed: IngestFeed | null;
  onClose: () => void;
}

export const SourcePreviewModal: React.FC<SourcePreviewModalProps> = ({ feed, onClose }) => {
  const [boxes, setBoxes] = useState<Array<{id: number, x: number, y: number, w: number, h: number, label: string, conf: number}>>([]);
  const { liveEventsLog } = useAppState();

  const recentEvent = feed ? liveEventsLog.find(e => e.source === feed.name) : null;

  useEffect(() => {
    if (!feed || feed.id !== 'cctv') return;
    
    // Simulate YOLO bounding boxes moving slightly
    const generateBoxes = () => {
      const newBoxes = [];
      for (let i = 0; i < 12; i++) {
        newBoxes.push({
          id: i,
          x: 10 + Math.random() * 80,
          y: 30 + Math.random() * 50,
          w: 4 + Math.random() * 8,
          h: 15 + Math.random() * 10,
          label: 'person',
          conf: 0.85 + Math.random() * 0.14
        });
      }
      return newBoxes;
    };

    setBoxes(generateBoxes());

    const interval = setInterval(() => {
      setBoxes(prev => prev.map(b => ({
        ...b,
        x: b.x + (Math.random() - 0.5) * 2,
        y: b.y + (Math.random() - 0.5) * 1,
        conf: Math.min(0.99, Math.max(0.70, b.conf + (Math.random() - 0.5) * 0.1))
      })));
    }, 500);

    return () => clearInterval(interval);
  }, [feed]);

  if (!feed) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-8 font-sans">
      <div className="bg-[#050A15] border border-[#1F2937] rounded-xl w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col h-[80vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1F2937] bg-gradient-to-r from-[#0F172A] to-[#050A15]">
          <div className="flex items-center gap-3">
            <Camera className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="font-bold text-slate-200">{feed.name} Preview</h2>
              <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Live Inference Stream • {feed.productionSource}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Main Visualizer */}
          <div className="flex-1 border-r border-[#1F2937] bg-black relative overflow-hidden group p-4">
            {feed.id === 'cctv' ? (
              <div className="w-full h-full relative rounded-lg overflow-hidden border border-zinc-800">
                {/* Background Image */}
                <img 
                  src="/cctv-bg.png" 
                  alt="CCTV Feed" 
                  className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity"
                />
                
                {/* Glitch/Scanline effect overlay */}
                <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-[150%] animate-[scan_4s_linear_infinite] pointer-events-none" />

                {/* Bounding Boxes */}
                {boxes.map(b => (
                  <div 
                    key={b.id}
                    className="absolute border-[1.5px] border-emerald-500 bg-emerald-500/10 transition-all duration-500 ease-linear"
                    style={{
                      left: `${b.x}%`,
                      top: `${b.y}%`,
                      width: `${b.w}%`,
                      height: `${b.h}%`,
                    }}
                  >
                    <div className="absolute -top-4 left-[-1px] bg-emerald-500 text-black text-[8px] font-bold px-1 whitespace-nowrap">
                      {b.label} {(b.conf * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}

                {/* HUD Overlay */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 text-right">
                  <div className="text-red-500 font-mono text-xs font-bold animate-pulse flex items-center gap-2 justify-end">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    LIVE
                  </div>
                  <div className="text-emerald-400 font-mono text-[10px]">FPS: {Math.floor(28 + Math.random() * 4)}</div>
                  <div className="text-emerald-400 font-mono text-[10px]">RES: 1920x1080</div>
                </div>

                {/* Reticle */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
                  <ScanLine className="w-32 h-32 text-emerald-500 animate-[spin_10s_linear_infinite]" />
                </div>
              </div>
            ) : (
              <div className="w-full h-full relative rounded-lg overflow-hidden border border-zinc-800 bg-[#050A15] flex flex-col">
                <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay pointer-events-none" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-6 font-mono p-8 text-center">
                  <div className="relative">
                    <Waves className="w-16 h-16 text-blue-500 opacity-50 animate-pulse" />
                    <div className="absolute inset-0 animate-ping opacity-20 bg-blue-500 rounded-full" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-bold text-slate-300">STREAM ACTIVE</p>
                    <p className="text-xs text-slate-500 uppercase tracking-widest">{feed.productionSource}</p>
                  </div>
                  <div className="w-full max-w-md h-32 bg-black border border-zinc-800 rounded flex items-end p-2 gap-1 overflow-hidden opacity-50">
                    {/* Simulated live chart bars */}
                    {Array.from({length: 30}).map((_, i) => (
                      <div 
                        key={i} 
                        className="flex-1 bg-blue-500/40 rounded-t" 
                        style={{ 
                          height: `${20 + Math.random() * 80}%`,
                          animation: `pulse ${1 + Math.random()}s infinite`
                        }} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI Output Panel */}
          <div className="w-80 bg-[#0A0F1C] flex flex-col p-6 overflow-y-auto">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-400" />
              Inference Engine
            </h3>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Active Model</span>
                <div className="flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/30 p-3 rounded-lg text-indigo-400">
                  <Cpu className="w-5 h-5" />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">{feed.hackathonSource}</span>
                    <span className="text-[10px] font-mono">Latency: {Math.floor(12 + Math.random() * 20)}ms</span>
                  </div>
                </div>
              </div>

              {feed.id === 'cctv' && (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Real-time Detections</span>
                  <div className="bg-[#111827] border border-[#1F2937] p-4 rounded-lg flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Persons in view</span>
                      <span className="text-lg font-bold text-slate-200">{boxes.length * 9}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Avg Crowd Speed</span>
                      <span className="text-lg font-bold text-slate-200">0.8 m/s</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Density Anomaly</span>
                      <span className="text-lg font-bold text-[#F59E0B]">Detected</span>
                    </div>
                  </div>
                </div>
              )}

              {feed.id !== 'cctv' && (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Live Telemetry Stats</span>
                  <div className="bg-[#111827] border border-[#1F2937] p-4 rounded-lg flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Signal Integrity</span>
                      <span className="text-lg font-bold text-[#10B981]">99.9%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Data Throughput</span>
                      <span className="text-lg font-bold text-slate-200">{(Math.random() * 5 + 1).toFixed(1)} MB/s</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Actionable Intelligence / Predictions */}
              <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-[#1F2937]">
                <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-2">
                  <Target className="w-3 h-3 text-emerald-400" />
                  Actionable Intelligence
                </span>
                
                {recentEvent ? (
                  <div className="flex flex-col gap-3">
                    <div className="bg-[#111827] border border-[#1F2937] p-3 rounded-lg flex flex-col gap-1">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Extracted Insights</span>
                      <span className="text-xs text-slate-300">{recentEvent.extractedInsights || recentEvent.message}</span>
                    </div>
                    <div className="bg-[#111827] border border-blue-900/30 p-3 rounded-lg flex flex-col gap-1 relative overflow-hidden">
                      <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay pointer-events-none" />
                      <span className="text-[9px] text-blue-400 font-bold uppercase tracking-wider">Prediction</span>
                      <span className="text-xs text-blue-100 font-semibold">{recentEvent.prediction || 'Normal operation predicted.'}</span>
                    </div>
                    <div className="bg-[#111827] border border-emerald-900/30 p-3 rounded-lg flex flex-col gap-1 relative overflow-hidden">
                      <div className="absolute inset-0 bg-emerald-500/5 mix-blend-overlay pointer-events-none" />
                      <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">System Action</span>
                      <span className="text-xs text-emerald-100 font-bold">{recentEvent.decision || 'Continue standard monitoring.'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 font-mono italic p-4 text-center border border-[#1F2937] border-dashed rounded-lg">
                    Awaiting anomaly detection...
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}} />
    </div>
  );
};
