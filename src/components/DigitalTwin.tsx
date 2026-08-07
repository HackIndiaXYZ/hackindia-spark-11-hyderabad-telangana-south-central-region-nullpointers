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

  // Programmatic generation of concentric oval seating sections matching target image
  const renderStadiumSeats = () => {
    const cx = 250;
    const cy = 250;
    
    // 3 tiers of seats with progressive elliptical radii
    const tiers = [
      { rx: 90, ry: 120, count: 24, width: 8, height: 6 },
      { rx: 112, ry: 147, count: 32, width: 10, height: 7 },
      { rx: 136, ry: 178, count: 42, width: 12, height: 8 },
    ];

    const seatElements: React.ReactNode[] = [];

    tiers.forEach((tier, tierIdx) => {
      for (let i = 0; i < tier.count; i++) {
        const angle = (i * 2 * Math.PI) / tier.count;
        const x = cx + tier.rx * Math.cos(angle);
        const y = cy + tier.ry * Math.sin(angle);
        
        const angleDeg = (angle * 180) / Math.PI;
        
        let fillClass = 'fill-none stroke-zinc-800 hover:stroke-zinc-600';
        
        if (x < cx) {
          // Color-coded left half: shades of emerald, purple, blue, cyan
          const segment = Math.floor((angleDeg + 90) / 45) % 8;
          if (segment === 0 || segment === 1) {
            fillClass = 'fill-emerald-500/20 stroke-emerald-500/40 hover:fill-emerald-500/35'; // Green
          } else if (segment === 2 || segment === 3) {
            fillClass = 'fill-purple-500/20 stroke-purple-500/40 hover:fill-purple-500/35'; // Purple
          } else if (segment === 4 || segment === 5) {
            fillClass = 'fill-blue-500/20 stroke-blue-500/40 hover:fill-blue-500/35'; // Blue
          } else {
            fillClass = 'fill-cyan-500/20 stroke-cyan-500/40 hover:fill-cyan-500/35'; // Light blue
          }
        } else {
          // Right half has white outlines matching target design
          fillClass = 'fill-none stroke-zinc-700/60 hover:stroke-slate-500';
        }

        // Apply dynamic heat mapping to seats based on active incidents
        let normalizedAngle = (angleDeg + 360) % 360;
        let seatSectorDensity = telemetry.crowd.standsDensity;
        
        if (normalizedAngle >= 225 && normalizedAngle < 315) {
          // North
          if (activeScenario === 'heavy-rain') seatSectorDensity = 0.92;
        } else if (normalizedAngle >= 315 || normalizedAngle < 45) {
          // East
          if (activeScenario === 'metro-delay') seatSectorDensity = 0.84;
        } else if (normalizedAngle >= 45 && normalizedAngle < 135) {
          // South
          seatSectorDensity = telemetry.crowd.standsDensity * 0.85;
        } else {
          // West
          if (activeScenario === 'gate-failure') seatSectorDensity = 0.89;
        }

        if (seatSectorDensity > 0.85) {
          if ((i % 3 === 0 && x < cx) || (i % 2 === 0 && x >= cx)) {
            fillClass = 'fill-red-500/20 stroke-red-500/50 hover:fill-red-500/40 animate-pulse';
          }
        } else if (seatSectorDensity > 0.7) {
          if (i % 3 === 1) {
            fillClass = 'fill-amber-500/20 stroke-amber-500/50 hover:fill-amber-500/40';
          }
        }

        seatElements.push(
          <rect
            key={`seat-${tierIdx}-${i}`}
            x={x - tier.width / 2}
            y={y - tier.height / 2}
            width={tier.width}
            height={tier.height}
            rx="1.5"
            transform={`rotate(${angleDeg + 90}, ${x}, ${y})`}
            className={`${fillClass} transition-all duration-300 cursor-pointer`}
          />
        );
      }
    });

    return seatElements;
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

        {/* Stadium Top-Down Layout Map */}
        <svg viewBox="0 0 500 500" className="w-full h-full max-w-[420px] max-h-[420px] relative z-0">
          
          {/* Programmatically Generated Seating Bowl Blocks */}
          {renderStadiumSeats()}

          {/* High-Fidelity Football Pitch (Center) */}
          <rect x="200" y="170" width="100" height="160" rx="4" fill="#0d1411" stroke="rgba(255,255,255,0.08)" strokeWidth="1.2" />
          <line x1="200" y1="250" x2="300" y2="250" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <circle cx="250" cy="250" r="20" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <circle cx="250" cy="250" r="1.5" fill="rgba(255,255,255,0.25)" />
          
          {/* Pitch Goal Boxes */}
          {/* Top Penalty Area */}
          <rect x="220" y="170" width="60" height="28" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <rect x="236" y="170" width="28" height="10" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <path d="M 235 198 A 15 15 0 0 0 265 198" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

          {/* Bottom Penalty Area */}
          <rect x="220" y="302" width="60" height="28" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <rect x="236" y="320" width="28" height="10" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <path d="M 235 302 A 15 15 0 0 1 265 302" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

          {/* Outer Stadium Rim Ellipse */}
          <ellipse cx="250" cy="250" rx="170" ry="215" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
          
          {/* Sector Division Dash Lines */}
          <line x1="250" y1="35" x2="250" y2="465" stroke="rgba(255,255,255,0.04)" strokeDasharray="3,3" />
          <line x1="75" y1="250" x2="425" y2="250" stroke="rgba(255,255,255,0.04)" strokeDasharray="3,3" />

          {/* Gates (Indicators Placed around outer ellipse) */}
          {activeGates.map((gate: any, idx: number) => {
            const angles = [210, 330, 270, 90, 30, 150]; // Gates A to F
            const angleRad = (angles[idx] * Math.PI) / 180;
            const rx = 170;
            const ry = 215;
            const gx = 250 + rx * Math.cos(angleRad);
            const gy = 250 + ry * Math.sin(angleRad);

            const isOffline = gate.status === 'OFFLINE';

            return (
              <g key={gate.id}>
                {/* Gate Label Bubble */}
                <circle cx={gx} cy={gy} r="10" fill="#0c0c16" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                <text x={gx} y={gy + 3} textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="monospace">
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

          {/* Dynamic Patrol Units along Elliptical tracks */}
          {/* Animated Security Patrols */}
          <circle cx={250 + 115 * Math.cos(Date.now() / 6000)} cy={250 + 150 * Math.sin(Date.now() / 6000)} r="3.5" fill="#f87171" />
          <circle cx={250 + 115 * Math.cos(Date.now() / 6000 + Math.PI)} cy={250 + 150 * Math.sin(Date.now() / 6000 + Math.PI)} r="3.5" fill="#f87171" />

          {/* Animated Volunteer Patrols */}
          <circle cx={250 + 160 * Math.cos(Date.now() / 4500)} cy={250 + 205 * Math.sin(Date.now() / 4500)} r="3" fill="#fbbf24" />
          <circle cx={250 + 160 * Math.cos(Date.now() / 4500 + (2 * Math.PI) / 3)} cy={250 + 205 * Math.sin(Date.now() / 4500 + (2 * Math.PI) / 3)} r="3" fill="#fbbf24" />

          {/* Animated Medical Responder */}
          <circle 
            cx={medicalPos.x} 
            cy={medicalPos.y} 
            r="4" 
            fill="#10b981" 
            className={isMedicalResponding ? 'animate-pulse' : ''} 
          />
          
          {/* Medical base station indicator */}
          <circle cx="250" cy="250" r="3.5" fill="#10b981" opacity="0.4" />
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
