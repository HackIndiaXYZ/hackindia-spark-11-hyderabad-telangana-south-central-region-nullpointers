import React, { useEffect, useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { AlertTriangle, Crosshair } from 'lucide-react';

// Particle type for crowd visualization
type Particle = {
  id: number;
  x: number;
  y: number;
  speed: number;
  angle: number;
  color: string;
};

export const DigitalTwin: React.FC = () => {
  const { telemetry, lastIngestedPacket, liveEventsLog } = useAppState();

  const [particles, setParticles] = useState<Particle[]>([]);
  const [trainPos, setTrainPos] = useState(0);

  const isCritical = telemetry?.crowd?.standsDensity > 0.8;
  const hasEscalatorFailure = liveEventsLog.some(e => e.source.includes('Escalator') && e.type === 'warning');
  const hasMedicalEmergency = liveEventsLog.some(e => e.source.includes('Medical Incident') && e.type === 'critical');
  const hasRain = liveEventsLog.some(e => e.source.includes('Weather') && e.message.includes('Rain'));
  const hasSecurityAlert = liveEventsLog.some(e => e.source.includes('Security') && e.type === 'critical');

  // Initialize and animate crowd particles
  useEffect(() => {
    if (!telemetry) return;
    
    // Determine target density
    let numParticles = 100 + (telemetry.crowd.totalInside / 100);
    let targetZone = { x: 400, y: 400, radius: 400 }; // Default spread out
    
    if (telemetry.crowd.standsDensity > 0.70) {
      numParticles = 250 + (telemetry.crowd.standsDensity - 0.7) * 400; // Higher density
      targetZone = { x: 400, y: 550, radius: 100 }; // Cluster at Platform 3 (South)
    }

    if (hasRain && !isCritical) {
      targetZone = { x: 400, y: 250, radius: 120 }; // Cluster near entrances/Platform 1
    }

    if (hasMedicalEmergency) {
      targetZone = { x: 200, y: 550, radius: 100 }; // Move away from Platform 3 / corridor
    }

    if (telemetry.crowd.standsDensity < 0.65 && !hasRain && !hasMedicalEmergency) {
      targetZone = { x: 400, y: 400, radius: 400 }; // Normal flow
    }

    const newParticles: Particle[] = Array.from({ length: numParticles }).map((_, i) => ({
      id: i,
      x: targetZone.x + (Math.random() - 0.5) * targetZone.radius * 2,
      y: targetZone.y + (Math.random() - 0.5) * targetZone.radius * 2,
      speed: 0.5 + Math.random() * 1.5,
      angle: Math.random() * Math.PI * 2,
      color: Math.random() > 0.8 ? '#3B82F6' : '#60A5FA', // Blue hues
    }));

    setParticles(newParticles);
  }, [telemetry]);

  // Animate particles and trains
  useEffect(() => {
    let animationFrame: number;
    let currentTrain = 0;

    const animate = () => {
      // Update particles
      setParticles(prev => prev.map(p => {
        let nx = p.x + Math.cos(p.angle) * p.speed;
        let ny = p.y + Math.sin(p.angle) * p.speed;
        
        // Bounce off invisible boundaries (800x800 grid)
        if (nx < 100 || nx > 700) p.angle = Math.PI - p.angle;
        if (ny < 100 || ny > 700) p.angle = -p.angle;

        return { ...p, x: nx, y: ny };
      }));

      // Update train (moves across the 800px track)
      currentTrain = (currentTrain + 3) % 1200;
      setTrainPos(currentTrain - 200);

      animationFrame = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  if (!telemetry) return null;

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden font-sans bg-[#09090b]">
      
      {/* HUD Header */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center border-b border-[#27272a] z-20 pointer-events-none">
        <div className="flex items-center gap-3">
          <Crosshair className="w-5 h-5 text-blue-500 animate-pulse" />
          <span className="font-bold text-sm uppercase tracking-widest text-slate-200">Palantir Digital Twin</span>
        </div>
        <div className="flex gap-4 text-xs font-mono text-slate-500 bg-black/40 px-3 py-1 rounded-full border border-white/5">
          <span>PROJ: ISOMETRIC</span>
          <span className="text-blue-500/80">LAT: 24.478°N</span>
        </div>
      </div>

      {/* Dynamic Warning Alert Overlay */}
      {lastIngestedPacket && (lastIngestedPacket.type === 'warning' || lastIngestedPacket.type === 'critical') && (
        <div className="absolute top-16 left-4 z-20 flex flex-col gap-2 pointer-events-none">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${lastIngestedPacket.type === 'critical' ? 'bg-red-500/10 border border-red-500/30 text-red-500' : 'bg-orange-500/10 border border-orange-500/30 text-orange-500'} text-xs font-mono font-semibold`}>
              <AlertTriangle className="w-4 h-4 shrink-0 animate-pulse" />
              <span>{lastIngestedPacket.source} // {lastIngestedPacket.message}</span>
            </div>
        </div>
      )}

      {/* 3D Isometric Viewport */}
      <div 
        className="flex-1 w-full h-full flex items-center justify-center" 
        style={{ perspective: '1600px' }}
      >
        <div 
          className="relative transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]"
          style={{
            width: '800px',
            height: '800px',
            transformStyle: 'preserve-3d',
            transform: isCritical 
              ? 'rotateX(55deg) rotateZ(-30deg) scale(1.1) translateX(50px) translateY(-150px) translateZ(100px)' 
              : 'rotateX(60deg) rotateZ(-45deg) scale(0.75)',
          }}
        >
          {/* FLOOR GRID LAYER */}
          <div 
            className="absolute inset-0 border border-[#27272a] rounded-xl"
            style={{ 
              background: 'linear-gradient(to right, rgba(39,39,42,0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(39,39,42,0.3) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              backgroundColor: '#18181b',
              transform: 'translateZ(0px)'
            }}
          >
          </div>

          {/* TRACKS LAYER (Recessed) */}
          <div className="absolute inset-0" style={{ transform: 'translateZ(2px)', transformStyle: 'preserve-3d' }}>
            {/* East-West Track Background */}
            <div className="absolute top-[350px] left-0 w-full h-[100px] bg-black/60 border-y border-zinc-800" />
            {/* Rails */}
            <div className="absolute top-[370px] left-0 w-full h-[2px] bg-zinc-700/50" />
            <div className="absolute top-[390px] left-0 w-full h-[2px] bg-zinc-700/50" />
            <div className="absolute top-[410px] left-0 w-full h-[2px] bg-zinc-700/50" />
            <div className="absolute top-[430px] left-0 w-full h-[2px] bg-zinc-700/50" />

            {/* MOVING TRAIN */}
            <div 
              className="absolute top-[360px] h-[30px] w-[250px] rounded bg-blue-500"
              style={{ 
                left: `${trainPos}px`,
                transform: 'translateZ(10px)', // Train sits on tracks
              }}
            >
              {/* Train Windows */}
              <div className="absolute top-[10px] left-0 w-full h-[10px] flex gap-2 px-4">
                 {Array.from({length: 12}).map((_, i) => (
                   <div key={i} className="w-[12px] h-full bg-cyan-100/80 rounded-[1px]" />
                 ))}
              </div>
            </div>
          </div>

          {/* PLATFORM 1 (North) LAYER - Elevated */}
          <div 
            className="absolute top-[150px] left-[200px] w-[400px] h-[200px] rounded-lg transition-colors duration-1000"
            style={{ 
              transform: 'translateZ(40px)',
              transformStyle: 'preserve-3d',
              backgroundColor: '#18181b',
              borderTop: '2px solid rgba(255,255,255,0.1)',
              borderLeft: '2px solid rgba(255,255,255,0.1)',
              boxShadow: '-10px 10px 20px rgba(0,0,0,0.5)',
            }}
          >
            {/* Platform Extrusion/Sides (Fake 3D) */}
            <div className="absolute bottom-[-20px] left-0 w-full h-[20px] bg-zinc-900 origin-top" style={{ transform: 'rotateX(-90deg)' }} />
            <div className="absolute top-0 right-[-20px] w-[20px] h-full bg-zinc-950 origin-left" style={{ transform: 'rotateY(90deg)' }} />
            
            <div className="absolute top-4 left-4 text-zinc-500 font-mono text-xl font-bold tracking-widest uppercase">
              Platform 1
            </div>

            {/* AFC Gates */}
            <div className="absolute top-[20px] right-[40px] flex gap-4">
              <div className="w-[10px] h-[30px] bg-emerald-500/20 border border-emerald-500 rounded" />
              <div className="w-[10px] h-[30px] bg-emerald-500/20 border border-emerald-500 rounded" />
            </div>
          </div>

          {/* PLATFORM 3 (South) LAYER - Elevated & Dynamic */}
          <div 
            className={`absolute top-[450px] left-[200px] w-[400px] h-[200px] rounded-lg transition-all duration-1000 ${
              isCritical ? 'bg-red-950/40 border-red-500/50' : 'bg-[#18181b]'
            }`}
            style={{ 
              transform: 'translateZ(40px)',
              transformStyle: 'preserve-3d',
              borderTop: isCritical ? '2px solid rgba(239,68,68,0.5)' : '2px solid rgba(255,255,255,0.1)',
              borderLeft: isCritical ? '2px solid rgba(239,68,68,0.5)' : '2px solid rgba(255,255,255,0.1)',
              boxShadow: '-10px 10px 20px rgba(0,0,0,0.5)',
            }}
          >
            {/* Sides */}
            <div className={`absolute bottom-[-20px] left-0 w-full h-[20px] origin-top ${isCritical ? 'bg-red-900/40' : 'bg-zinc-900'}`} style={{ transform: 'rotateX(-90deg)' }} />
            <div className={`absolute top-0 right-[-20px] w-[20px] h-full origin-left ${isCritical ? 'bg-red-950/60' : 'bg-zinc-950'}`} style={{ transform: 'rotateY(90deg)' }} />

            <div className={`absolute top-4 left-4 font-mono text-xl font-bold tracking-widest uppercase transition-colors ${isCritical ? 'text-red-400' : 'text-zinc-500'}`}>
              Platform 3 {isCritical && '(CRITICAL)'}
            </div>

            {/* Context Tooltip pops up in 3D space when highlighted */}
            {isCritical && (
              <div 
                className="absolute top-1/2 left-1/2 bg-black/80 border border-red-500 px-4 py-2 rounded-xl backdrop-blur-md"
                style={{ 
                  transform: 'translate(-50%, -50%) translateZ(100px) rotateX(-55deg) rotateZ(30deg)', 
                  transformOrigin: 'bottom'
                }}
              >
                <div className="text-red-500 text-sm font-bold whitespace-nowrap">DENSITY SPIKE: {(telemetry.crowd.standsDensity * 100).toFixed(0)}%</div>
                <div className="text-red-400/70 text-xs font-mono">EST. STAMPEDE RISK</div>
              </div>
            )}
          </div>

          {/* ESCALATORS CONCOURSE CONNECTIONS */}
          <div className="absolute top-[350px] left-[350px] w-[40px] h-[100px] bg-zinc-800" style={{ transform: 'translateZ(20px)', border: '1px solid #333' }}>
             {/* Escalator steps */}
             {Array.from({length: 10}).map((_, i) => (
                <div key={i} className={`w-full h-[2px] mt-[8px] ${hasEscalatorFailure ? 'bg-red-500' : 'bg-zinc-600'}`} />
             ))}
             {hasEscalatorFailure && (
               <div className="absolute -top-12 -left-16 bg-red-900/80 border border-red-500 px-3 py-1 rounded text-red-100 text-[10px] font-bold whitespace-nowrap" style={{ transform: 'rotateX(-55deg) rotateZ(30deg)' }}>
                 ESCALATOR B FAILURE
               </div>
             )}
          </div>

          {/* MEDICAL EMERGENCY CORRIDOR */}
          {hasMedicalEmergency && (
            <div className="absolute top-[450px] left-[500px] w-[200px] h-[50px] bg-rose-500/20 border border-rose-500/50 flex items-center justify-center animate-pulse" style={{ transform: 'translateZ(41px)' }}>
               <span className="text-rose-400 font-bold text-xs uppercase tracking-widest" style={{ transform: 'rotateX(-55deg) rotateZ(30deg)' }}>Emergency Corridor</span>
            </div>
          )}

          {/* SECURITY INCIDENT ZONE */}
          {hasSecurityAlert && (
            <div className="absolute top-[200px] left-[450px] w-[150px] h-[100px] bg-red-500/20 border-2 border-dashed border-red-500/50 flex items-center justify-center animate-pulse" style={{ transform: 'translateZ(41px)' }}>
               <span className="text-red-400 font-bold text-xs uppercase tracking-widest" style={{ transform: 'rotateX(-55deg) rotateZ(30deg)' }}>Quarantine Zone C</span>
            </div>
          )}

          {/* PARTICLES LAYER (Crowd Flow) */}
          <div className="absolute inset-0 pointer-events-none" style={{ transform: 'translateZ(45px)' }}>
            {particles.map(p => (
              <div 
                key={p.id}
                className="absolute w-[4px] h-[4px] rounded-full"
                style={{
                  left: `${p.x}px`,
                  top: `${p.y}px`,
                  backgroundColor: p.color,
                  color: p.color,
                }}
              />
            ))}
          </div>

          {/* PILLARS / SUPPORTS (Adds verticality) */}
          {[
            {x: 100, y: 100}, {x: 700, y: 100},
            {x: 100, y: 700}, {x: 700, y: 700}
          ].map((pos, i) => (
            <div 
              key={i}
              className="absolute w-[20px] h-[200px] bg-gradient-to-r from-zinc-800 to-zinc-950 border border-zinc-700/30"
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: 'rotateX(-90deg) translateZ(100px)',
                transformOrigin: 'top',
                boxShadow: '0 0 30px rgba(0,0,0,0.8)'
              }}
            />
          ))}

        </div>
      </div>

      {/* Ticker HUD Stats Overlay at bottom */}
      <div className="absolute bottom-0 left-0 w-full grid grid-cols-3 gap-2 border-t border-white/10 pt-4 pb-4 bg-black/60 backdrop-blur-md text-center text-xs font-mono shrink-0 z-20">
        <div className="flex flex-col items-center">
          <span className="text-slate-500 text-[10px] uppercase tracking-wider font-bold mb-1">
            Crowd Inside
          </span>
          <span className="text-slate-200 text-lg font-semibold">{telemetry.crowd.totalInside.toLocaleString()}</span>
        </div>
        <div className="flex flex-col items-center border-x border-white/10">
          <span className="text-slate-500 text-[10px] uppercase tracking-wider font-bold mb-1">
            Average Flow Rate
          </span>
          <span className="text-slate-200 text-lg font-semibold">{telemetry.crowd.flowRate} p/min</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-slate-500 text-[10px] uppercase tracking-wider font-bold mb-1">
            System Status
          </span>
          <span className={`text-lg font-semibold ${telemetry.riskLevel > 0.4 ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`}>
            {telemetry.riskLevel > 0.4 ? 'CRITICAL' : 'NOMINAL'}
          </span>
        </div>
      </div>
    </div>
  );
};

