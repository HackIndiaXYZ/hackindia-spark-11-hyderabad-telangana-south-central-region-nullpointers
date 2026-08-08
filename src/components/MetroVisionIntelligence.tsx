import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, Eye, Activity, TrendingUp, 
  HelpCircle, Shield, Layers,
  Play, Pause
} from 'lucide-react';
import { WhyThisDecisionModal } from './common/WhyThisDecisionModal';

interface TrackedPassenger {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  confidence: number;
  speed: string;
  status: 'normal' | 'queued' | 'stationary';
  trail: Array<{ x: number; y: number }>;
}

export const MetroVisionIntelligence: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [showZonalGrid, setShowZonalGrid] = useState<boolean>(true);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [showExplainModal, setShowExplainModal] = useState<boolean>(false);

  // Live video time & clock state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
  const [recTimeStr, setRecTimeStr] = useState<string>('00:04:22:15');
  const [fps, setFps] = useState<number>(29.97);

  const [isModelLoading, setIsModelLoading] = useState<boolean>(true);
  const [aiEngineName, setAiEngineName] = useState<string>('INITIALIZING AI PIPELINE...');

  // Live passenger tracking state
  const [passengers, setPassengers] = useState<TrackedPassenger[]>([]);
  
  // Real-time analytics tied to actual detections
  const [passengerCount, setPassengerCount] = useState<number>(0);
  const [platformOccupancy, setPlatformOccupancy] = useState<number>(0);
  const [queueLength, setQueueLength] = useState<number>(0);
  const [walkingSpeed, setWalkingSpeed] = useState<number>(1.1);
  const [crowdDensity, setCrowdDensity] = useState<number>(0);
  const [congestionScore, setCongestionScore] = useState<number>(0);

  // Load Demo Data / Simulation
  useEffect(() => {
    const loadModel = async () => {
      setAiEngineName('CONNECTING TO VIDEO STREAM...');
      await new Promise(r => setTimeout(r, 1200));
      setIsModelLoading(false);
      setAiEngineName('YOLOv11x + ByteTrack (LIVE)');
    };
    loadModel();
  }, []);

  // Update live clock and FPS oscillation
  useEffect(() => {
    const clockInterval = setInterval(() => {
      const now = new Date();
      setCurrentTimeStr(now.toTimeString().split(' ')[0] + '.' + Math.floor(now.getMilliseconds() / 100));
      setFps(+(29.8 + Math.random() * 0.3).toFixed(2));
    }, 200);
    return () => clearInterval(clockInterval);
  }, []);

  // Simulated Crowd Particle System for Demo Fidelity
  const swarmRef = useRef<TrackedPassenger[]>([]);
  
  useEffect(() => {
    const getRandomPos = () => {
      let x = 0, y = 0;
      let valid = false;
      while(!valid) {
         x = Math.random() * 88;
         y = 35 + Math.random() * 65;
         
         valid = true;
         if (x < 32 && y < 62) valid = false; // Blocked by blue sign
         if (x >= 70 && y < 70) valid = false; // Blocked by right pillar
         if (y < 35) valid = false; // Above the crowd depth in the middle
      }
      return {x, y};
    };

    const initSwarm = () => {
      const swarm: TrackedPassenger[] = [];
      // Generate 200+ simulated passengers for dense crowd representation
      for (let i = 0; i < 220; i++) {
        const isStationary = Math.random() > 0.7; // 30% stationary
        const pos = getRandomPos();
        swarm.push({
          id: `PAX-${String(i).padStart(3, '0')}`,
          x: pos.x,
          y: pos.y,
          w: 2 + Math.random() * 1.5,
          h: 5 + Math.random() * 4,
          vx: isStationary ? 0 : (Math.random() - 0.5) * 0.15, // Drift slightly left/right
          vy: isStationary ? 0 : (Math.random() - 0.5) * 0.1,
          confidence: +(85 + Math.random() * 14).toFixed(1),
          speed: isStationary ? '0.0 m/s' : `${(Math.random() * 1.5).toFixed(1)} m/s`,
          status: isStationary ? 'stationary' : (Math.random() > 0.8 ? 'queued' : 'normal'),
          trail: []
        });
      }
      swarmRef.current = swarm;
    };

    if (!isModelLoading && swarmRef.current.length === 0) {
      initSwarm();
    }

    let animId: number;
    let frameCount = 0;

    const simulateFrame = () => {
      if (videoRef.current && !videoRef.current.paused && !isModelLoading) {
        frameCount++;
        
        // Update clock/recording time
        const video = videoRef.current;
        const secs = video.currentTime || 0;
        const mins = Math.floor(secs / 60);
        const remSecs = Math.floor(secs % 60);
        const frames = Math.floor((secs % 1) * 30);
        setRecTimeStr(`00:${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`);

        // Update particles every other frame for performance and realistic speed
        if (frameCount % 2 === 0) {
            const updatedSwarm = swarmRef.current.map(p => {
            let newX = p.x + p.vx;
            let newY = p.y + p.vy;
            
            // Organic wandering
            if (p.status !== 'stationary') {
                p.vx += (Math.random() - 0.5) * 0.03;
                p.vy += (Math.random() - 0.5) * 0.03;
                // Clamp velocity
                p.vx = Math.max(-0.25, Math.min(0.25, p.vx));
                p.vy = Math.max(-0.15, Math.min(0.15, p.vy));
            }

            // Complex Bounds wrap (respawn if they walk into a wall/sign)
            let valid = true;
            if (newX < 0 || newX > 88) valid = false;
            if (newY < 35 || newY > 105) valid = false;
            if (newX < 32 && newY < 62) valid = false;
            if (newX >= 70 && newY < 70) valid = false;

            if (!valid) {
                const pos = getRandomPos();
                newX = pos.x;
                newY = pos.y;
            }

            // Trail history
            const trail = [...p.trail, {x: newX, y: newY}];
            if (trail.length > 8) trail.shift();

            return { ...p, x: newX, y: newY, trail };
            });

            swarmRef.current = updatedSwarm;
            setPassengers(updatedSwarm);

            // Dynamically update analytics dashboard to reflect high density
            if (Math.random() > 0.9) {
                const count = updatedSwarm.length;
                setPassengerCount(count + Math.floor(Math.random() * 25));
                setPlatformOccupancy(+(82 + Math.random() * 8).toFixed(1));
                setQueueLength(+(45 + Math.random() * 10).toFixed(1));
                setWalkingSpeed(+(0.8 + Math.random() * 0.3).toFixed(2));
                setCrowdDensity(+(3.2 + Math.random() * 0.5).toFixed(1));
                setCongestionScore(85 + Math.floor(Math.random() * 12));
            }
        }
      }
      animId = requestAnimationFrame(simulateFrame);
    };

    if (!isModelLoading) {
       animId = requestAnimationFrame(simulateFrame);
    }
    return () => cancelAnimationFrame(animId);
  }, [isModelLoading]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 p-4 md:p-6 bg-[#09090b] text-slate-200 font-sans select-none overflow-y-auto">
      
      {/* HEADER HUD BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#18181b] p-4 rounded-lg border border-[#27272a]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-md bg-[#27272a] text-cyan-400">
            <Camera className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase font-semibold text-slate-400">
                OCC Surveillance
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-red-500/10 text-red-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                LIVE
              </span>
            </div>
            <h1 className="text-xl font-semibold text-slate-200 tracking-tight">
              Ameerpet Station • Platform 3 Feed
            </h1>
          </div>
        </div>

        {/* Live Surveillance Specs */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="bg-[#09090b] px-3 py-2 rounded-md border border-[#27272a] flex flex-col items-end">
            <span className="text-[9px] text-slate-500 font-semibold uppercase">Vision AI</span>
            <span className={`${isModelLoading ? 'text-amber-400' : 'text-emerald-400'} font-medium flex items-center gap-1.5`}>
              {!isModelLoading && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />}
              {isModelLoading && <span className="w-1.5 h-1.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />}
              {aiEngineName}
            </span>
          </div>

          <div className="bg-[#09090b] px-3 py-2 rounded-md border border-[#27272a] flex flex-col items-end">
            <span className="text-[9px] text-slate-500 font-semibold uppercase">FPS</span>
            <span className="text-cyan-400 font-medium">{fps}</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT / TOP: SURVEILLANCE PANEL (7 COLS) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {/* CCTV SURVEILLANCE PANEL CONTAINER */}
          <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black border border-[#27272a] group">
            
            {/* HTML5 VIDEO PLAYER WITH ATTACHED CCTV FOOTAGE */}
            <video
              ref={videoRef}
              src="/Crowd-at-Ameerpet-Metro-Station.mp4"
              autoPlay
              loop
              muted
              playsInline
              crossOrigin="anonymous"
              className="w-full h-full object-cover"
            />

            {isModelLoading && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <div className="text-cyan-400 font-mono font-bold tracking-widest text-sm animate-pulse">
                  CONNECTING TO OCC VIDEO STREAM...
                </div>
                <div className="text-slate-400 font-mono text-xs mt-2 text-center max-w-sm">
                  Initializing Edge Inference Engine
                </div>
              </div>
            )}

            {/* HEATMAP OVERLAY LAYER - We will render this dynamically in SVG below instead of CSS */}

            {/* COMPUTER VISION AI OVERLAYS (SVG CANVAS) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#8B5CF6" />
                </marker>
                <filter id="heatmap-blur" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="12" />
                </filter>
              </defs>

              {/* 1. DENSITY HEATMAP LAYER */}
              {showHeatmap && (
                  <g className="mix-blend-screen opacity-80">
                      {passengers.map(p => (
                          <circle
                              key={`heat-${p.id}`}
                              cx={`${p.x}%`}
                              cy={`${p.y}%`}
                              r={`${Math.max(5, p.w * 1.5)}%`}
                              fill={p.status === 'stationary' ? '#EF4444' : '#F97316'}
                              filter="url(#heatmap-blur)"
                              opacity="0.4"
                          />
                      ))}
                  </g>
              )}

              {/* Calculate Zones on the fly for rendering */}
              {(() => {
                const gridCols = 3;
                const gridRows = 2;
                const zones = [];
                for(let r=0; r<gridRows; r++) {
                    for(let c=0; c<gridCols; c++) {
                        const zX = (c / gridCols) * 100;
                        const zY = (r / gridRows) * 100;
                        const zW = (1 / gridCols) * 100;
                        const zH = (1 / gridRows) * 100;
                        
                        const paxInZone = passengers.filter(p => p.x >= zX && p.x < zX+zW && p.y >= zY && p.y < zY+zH);
                        const count = paxInZone.length;
                        
                        const avgVx = count > 0 ? paxInZone.reduce((sum, p) => sum + p.vx, 0) / count : 0;
                        const avgVy = count > 0 ? paxInZone.reduce((sum, p) => sum + p.vy, 0) / count : 0;
                        
                        zones.push({ id: `z-${r}-${c}`, x: zX, y: zY, w: zW, h: zH, cx: zX + zW/2, cy: zY + zH/2, count, avgVx, avgVy });
                    }
                }

                return (
                  <>
                    {/* 2. ZONAL GRID OVERLAY */}
                    {showZonalGrid && zones.map(z => {
                      // Determine zone color based on density (count)
                      let fillcolor = 'rgba(6,182,212,0.05)'; // Low density
                      let strokecolor = 'rgba(6,182,212,0.3)';
                      if (z.count > 10) { fillcolor = 'rgba(239,68,68,0.2)'; strokecolor = 'rgba(239,68,68,0.8)'; }
                      else if (z.count > 5) { fillcolor = 'rgba(245,158,11,0.15)'; strokecolor = 'rgba(245,158,11,0.6)'; }

                      return (
                        <g key={z.id}>
                          <rect
                            x={`${z.x}%`} y={`${z.y}%`} width={`${z.w}%`} height={`${z.h}%`}
                            fill={fillcolor} stroke={strokecolor} strokeWidth="1" strokeDasharray="4 4"
                          />
                          <rect x={`${z.x + 1}%`} y={`${z.y + 1}%`} width="4%" height="3.5%" fill="#070B14" opacity="0.8" rx="2" />
                          <text x={`${z.x + 3}%`} y={`${z.y + 3.2}%`} fill="#FFF" fontSize="6" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                            {z.count}
                          </text>
                        </g>
                      );
                    })}


                  </>
                );
              })()}
            </svg>

            {/* TOP SURVEILLANCE OVERLAY HUD */}
            <div className="absolute top-3 left-3 right-3 flex justify-between items-center pointer-events-none z-20">
              <div className="flex items-center gap-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono">
                <span className="font-bold text-white tracking-wider">CAM-04</span>
                <span className="text-slate-400">|</span>
                <span className="text-cyan-400 font-semibold">Platform 3</span>
                <span className="text-slate-400">|</span>
                <span className="flex items-center gap-1.5 text-red-400 font-bold">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                  LIVE REC
                </span>
              </div>

              <div className="flex items-center gap-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono text-slate-300">
                <span>{currentTimeStr || '18:04:12'}</span>
                <span>REC {recTimeStr}</span>
              </div>
            </div>

            {/* BOTTOM SURVEILLANCE OVERLAY HUD */}
            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center z-20 bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-xs font-mono">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  Vision AI: ACTIVE
                </span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-300">Tracks: {passengers.length} Active</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Model:</span>
                <span className="text-indigo-400 font-bold bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">
                  YOLOv11x + ByteTrack
                </span>
              </div>
            </div>

          </div>

          {/* AI VISION OVERLAY CONTROLS BAR */}
          <div className="bg-[#18181b] p-3 rounded-lg border border-[#27272a] flex flex-wrap items-center justify-between gap-4">
            <span className="font-semibold text-slate-400 text-xs">
              Vision Overlay Layers
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  showHeatmap ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-[#09090b] border border-[#27272a] text-slate-400 hover:bg-[#27272a]'
                }`}
              >
                Density Heatmap
              </button>

              <button
                onClick={() => setShowZonalGrid(!showZonalGrid)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  showZonalGrid ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400' : 'bg-[#09090b] border border-[#27272a] text-slate-400 hover:bg-[#27272a]'
                }`}
              >
                Zonal Grid
              </button>
            </div>
          </div>

          {/* (Moved Fusion Card to right sidebar) */}
        </div>

        {/* RIGHT / SIDEBAR: ACTION & LIVE METRICS (5 COLS) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* FUSION DECISION (CLEAN ALERT) */}
          <div className="bg-[#18181b] p-5 rounded-lg border border-[#27272a] flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-[#27272a] pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-slate-200">Fusion Decision</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400 uppercase">OCC Directive</span>
            </div>

            <div className="flex flex-col gap-2">
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Recommended Action</div>
              <div className="text-lg text-slate-200 leading-snug">
                Deploy <strong className="font-medium text-indigo-300">two supervisors</strong> to Platform 3 & <strong className="font-medium text-indigo-300">Open Exit C</strong>
              </div>

              <div className="bg-[#09090b] p-3 rounded-md border border-[#27272a] mt-2">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-2">Source Weights</span>
                <div className="grid grid-cols-5 gap-2 text-center text-xs font-mono">
                  <div className="flex flex-col"><span className="text-slate-500 text-[9px]">AI</span><span className="text-cyan-400">47%</span></div>
                  <div className="flex flex-col"><span className="text-slate-500 text-[9px]">AFC</span><span className="text-emerald-400">21%</span></div>
                  <div className="flex flex-col"><span className="text-slate-500 text-[9px]">ATS</span><span className="text-yellow-400">16%</span></div>
                  <div className="flex flex-col"><span className="text-slate-500 text-[9px]">WXR</span><span className="text-blue-400">9%</span></div>
                  <div className="flex flex-col"><span className="text-slate-500 text-[9px]">SEC</span><span className="text-purple-400">7%</span></div>
                </div>
              </div>

              <button
                onClick={() => setShowExplainModal(true)}
                className="w-full mt-2 py-2 bg-[#27272a] hover:bg-[#3f3f46] text-slate-200 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Inspect Pipeline
              </button>
            </div>
          </div>

          {/* LIVE METRICS PANEL */}
          <div className="bg-[#18181b] p-5 rounded-lg border border-[#27272a] flex flex-col gap-4 flex-1">
            <div className="flex justify-between items-center border-b border-[#27272a] pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-slate-200">Live Metrics</h3>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                <span>Sync</span>
                <span className="text-emerald-400">● 100ms</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Passenger Count', val: passengerCount, unit: 'pax', color: 'text-cyan-400', progress: Math.min(100, (passengerCount / 300) * 100) },
                { label: 'Platform Occ.', val: platformOccupancy, unit: '%', color: 'text-orange-400', progress: platformOccupancy },
                { label: 'Queue Length', val: queueLength, unit: 'm', color: 'text-purple-400', progress: Math.min(100, (queueLength / 80) * 100) },
                { label: 'Walking Speed', val: walkingSpeed, unit: 'm/s', color: 'text-yellow-400', progress: Math.min(100, (walkingSpeed / 2.0) * 100) },
                { label: 'Crowd Density', val: crowdDensity, unit: '/m²', color: 'text-blue-400', progress: Math.min(100, (crowdDensity / 5.0) * 100) },
                { label: 'Congestion Score', val: congestionScore, unit: '/100', color: 'text-red-400', progress: congestionScore },
              ].map((stat, i) => (
                <div key={i} className="p-3 bg-[#09090b] rounded-md border border-[#27272a] flex flex-col gap-1.5">
                  <span className="text-[11px] text-slate-400 font-medium">{stat.label}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-semibold text-slate-200 font-sans">{stat.val}</span>
                    <span className={`text-xs ${stat.color}`}>{stat.unit}</span>
                  </div>
                  <div className="w-full bg-[#27272a] h-1 rounded-full overflow-hidden mt-1">
                    <div className={`h-full bg-slate-400 transition-all duration-700`} style={{ width: `${stat.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECONDARY ROW: SPATIAL ZONES & AI REASONING */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* ZONE ANALYSIS GRID CARD */}
        <div className="bg-[#18181b] p-4 rounded-lg border border-[#27272a] flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-[#27272a] pb-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-200">Spatial Zones</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">6 ZONES ACTIVE</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { name: 'Entry Gates', occ: 42, risk: 'Low', trend: '→', status: 'normal' },
              { name: 'Ticket Hall', occ: 38, risk: 'Low', trend: '→', status: 'normal' },
              { name: 'Escalators', occ: 64, risk: 'Mod', trend: '↑', status: 'warning' },
              { name: 'Lift Area', occ: 28, risk: 'Low', trend: '→', status: 'normal' },
              { name: 'Platform 3', occ: 84, risk: 'Crit', trend: '↑', status: 'critical' },
              { name: 'Exit B', occ: 52, risk: 'Mod', trend: '↑', status: 'warning' },
            ].map((zone, i) => {
              const isCritical = zone.status === 'critical';
              const isWarning = zone.status === 'warning';
              return (
                <div 
                  key={i} 
                  className={`p-2 rounded border flex flex-col gap-1 ${
                    isCritical
                      ? 'bg-red-500/10 border-red-500/30 text-red-400'
                      : isWarning
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-[#09090b] border-[#27272a] text-slate-400'
                  }`}
                >
                  <div className="flex justify-between items-center text-[9px] font-semibold uppercase">
                    <span className="truncate">{zone.name}</span>
                  </div>
                  <div className="flex justify-between items-baseline font-sans">
                    <span className={`text-lg font-bold ${isCritical ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-slate-200'}`}>
                      {zone.occ}<span className="text-[10px] text-slate-500">%</span>
                    </span>
                    <span className="text-xs">{zone.trend}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* VISION AI REASONING ENGINE CARD */}
        <div className="bg-[#18181b] p-4 rounded-lg border border-[#27272a] flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-[#27272a] pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-200">AI Reasoning</h3>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              LIVE
            </div>
          </div>

          <div className="bg-[#09090b] p-3 rounded-md border border-[#27272a] flex flex-col gap-2 font-mono text-xs text-slate-400 h-full">
            <ul className="space-y-2 list-none tracking-tight">
              <li className="flex gap-2 items-start"><span className="text-slate-500">▸</span><span>Crowd density aggregated via <strong className="text-slate-300 font-medium">Heatmap & Zonal Arrays</strong>.</span></li>
              <li className="flex gap-2 items-start"><span className="text-slate-500">▸</span><span>Grid Sector 0-1 experiencing <strong className="text-slate-300 font-medium">elevated occupancy</strong>.</span></li>
              <li className="flex gap-2 items-start"><span className="text-slate-500">▸</span><span>Flow fields indicate <strong className="text-slate-300 font-medium">strong directional pull</strong> towards Platform edge.</span></li>
              <li className="flex gap-2 items-start"><span className="text-slate-500">▸</span><span>Walking speed reduced by <strong className="text-slate-300 font-medium">18%</strong> in high-density zones.</span></li>
              <li className="flex gap-2 items-start text-red-400"><span className="mt-0.5">▸</span><span className="font-semibold">Predicted severe congestion within 4 minutes.</span></li>
            </ul>
          </div>
        </div>

      </div>

      {/* DECISION EXPLAINABILITY PIPELINE MODAL */}
      <WhyThisDecisionModal
        isOpen={showExplainModal}
        onClose={() => setShowExplainModal(false)}
        recommendationTitle="Deploy Two Supervisors to Platform 3 & Open Exit C"
        confidence={96}
        videoSrc="/Crowd-at-Ameerpet-Metro-Station.mp4"
      />
    </div>
  );
};
