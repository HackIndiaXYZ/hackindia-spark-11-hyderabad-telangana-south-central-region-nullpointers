import React, { useEffect, useRef, useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { AlertTriangle, Activity } from 'lucide-react';

export const DigitalTwin: React.FC = () => {
  const { telemetry, activeScenario } = useAppState();
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
      // Animate responder towards it.
      let frame = 0;
      const startX = 250;
      const startY = 250;
      const targetX = 150;
      const targetY = 140;

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
      // Standby Location
      setMedicalPos({ x: 250, y: 250 });
    }
  }, [telemetry?.incidents]);

  if (!telemetry) return null;

  // Sector density color helpers
  const getSectorColor = (density: number) => {
    if (density < 0.45) return 'fill-emerald-500/10 stroke-emerald-500/40';
    if (density < 0.75) return 'fill-amber-500/20 stroke-amber-500/50';
    return 'fill-red-500/30 stroke-red-500/60 animate-pulse';
  };

  const activeIncidents = telemetry.incidents || [];
  const activeGates = telemetry.gates || [];


  return (
    <div className="relative w-full h-full min-h-[460px] glass-panel rounded-2xl flex flex-col p-5 overflow-hidden">
      
      {/* HUD Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4 z-20">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" />
          <span className="font-mono text-xs uppercase tracking-widest text-white/70">DIGITAL TWIN // REAL-TIME VECTOR GRID</span>
        </div>
        <div className="flex gap-4 text-[10px] font-mono text-white/30">
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
          <div className="absolute top-2 left-2 z-20 flex flex-col gap-2">
            {activeIncidents.map((inc: any) => (
              <div key={inc.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs animate-pulse glow-red">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="font-mono font-bold">{inc.id}</span>
                <span className="text-[10px] uppercase font-semibold">{inc.type}: {inc.location}</span>
              </div>
            ))}
          </div>
        )}

        {/* Stadium Top-Down Layout Map */}
        <svg viewBox="0 0 500 500" className="w-full h-full max-w-[420px] max-h-[420px] relative z-0">
          <defs>
            <radialGradient id="pitchGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e293b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#020205" stopOpacity="1" />
            </radialGradient>
            <pattern id="concourseStripes" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="10" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
            </pattern>
          </defs>

          {/* Outer perimeter limits */}
          <circle cx="250" cy="250" r="230" fill="url(#concourseStripes)" stroke="rgba(255,255,255,0.04)" strokeDasharray="5,5" />

          {/* Outer Transit Ring Roads & Bus Stops */}
          <circle cx="250" cy="250" r="215" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="8" />

          {/* Sector Overlays (North, South, East, West concourse segments) */}
          {/* North Sector (Concourse outer) */}
          <path
            d="M 100 100 A 212 212 0 0 1 400 100 L 350 150 A 141 141 0 0 0 150 150 Z"
            className={`${getSectorColor(telemetry.crowd.concourseDensity)} transition-all duration-700`}
            strokeWidth="1.5"
          />
          {/* East Sector */}
          <path
            d="M 400 100 A 212 212 0 0 1 400 400 L 350 350 A 141 141 0 0 0 350 150 Z"
            className={`${getSectorColor(activeScenario === 'metro-delay' ? telemetry.crowd.concourseDensity * 1.2 : telemetry.crowd.concourseDensity)} transition-all duration-700`}
            strokeWidth="1.5"
          />
          {/* South Sector */}
          <path
            d="M 400 400 A 212 212 0 0 1 100 400 L 150 350 A 141 141 0 0 0 350 350 Z"
            className={`${getSectorColor(telemetry.crowd.concourseDensity * 0.9)} transition-all duration-700`}
            strokeWidth="1.5"
          />
          {/* West Sector */}
          <path
            d="M 100 400 A 212 212 0 0 1 100 100 L 150 150 A 141 141 0 0 0 150 350 Z"
            className={`${getSectorColor(telemetry.crowd.concourseDensity * 0.85)} transition-all duration-700`}
            strokeWidth="1.5"
          />

          {/* Inner Stadium Seating Bowl Rings */}
          <circle cx="250" cy="250" r="120" className={`${getSectorColor(telemetry.crowd.standsDensity)} transition-all duration-700`} strokeWidth="2" />
          <circle cx="250" cy="250" r="95" className={`${getSectorColor(telemetry.crowd.standsDensity * 0.9)} transition-all duration-700`} strokeWidth="1.5" />

          {/* The Pitch (Center Playing Area) */}
          <rect x="200" y="175" width="100" height="150" rx="6" fill="url(#pitchGlow)" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
          <circle cx="250" cy="250" r="22" fill="none" stroke="rgba(255,255,255,0.04)" />
          <line x1="200" y1="250" x2="300" y2="250" stroke="rgba(255,255,255,0.04)" />

          {/* Stadium structural supporting struts */}
          <line x1="250" y1="20" x2="250" y2="95" stroke="rgba(255,255,255,0.05)" />
          <line x1="250" y1="405" x2="250" y2="480" stroke="rgba(255,255,255,0.05)" />
          <line x1="20" y1="250" x2="95" y2="250" stroke="rgba(255,255,255,0.05)" />
          <line x1="405" y1="250" x2="480" y2="250" stroke="rgba(255,255,255,0.05)" />

          {/* Gates (Indicators Placed around concourse) */}
          {activeGates.map((gate: any, idx: number) => {
            // Calculate gate polar coordinates
            const angles = [210, 330, 270, 90, 30, 150]; // Gates A to F
            const angleRad = (angles[idx] * Math.PI) / 180;
            const r = 212;
            const gx = 250 + r * Math.cos(angleRad);
            const gy = 250 + r * Math.sin(angleRad);

            const isOffline = gate.status === 'OFFLINE';

            return (
              <g key={gate.id}>
                {/* Gate Label Bubble */}
                <circle cx={gx} cy={gy} r="10" fill="#0c0c16" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                <text x={gx} y={gy + 3.5} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold" fontFamily="monospace">
                  {gate.id}
                </text>
                
                {/* Pulse ring indicating flow rate or status */}
                <circle 
                  cx={gx} 
                  cy={gy} 
                  r="14" 
                  fill="none" 
                  stroke={isOffline ? '#ef4444' : gate.occupancy > 0.85 ? '#f59e0b' : '#10b981'} 
                  strokeWidth="1.5" 
                  className={isOffline ? 'animate-blink-fast' : 'animate-pulse-slow'} 
                />
              </g>
            );
          })}

          {/* Dynamic Patrol Units (Security - red, Volunteers - yellow, Medical - green) */}
          {/* Animated Security Patrol along concentric paths */}
          <circle cx={250 + 130 * Math.cos(Date.now() / 6000)} cy={250 + 130 * Math.sin(Date.now() / 6000)} r="4" fill="#f87171" className="glow-red" />
          <circle cx={250 + 130 * Math.cos(Date.now() / 6000 + Math.PI)} cy={250 + 130 * Math.sin(Date.now() / 6000 + Math.PI)} r="4" fill="#f87171" className="glow-red" />

          {/* Animated Volunteer Patrols near entrances */}
          <circle cx={250 + 175 * Math.cos(Date.now() / 4500)} cy={250 + 175 * Math.sin(Date.now() / 4500)} r="3.5" fill="#fbbf24" className="glow-yellow" />
          <circle cx={250 + 175 * Math.cos(Date.now() / 4500 + (2 * Math.PI) / 3)} cy={250 + 175 * Math.sin(Date.now() / 4500 + (2 * Math.PI) / 3)} r="3.5" fill="#fbbf24" className="glow-yellow" />

          {/* Animated Medical Responder */}
          <circle 
            cx={medicalPos.x} 
            cy={medicalPos.y} 
            r="4.5" 
            fill="#34d399" 
            className={`${isMedicalResponding ? 'animate-pulse' : ''} glow-green`} 
          />
          
          {/* Medical base station indicator */}
          <circle cx="250" cy="250" r="3.5" fill="#34d399" opacity="0.4" />
        </svg>
      </div>

      {/* Ticker HUD Stats Overlay at bottom of Digital Twin */}
      <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-3 mt-2 text-center text-xs font-mono">
        <div className="flex flex-col items-center">
          <span className="text-white/30 text-[9px] uppercase tracking-wider">CROWD INSIDE</span>
          <span className="text-white font-semibold">{telemetry.crowd.totalInside.toLocaleString()}</span>
        </div>
        <div className="flex flex-col items-center border-x border-white/5">
          <span className="text-white/30 text-[9px] uppercase tracking-wider">AVG FLOW RATE</span>
          <span className="text-white font-semibold">{telemetry.crowd.flowRate} p/min</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-white/30 text-[9px] uppercase tracking-wider">ACTIVE ALERTS</span>
          <span className={`font-semibold ${activeIncidents.length > 0 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
            {activeIncidents.length > 0 ? `${activeIncidents.length} CRITICAL` : 'NONE'}
          </span>
        </div>
      </div>
    </div>
  );
};
