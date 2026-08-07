import React, { useEffect, useState } from 'react';
import { X, Camera, ScanLine, Target, Brain, Cpu, Waves, Loader2 } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import type { IngestFeed } from '../../context/AppStateContext';
import { analyzeDataSource } from '../../services/groqService';

interface SourcePreviewModalProps {
  feed: IngestFeed | null;
  onClose: () => void;
}

const MetroATSVisualizer = () => {
  const [trains, setTrains] = useState([
    { id: 'TRN-402', line: 'Blue Line', station: 'Secunderabad Stn', status: 'DWELLING (24s)', speed: 0, block: 'BLK-42A', health: 'OPTIMAL' },
    { id: 'TRN-119', line: 'Red Line', station: 'Miyapur -> Ameerpet', status: 'IN TRANSIT', speed: 64, block: 'BLK-18B', health: 'OPTIMAL' },
    { id: 'TRN-305', line: 'Blue Line', station: 'Hitec City', status: 'APPROACHING', speed: 38, block: 'BLK-51C', health: 'ATTENTION' },
    { id: 'TRN-208', line: 'Green Line', station: 'Begumpet Stn', status: 'SIGNAL HOLD', speed: 0, block: 'BLK-09F', health: 'DELAYED' },
  ]);

  const [logs, setLogs] = useState<Array<{ time: string; train: string; event: string; status: string }>>([
    { time: '05:02:40', train: 'TRN-402', event: 'Arrived at Secunderabad Platform 2', status: 'INFO' },
    { time: '05:02:25', train: 'TRN-119', event: 'Cleared Signal Interlock BLK-17A', status: 'SUCCESS' },
    { time: '05:02:10', train: 'TRN-305', event: 'Speed curve adjusted for station approach', status: 'INFO' },
    { time: '05:01:55', train: 'TRN-208', event: 'Automatic Train Protection (ATP) signal hold', status: 'WARN' },
  ]);

  useEffect(() => {
    const cycleEvents = [
      { train: 'TRN-402', event: 'Doors closed. Interlock verification complete', status: 'SUCCESS' },
      { train: 'TRN-402', event: 'Departed Secunderabad -> Next: Begumpet', status: 'INFO' },
      { train: 'TRN-119', event: 'Accelerating to 68 km/h on Block BLK-19A', status: 'INFO' },
      { train: 'TRN-305', event: 'Platform 1 Dwell timer initiated (45s)', status: 'INFO' },
      { train: 'TRN-208', event: 'Signal cleared BLK-09F. Resuming transit', status: 'SUCCESS' }
    ];

    let idx = 0;
    const interval = setInterval(() => {
      const current = cycleEvents[idx % cycleEvents.length];
      const now = new Date().toISOString().split('T')[1].slice(0, 8);
      
      setLogs(prev => [{ time: now, train: current.train, event: current.event, status: current.status }, ...prev].slice(0, 8));

      setTrains(prev => prev.map(t => {
        if (t.id === current.train) {
          if (current.event.includes('Departed')) return { ...t, status: 'IN TRANSIT', speed: 45 };
          if (current.event.includes('Accelerating')) return { ...t, speed: 68 };
          if (current.event.includes('Dwell')) return { ...t, status: 'DWELLING (45s)', speed: 0 };
          if (current.event.includes('Resuming')) return { ...t, status: 'IN TRANSIT', speed: 32, health: 'OPTIMAL' };
        }
        return t;
      }));

      idx++;
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full relative rounded-lg overflow-hidden border border-zinc-800 bg-[#09090b] flex flex-col p-5 font-mono text-xs shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]">
      <div className="text-emerald-500 mb-4 font-bold flex items-center justify-between border-b border-zinc-800 pb-3 uppercase tracking-widest text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10B981]" />
          <span>ATS Telemetry Telecommunication Feed</span>
        </div>
        <span className="text-zinc-500 text-[10px]">FREQ: 5.8 GHz CBTC</span>
      </div>

      {/* Active Train Matrix */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {trains.map(t => (
          <div key={t.id} className="bg-zinc-950 border border-zinc-800/80 p-2.5 rounded flex flex-col gap-1">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-bold text-slate-200">{t.id}</span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${t.health === 'OPTIMAL' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : t.health === 'ATTENTION' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                {t.health}
              </span>
            </div>
            <div className="text-zinc-400 text-[10px] truncate">{t.station}</div>
            <div className="flex justify-between items-center text-[10px] mt-1 pt-1 border-t border-zinc-900">
              <span className="text-emerald-400 font-semibold">{t.status}</span>
              <span className="text-zinc-500">{t.speed} km/h</span>
            </div>
          </div>
        ))}
      </div>

      {/* Structured Chronological Event Stream */}
      <div className="flex-1 border border-zinc-800/60 rounded bg-black/60 p-3 overflow-hidden flex flex-col">
        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2 flex justify-between">
          <span>Timestamp</span>
          <span>Unit</span>
          <span className="flex-1 ml-4">ATS Telemetry Interlock Log</span>
        </div>
        <div className="flex-1 flex flex-col gap-1.5 overflow-hidden">
          {logs.map((log, i) => (
            <div key={i} className="flex items-center gap-3 text-[11px] border-b border-zinc-900/50 pb-1" style={{ opacity: 1 - (i * 0.1) }}>
              <span className="text-zinc-500 font-mono">[{log.time}]</span>
              <span className="text-slate-300 font-bold w-16">{log.train}</span>
              <span className={`flex-1 truncate ${log.status === 'WARN' ? 'text-amber-400' : log.status === 'SUCCESS' ? 'text-emerald-400' : 'text-zinc-300'}`}>
                {log.event}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AFCGateVisualizer = () => {
  const [gates, setGates] = useState([
    { id: 'Gate 1', mode: 'ENTRY', count: 1420, rate: '24/min', status: 'NOMINAL', color: 'text-emerald-400' },
    { id: 'Gate 2', mode: 'ENTRY', count: 1890, rate: '42/min', status: 'HEAVY', color: 'text-amber-400' },
    { id: 'Gate 3', mode: 'ENTRY', count: 2150, rate: '56/min', status: 'CRITICAL', color: 'text-red-400' },
    { id: 'Gate 4', mode: 'EXIT', count: 980, rate: '18/min', status: 'NOMINAL', color: 'text-emerald-400' },
    { id: 'Gate 5', mode: 'BIDIRECTIONAL', count: 1100, rate: '12/min', status: 'NOMINAL', color: 'text-emerald-400' },
    { id: 'Gate 6', mode: 'BIDIRECTIONAL', count: 0, rate: '0/min', status: 'MAINTENANCE', color: 'text-zinc-500' },
  ]);

  const [gateLogs, setGateLogs] = useState<Array<{ time: string; gate: string; event: string; status: string }>>([
    { time: '05:12:40', gate: 'Gate 3', event: 'Tap-in frequency threshold warning (50+ pax/min)', status: 'WARN' },
    { time: '05:12:22', gate: 'Gate 2', event: 'Card validation timeout (retry success)', status: 'INFO' },
    { time: '05:12:05', gate: 'Gate 6', event: 'Switched to Maintenance Mode for diagnostics', status: 'INFO' },
    { time: '05:11:48', gate: 'Gate 1', event: 'Turnstile mechanical test complete', status: 'SUCCESS' },
  ]);

  useEffect(() => {
    const cycleEvents = [
      { gate: 'Gate 3', event: 'Passenger entry rate surge detected', status: 'WARN' },
      { gate: 'Gate 1', event: 'Passenger tapped successfully (NFC validation)', status: 'SUCCESS' },
      { gate: 'Gate 4', event: 'NFC reader response latency within normal parameters (45ms)', status: 'SUCCESS' },
      { gate: 'Gate 2', event: 'Turnstile gate cycle count reached limit', status: 'INFO' },
      { gate: 'Gate 5', event: 'Switched directional mode to: EXIT ONLY', status: 'INFO' },
    ];

    let idx = 0;
    const interval = setInterval(() => {
      const current = cycleEvents[idx % cycleEvents.length];
      const now = new Date().toISOString().split('T')[1].slice(0, 8);

      setGateLogs(prev => [{ time: now, gate: current.gate, event: current.event, status: current.status }, ...prev].slice(0, 8));

      setGates(prev => prev.map(g => {
        if (g.id === current.gate) {
          if (current.event.includes('surge')) return { ...g, rate: '62/min', status: 'CRITICAL', color: 'text-red-400' };
          if (current.event.includes('tapped')) return { ...g, count: g.count + 1 };
          if (current.event.includes('directional')) return { ...g, mode: 'EXIT' };
        }
        return g;
      }));

      idx++;
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full relative rounded-lg overflow-hidden border border-zinc-800 bg-[#09090b] flex flex-col p-5 font-mono text-xs shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]">
      <div className="text-emerald-500 mb-4 font-bold flex items-center justify-between border-b border-zinc-800 pb-3 uppercase tracking-widest text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10B981]" />
          <span>AFC Turnstile Live Intake Telemetry</span>
        </div>
        <span className="text-zinc-500 text-[10px]">PROTOCOL: RFC-1049 AFC-TCP</span>
      </div>

      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {gates.map(g => (
          <div key={g.id} className="bg-zinc-950 border border-zinc-800/80 p-2.5 rounded flex flex-col gap-1">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-bold text-slate-200">{g.id}</span>
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                g.status === 'NOMINAL' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                g.status === 'HEAVY' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                g.status === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border border-red-500/30 animate-pulse' :
                'bg-zinc-500/10 text-zinc-400 border border-zinc-500/30'
              }`}>
                {g.status}
              </span>
            </div>
            <div className="text-zinc-400 text-[10px]">MODE: {g.mode}</div>
            <div className="text-zinc-500 text-[9px]">TOTAL TAPS: {g.count}</div>
            <div className="flex justify-between items-center text-[10px] mt-1 pt-1 border-t border-zinc-900">
              <span className="text-slate-400">Rate:</span>
              <span className={`font-semibold ${g.color}`}>{g.rate}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1 border border-zinc-800/60 rounded bg-black/60 p-3 overflow-hidden flex flex-col">
        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2 flex justify-between">
          <span>Timestamp</span>
          <span>Gate ID</span>
          <span className="flex-1 ml-4">Turnstile Event / Alarm Log</span>
        </div>
        <div className="flex-1 flex flex-col gap-1.5 overflow-hidden">
          {gateLogs.map((log, i) => (
            <div key={i} className="flex items-center gap-3 text-[11px] border-b border-zinc-900/50 pb-1" style={{ opacity: 1 - (i * 0.12) }}>
              <span className="text-zinc-500 font-mono">[{log.time}]</span>
              <span className="text-slate-300 font-bold w-16">{log.gate}</span>
              <span className={`flex-1 truncate ${
                log.status === 'WARN' ? 'text-amber-400' :
                log.status === 'SUCCESS' ? 'text-emerald-400' :
                'text-zinc-300'
              }`}>
                {log.event}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const WeatherRadarVisualizer = () => {
  return (
    <div className="w-full h-full relative rounded-lg overflow-hidden border border-zinc-800 bg-[#09090b] flex flex-col p-5 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]">
      <div className="text-emerald-500 mb-2 font-mono text-xs font-bold flex items-center justify-between border-b border-zinc-800 pb-3 uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10B981]" />
          <span>IMD Doppler Weather Radar (Sector 4)</span>
        </div>
        <span className="text-zinc-500 text-[10px]">RADAR ID: HYD-DOP-02</span>
      </div>

      <div className="flex-1 flex gap-4 items-center">
        <div className="relative w-64 h-64 rounded-full border border-emerald-500/30 flex items-center justify-center overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.1)] bg-emerald-950/10">
           <div className="absolute inset-4 border border-emerald-500/20 rounded-full" />
           <div className="absolute inset-16 border border-emerald-500/20 rounded-full" />
           <div className="absolute inset-28 border border-emerald-500/20 rounded-full" />
           <div className="absolute w-full h-[1px] bg-emerald-500/20" />
           <div className="absolute h-full w-[1px] bg-emerald-500/20" />
           
           <div className="absolute inset-0 origin-center animate-spin" style={{ animationDuration: '4s', background: 'conic-gradient(from 0deg, transparent 70%, rgba(16, 185, 129, 0.1) 95%, rgba(16, 185, 129, 0.8) 100%)' }} />
           
           <div className="absolute w-4 h-4 bg-amber-500/80 rounded-full blur-[2px] top-16 left-24 animate-pulse" />
           <div className="absolute w-7 h-7 bg-emerald-400/60 rounded-full blur-[4px] bottom-16 right-16 animate-pulse" />
        </div>

        <div className="flex-1 flex flex-col gap-3 font-mono text-xs">
          <div className="bg-zinc-950 border border-zinc-800 p-3 rounded flex flex-col gap-1">
            <span className="text-zinc-500 text-[10px] font-bold uppercase">Precipitation Band</span>
            <span className="text-slate-200 font-bold text-sm">Light Drizzle (1.4 mm/hr)</span>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 p-3 rounded flex flex-col gap-1">
            <span className="text-zinc-500 text-[10px] font-bold uppercase">Wind Velocity</span>
            <span className="text-emerald-400 font-bold text-sm">18 km/h NW</span>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 p-3 rounded flex flex-col gap-1">
            <span className="text-zinc-500 text-[10px] font-bold uppercase">Station Visibility</span>
            <span className="text-slate-200 font-bold text-sm">4.2 km (Clear Operating Limit)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const TrafficHeatmapVisualizer = () => {
  const corridors = [
    { name: 'Ameerpet -> Begumpet Station Rd', speed: '14 km/h', status: 'HEAVY CONGESTION', color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/40' },
    { name: 'Secunderabad Station Access Rd', speed: '22 km/h', status: 'MODERATE DENSITY', color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/40' },
    { name: 'Hitec City Metro Flyover', speed: '48 km/h', status: 'CLEAR FLOW', color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/40' },
    { name: 'LB Nagar Corridor 1', speed: '42 km/h', status: 'CLEAR FLOW', color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/40' },
  ];

  return (
    <div className="w-full h-full relative rounded-lg overflow-hidden border border-zinc-800 bg-[#09090b] flex flex-col p-5 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]">
      <div className="text-amber-500 mb-4 font-mono text-xs font-bold flex items-center justify-between border-b border-zinc-800 pb-3 uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_#F59E0B]" />
          <span>Station Vicinity Congestion Telemetry</span>
        </div>
        <span className="text-zinc-500 text-[10px]">INDUCTIVE LOOP ARRAY</span>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-3 font-mono">
        {corridors.map((c, i) => (
          <div key={i} className={`p-3.5 rounded border flex flex-col justify-between ${c.bg}`}>
            <div className="text-xs font-bold text-slate-200">{c.name}</div>
            <div className="mt-2 flex justify-between items-end">
              <div>
                <div className="text-[10px] text-zinc-400 uppercase font-semibold">Avg Speed</div>
                <div className="text-sm font-bold text-slate-100">{c.speed}</div>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${c.color}`}>{c.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SourcePreviewModal: React.FC<SourcePreviewModalProps> = ({ feed, onClose }) => {
  const [boxes, setBoxes] = useState<Array<{id: number, x: number, y: number, w: number, h: number, label: string, conf: number}>>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const { liveEventsLog, currentRole } = useAppState();

  const recentEvent = feed ? liveEventsLog.find(e => e.source === feed.name) : null;

  useEffect(() => {
    if (!feed) return;
    
    let isMounted = true;
    const fetchAnalysis = async () => {
      setIsAnalyzing(true);
      setAiAnalysis('');
      const analysis = await analyzeDataSource(feed.id, feed.name, feed.status, currentRole);
      if (isMounted) {
        setAiAnalysis(analysis);
        setIsAnalyzing(false);
      }
    };
    fetchAnalysis();

    return () => { isMounted = false; };
  }, [feed, currentRole]);

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
      <div className="bg-[#09090b] border border-[#27272a] rounded-xl w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col h-[80vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#27272a] bg-gradient-to-r from-[#18181b] to-[#09090b]">
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
          <div className="flex-1 border-r border-[#27272a] bg-black relative overflow-hidden group p-4">
            {feed.id === 'cctv' ? (
              <div className="w-full h-full relative rounded-lg overflow-hidden border border-zinc-800">
                {/* Background Video */}
                <video 
                  src="/Crowd-at-Ameerpet-Metro-Station.mp4" 
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-luminosity"
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
            ) : feed.id === 'transit' ? (
              <MetroATSVisualizer />
            ) : feed.id === 'weather' ? (
              <WeatherRadarVisualizer />
            ) : feed.id === 'traffic' ? (
              <TrafficHeatmapVisualizer />
            ) : feed.id === 'afc' ? (
              <AFCGateVisualizer />
            ) : (
              <div className="w-full h-full relative rounded-lg overflow-hidden border border-zinc-800 bg-[#09090b] flex flex-col">
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
          <div className="w-80 bg-[#09090b] flex flex-col p-6 overflow-y-auto">
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
                    <span className="text-sm font-bold">{recentEvent?.aiModel || feed.hackathonSource}</span>
                    <span className="text-[10px] font-mono">Latency: {Math.floor(12 + Math.random() * 20)}ms</span>
                  </div>
                </div>
              </div>

              {feed.id === 'cctv' && (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Real-time Detections</span>
                  <div className="bg-[#18181b] border border-[#27272a] p-4 rounded-lg flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Persons in view</span>
                      <span className="text-lg font-bold text-slate-200">
                        {recentEvent?.extractedInsights?.match(/People:\s*(\d+)/)?.[1] || '127'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Avg Crowd Speed</span>
                      <span className="text-lg font-bold text-slate-200">
                        {recentEvent?.extractedInsights?.match(/Avg Speed:\s*([\d\.]+\s*m\/s)/)?.[1] || '0.8 m/s'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Density Anomaly</span>
                      <span className="text-lg font-bold text-[#F59E0B]">
                        {recentEvent ? 'Detected (Exit B)' : 'Monitoring'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {feed.id !== 'cctv' && (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Live Telemetry Stats</span>
                  <div className="bg-[#18181b] border border-[#27272a] p-4 rounded-lg flex flex-col gap-3">
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
              <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-[#27272a]">
                <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-2">
                  <Target className="w-3 h-3 text-emerald-400" />
                  AI Source Deep Dive
                </span>
                
                <div className="bg-[#18181b] border border-[#27272a] p-4 rounded-lg flex flex-col gap-3 min-h-[120px]">
                  {isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                      <span className="text-xs font-mono animate-pulse">Querying RAG & LLaMA-3...</span>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {aiAnalysis || "Analysis failed."}
                    </div>
                  )}
                </div>
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
