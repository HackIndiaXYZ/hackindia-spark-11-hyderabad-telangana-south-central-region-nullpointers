import React, { useEffect, useRef, useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { LINEAGE_REGISTRY } from '../services/lineageRegistry';
import { AlertTriangle, Activity, HelpCircle } from 'lucide-react';

export const DigitalTwin: React.FC = () => {
  const { telemetry, activeScenario, setLineageModalData } = useAppState();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [medicalPos, setMedicalPos] = useState({ x: 250, y: 130 });
  const [isMedicalResponding, setIsMedicalResponding] = useState(false);


  // Weather Rain Animation Overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const isRainy = telemetry?.weather?.condition?.toLowerCase().includes('rain');
    const rainSpeed = telemetry?.weather?.precipitation?.includes('18mm') ? 18 : 6;

    const drops: { x: number; y: number; length: number; speed: number }[] = [];
    const maxDrops = isRainy ? (rainSpeed === 18 ? 200 : 80) : 0;

    for (let i = 0; i < maxDrops; i++) {
      drops.push({
        x: Math.random() * width,
        y: Math.random() * height - height,
        length: Math.random() * 15 + 10,
        speed: Math.random() * 8 + rainSpeed
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      if (isRainy && drops.length > 0) {
        ctx.strokeStyle = 'rgba(156, 163, 175, 0.4)';
        ctx.lineWidth = 1;
        ctx.lineCap = 'round';

        for (let i = 0; i < drops.length; i++) {
          const d = drops[i];
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          // Angle rain drops diagonally
          ctx.lineTo(d.x - 3, d.y + d.length);
          ctx.stroke();

          d.y += d.speed;
          d.x -= 1.5;

          if (d.y > height) {
            d.y = -20;
            d.x = Math.random() * width;
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [telemetry?.weather?.condition, telemetry?.weather?.precipitation]);

  // Patrol Dispatch Animation Logic
  // When a medical emergency is triggered (e.g. Sector C Stands), dispatch Responder dot to Sector C Stands
  useEffect(() => {
    const hasMedicalIncident = telemetry?.incidents?.some((i: any) => i.type === 'MEDICAL' && i.status === 'RESPONDING');
    
    if (hasMedicalIncident) {
      setIsMedicalResponding(true);
      // Sector C Stands is located around x=150, y=140 on the SVG.
      // Animate responder towards Platform Hub (x=190, y=200)
      let frame = 0;
      const startX = 400;
      const startY = 80;
      const targetX = 190;
      const targetY = 200;

      const interval = setInterval(() => {
        frame++;
        const pct = Math.min(1, frame / 30);
        setMedicalPos({
          x: startX + (targetX - startX) * pct,
          y: startY + (targetY - startY) * pct
        });

        if (pct >= 1) clearInterval(interval);
      }, 50);

      return () => clearInterval(interval);
    } else {
      setIsMedicalResponding(false);
      // Standby Location (Medical Base Station)
      setMedicalPos({ x: 400, y: 80 });
    }
  }, [telemetry?.incidents]);

  if (!telemetry) return null;

  // Programmatic generation of Metro Station Layout
  const renderMetroStation = () => {
    const elements: React.ReactNode[] = [];
    
    // Main Concourse Background
    elements.push(
      <rect key="concourse" x="50" y="50" width="400" height="400" rx="8" fill="#11131c" stroke="#1d202d" strokeWidth="1.5" />
    );

    // Grid lines for blueprint feel (subtle)
    for (let i = 70; i < 450; i += 20) {
      elements.push(<line key={`v-${i}`} x1={i} y1="50" x2={i} y2="450" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />);
      elements.push(<line key={`h-${i}`} x1="50" y1={i} x2="450" y2={i} stroke="rgba(255,255,255,0.02)" strokeWidth="1" />);
    }

    // East-West Metro Line (Tracks)
    elements.push(
      <rect key="track-ew" x="50" y="160" width="400" height="40" fill="#0d1411" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
    );
    elements.push(<line key="track-ew-1" x1="50" y1="170" x2="450" y2="170" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4 2" />);
    elements.push(<line key="track-ew-2" x1="50" y1="190" x2="450" y2="190" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4 2" />);

    // North-South Metro Line (Tracks)
    elements.push(
      <rect key="track-ns" x="230" y="50" width="40" height="400" fill="#0d1411" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
    );
    elements.push(<line key="track-ns-1" x1="240" y1="50" x2="240" y2="450" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4 2" />);
    elements.push(<line key="track-ns-2" x1="260" y1="50" x2="260" y2="450" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4 2" />);

    // Central Hub Platform (Dynamic Color based on density)
    let hubDensity = telemetry.crowd.standsDensity;
    if (activeScenario === 'metro-delay') hubDensity = 0.9;
    let hubFill = hubDensity > 0.85 ? 'fill-red-500/10 stroke-red-500/30' : hubDensity > 0.7 ? 'fill-amber-500/10 stroke-amber-500/30' : 'fill-[#181c25] stroke-[#2e3344]';

    elements.push(
      <rect key="hub-platform" x="180" y="200" width="140" height="100" rx="4" className={`${hubFill} transition-all duration-300`} strokeWidth="1.5" />
    );

    // North Platform
    elements.push(
      <rect key="platform-n" x="190" y="90" width="120" height="50" rx="2" fill="#181c25" stroke="#2e3344" strokeWidth="1" />
    );

    // South Platform
    elements.push(
      <rect key="platform-s" x="190" y="320" width="120" height="50" rx="2" fill="#181c25" stroke="#2e3344" strokeWidth="1" />
    );

    return elements;
  };

  const activeIncidents = telemetry.incidents || [];
  const activeGates = telemetry.gates || [];

  return (
    <div className="relative w-full h-full min-h-[460px] glass-panel rounded-2xl flex flex-col p-5 overflow-hidden">
      
      {/* HUD Header */}
      <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-4 z-20">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-500" />
          <span className="font-mono text-xs uppercase tracking-widest text-slate-350">Digital Twin Simulation</span>
        </div>
        <div className="flex gap-4 text-[10px] font-mono text-slate-500">
          <span>SCALE: 1:1200</span>
          <span>LATITUDE: 24.478° N</span>
        </div>
      </div>

      {/* SVG Container and Canvas Weather Overlay */}
      <div className="relative flex-1 flex items-center justify-center min-h-[360px]">
        {/* Canvas overlay for weather rain effects */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

        {/* Dynamic Warning Alert Overlay */}
        {activeIncidents.length > 0 && (
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
            {activeIncidents.map((inc: any) => (
              <div key={inc.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="font-bold">{inc.id}</span>
                <span className="text-[10px] uppercase">{inc.type} // {inc.location}</span>
              </div>
            ))}
          </div>
        )}

        {/* Metro Station Top-Down Layout Map */}
        <svg viewBox="0 0 500 500" className="w-full h-full max-w-[420px] max-h-[420px] relative z-0">
          
          {/* Programmatically Generated Metro Layout */}
          {renderMetroStation()}

          {/* Gates (Indicators Placed around concourse edges) */}
          {activeGates.map((gate: any, idx: number) => {
            const gatePositions = [
              { x: 50, y: 120 }, // Gate A (West)
              { x: 50, y: 380 }, // Gate B (West)
              { x: 450, y: 120 }, // Gate C (East)
              { x: 450, y: 380 }, // Gate D (East)
              { x: 120, y: 50 }, // Gate E (North)
              { x: 380, y: 450 }, // Gate F (South)
            ];
            const gx = gatePositions[idx]?.x || 250;
            const gy = gatePositions[idx]?.y || 250;

            const isOffline = gate.status === 'OFFLINE';

            return (
              <g key={gate.id}>
                {/* Gate Label Bubble */}
                <circle cx={gx} cy={gy} r="10" fill="#0c0c16" stroke={isOffline ? '#ef4444' : gate.occupancy > 0.85 ? '#f59e0b' : '#3b82f6'} strokeWidth="1" />
                <text x={gx} y={gy + 3} textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="monospace">
                  {gate.id}
                </text>
                
                {/* Pulse ring indicating flow rate or status */}
                <circle 
                  cx={gx} 
                  cy={gy} 
                  r="14" 
                  fill="none" 
                  stroke={isOffline ? '#ef4444' : gate.occupancy > 0.85 ? '#f59e0b' : '#3b82f6'} 
                  strokeWidth="1.5" 
                  className={isOffline ? 'animate-blink-fast' : 'animate-pulse-slow'} 
                />
              </g>
            );
          })}

          {/* Dynamic Patrol Units */}
          {/* Security Patrols (Linear movement along concourse) */}
          <circle cx={100 + 300 * Math.abs(Math.sin(Date.now() / 8000))} cy="100" r="3.5" fill="#3b82f6" />
          <circle cx={400 - 300 * Math.abs(Math.sin(Date.now() / 8000))} cy="400" r="3.5" fill="#3b82f6" />

          {/* Staff Patrols */}
          <circle cx="150" cy={100 + 300 * Math.abs(Math.cos(Date.now() / 6000))} r="3" fill="#8b5cf6" />
          
          {/* Animated Medical Responder */}
          <circle 
            cx={medicalPos.x} 
            cy={medicalPos.y} 
            r="4" 
            fill="#10b981" 
            className={isMedicalResponding ? 'animate-pulse' : ''} 
          />
          
          {/* Medical base station indicator */}
          <circle cx="400" cy="80" r="4" fill="#10b981" opacity="0.4" />
        </svg>
      </div>

      {/* Ticker HUD Stats Overlay at bottom of Digital Twin */}
      <div className="grid grid-cols-3 gap-2 border-t border-zinc-800 pt-3 mt-2 text-center text-xs font-mono">
        <div className="flex flex-col items-center">
          <span className="text-slate-500 text-[9px] uppercase tracking-wider flex items-center gap-1 justify-center font-bold">
            Crowd Inside
            <button 
              onClick={() => setLineageModalData(LINEAGE_REGISTRY['stands-density'])}
              className="hover:text-blue-400 p-0.5 rounded cursor-pointer"
            >
              <HelpCircle className="w-2.5 h-2.5 text-slate-500 hover:text-blue-400" />
            </button>
          </span>
          <span className="text-slate-350 font-semibold">{telemetry.crowd.totalInside.toLocaleString()}</span>
        </div>
        <div className="flex flex-col items-center border-x border-zinc-800">
          <span className="text-slate-500 text-[9px] uppercase tracking-wider flex items-center gap-1 justify-center font-bold">
            Average Flow Rate
            <button 
              onClick={() => setLineageModalData(LINEAGE_REGISTRY['flow-rate'])}
              className="hover:text-blue-400 p-0.5 rounded cursor-pointer"
            >
              <HelpCircle className="w-2.5 h-2.5 text-slate-500 hover:text-blue-400" />
            </button>
          </span>
          <span className="text-slate-350 font-semibold">{telemetry.crowd.flowRate} p/min</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-slate-500 text-[9px] uppercase tracking-wider flex items-center gap-1 justify-center font-bold">
            Active Alerts
            <button 
              onClick={() => setLineageModalData(LINEAGE_REGISTRY['active-alerts'])}
              className="hover:text-blue-400 p-0.5 rounded cursor-pointer"
            >
              <HelpCircle className="w-2.5 h-2.5 text-slate-500 hover:text-blue-400" />
            </button>
          </span>
          <span className={`font-semibold ${activeIncidents.length > 0 ? 'text-red-400 font-extrabold' : 'text-emerald-400'}`}>
            {activeIncidents.length > 0 ? `${activeIncidents.length} Alert${activeIncidents.length > 1 ? 's' : ''}` : 'None'}
          </span>
        </div>
      </div>
    </div>
  );
};
