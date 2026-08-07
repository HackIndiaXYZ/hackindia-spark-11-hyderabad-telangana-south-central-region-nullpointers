import React, { useEffect, useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { AlertTriangle, Activity } from 'lucide-react';

export const DigitalTwin: React.FC = () => {
  const { telemetry, activeScenario, simulationStep, isApproving, isIntervened } = useAppState();

  const [medicalPos, setMedicalPos] = useState({ x: 250, y: 130 });
  const [trainX, setTrainX] = useState(50);
  const [trainY, setTrainY] = useState(50);

  // Train Animation Logic
  useEffect(() => {
    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      // Move East-West Train
      setTrainX(50 + ((frame * 2) % 400));
      // Move North-South Train
      setTrainY(50 + ((frame * 1.5) % 400));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Patrol Dispatch Animation Logic
  useEffect(() => {
    const hasMedicalIncident = telemetry?.incidents?.some((i: any) => i.type === 'MEDICAL' && i.status === 'RESPONDING');
    
    if (hasMedicalIncident) {
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
      setMedicalPos({ x: 400, y: 80 });
    }
  }, [telemetry?.incidents]);

  if (!telemetry) return null;

  // Determine if we should activate the "Hidden Killer Feature" zoom
  const hasRecommendation = activeScenario !== 'normal' && simulationStep >= 2 && !isIntervened;
  
  // Base SVG viewBox
  let viewBox = "0 0 500 500";
  // Zoom into Platform 2 (South Platform area) when recommendation appears
  if (hasRecommendation) {
    viewBox = "100 200 300 250"; 
  }

  const renderMetroStation = () => {
    const elements: React.ReactNode[] = [];
    
    // Main Concourse Background
    elements.push(
      <rect key="concourse" x="50" y="50" width="400" height="400" rx="8" fill="#111827" stroke="#1F2937" strokeWidth="2" className="transition-all duration-700" />
    );

    // East-West Metro Line (Tracks)
    elements.push(
      <rect key="track-ew" x="50" y="160" width="400" height="40" fill="#0B1220" stroke="#1F2937" strokeWidth="1" />
    );
    elements.push(<line key="track-ew-1" x1="50" y1="170" x2="450" y2="170" stroke="#374151" strokeWidth="1" strokeDasharray="4 2" />);
    elements.push(<line key="track-ew-2" x1="50" y1="190" x2="450" y2="190" stroke="#374151" strokeWidth="1" strokeDasharray="4 2" />);

    // Moving Train EW
    elements.push(
      <rect key="moving-train-ew" x={trainX} y="162" width="60" height="36" rx="4" fill="#2563EB" opacity={0.8} />
    );

    // North-South Metro Line (Tracks)
    elements.push(
      <rect key="track-ns" x="230" y="50" width="40" height="400" fill="#0B1220" stroke="#1F2937" strokeWidth="1" />
    );
    elements.push(<line key="track-ns-1" x1="240" y1="50" x2="240" y2="450" stroke="#374151" strokeWidth="1" strokeDasharray="4 2" />);
    elements.push(<line key="track-ns-2" x1="260" y1="50" x2="260" y2="450" stroke="#374151" strokeWidth="1" strokeDasharray="4 2" />);

    // Moving Train NS
    elements.push(
      <rect key="moving-train-ns" x="232" y={trainY} width="36" height="60" rx="4" fill="#2563EB" opacity={0.8} />
    );

    // Central Hub Platform (Dynamic Color based on density)
    let hubDensity = telemetry.crowd.standsDensity;
    if (activeScenario === 'metro-delay') hubDensity = 0.9;
    let hubFill = hubDensity > 0.85 ? 'fill-[#EF4444]/20 stroke-[#EF4444]/50' : hubDensity > 0.7 ? 'fill-[#F59E0B]/20 stroke-[#F59E0B]/50' : 'fill-[#1F2937] stroke-[#374151]';

    elements.push(
      <rect key="hub-platform" x="180" y="200" width="140" height="100" rx="4" className={`${hubFill} transition-all duration-700`} strokeWidth="1.5" />
    );

    // North Platform 1
    elements.push(
      <rect key="platform-n" x="190" y="90" width="120" height="50" rx="2" fill="#1F2937" stroke="#374151" strokeWidth="1" />
    );
    elements.push(
      <text key="lbl-n" x="250" y="115" textAnchor="middle" fill="#9CA3AF" fontSize="12" fontWeight="bold">Platform 1</text>
    );

    // South Platform 2
    elements.push(
      <rect key="platform-s" x="190" y="320" width="120" height="50" rx="2" fill="#1F2937" stroke="#374151" strokeWidth="1" />
    );
    elements.push(
      <text key="lbl-s" x="250" y="345" textAnchor="middle" fill="#9CA3AF" fontSize="12" fontWeight="bold">Platform 2</text>
    );
    
    // Zoom Highlight Context
    if (hasRecommendation) {
       elements.push(
          <rect key="platform-s-highlight" x="185" y="315" width="130" height="60" rx="4" fill="none" stroke="#EF4444" strokeWidth="2" className="animate-pulse" />
       );
       elements.push(
          <g key="platform-context" transform="translate(190, 275)">
            <rect width="120" height="36" rx="4" fill="#111827" stroke="#EF4444" strokeWidth="1" />
            <text x="10" y="14" fill="#EF4444" fontSize="10" fontWeight="bold">Density: 91% (CRIT)</text>
            <text x="10" y="28" fill="#9CA3AF" fontSize="10">Expected: 97%</text>
          </g>
       );
       
       if (isApproving) {
         elements.push(
            <g key="platform-resolving" transform="translate(190, 385)">
              <rect width="120" height="24" rx="4" fill="#111827" stroke="#10B981" strokeWidth="1" />
              <text x="60" y="16" textAnchor="middle" fill="#10B981" fontSize="10" fontWeight="bold">Action Executing...</text>
            </g>
         );
       }
    }

    // Escalators
    elements.push(<rect key="esc-1" x="200" y="200" width="20" height="30" fill="#374151" />);
    elements.push(<rect key="esc-2" x="280" y="200" width="20" height="30" fill="#374151" />);
    
    // Flow arrows
    elements.push(<path key="flow-1" d="M 210 215 L 210 225 L 205 220 M 210 225 L 215 220" stroke="#10B981" strokeWidth="1.5" fill="none" />);
    elements.push(<path key="flow-2" d="M 290 225 L 290 215 L 285 220 M 290 215 L 295 220" stroke="#10B981" strokeWidth="1.5" fill="none" />);

    return elements;
  };

  const activeIncidents = telemetry.incidents || [];
  const activeGates = telemetry.gates || [];

  return (
    <div className="relative w-full h-full glass-panel flex flex-col p-5 overflow-hidden">
      
      {/* HUD Header */}
      <div className="flex justify-between items-center border-b border-[#1F2937] pb-3 mb-4 z-20 shrink-0">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#2563EB]" />
          <span className="font-semibold text-sm uppercase tracking-widest text-slate-200">Digital Twin</span>
        </div>
        <div className="flex gap-4 text-[10px] font-mono text-slate-500">
          <span>SCALE: 1:1200</span>
          <span>LATITUDE: 24.478° N</span>
        </div>
      </div>

      {/* SVG Container */}
      <div className="relative flex-1 flex items-center justify-center">
        {/* Dynamic Warning Alert Overlay */}
        {activeIncidents.length > 0 && !hasRecommendation && (
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
            {activeIncidents.map((inc: any) => (
              <div key={inc.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs font-mono font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 text-[#EF4444] shrink-0" />
                <span className="font-bold">{inc.id}</span>
                <span className="text-[10px] uppercase">{inc.type} // {inc.location}</span>
              </div>
            ))}
          </div>
        )}

        {/* Metro Station Top-Down Layout Map */}
        <svg viewBox={viewBox} className="w-full h-full max-w-[800px] max-h-[800px] relative z-0 transition-all duration-1000 ease-in-out">
          
          {/* Dimming overlay when recommendation appears */}
          {hasRecommendation && (
            <rect x="0" y="0" width="500" height="500" fill="#000000" opacity="0.4" className="transition-opacity duration-1000" />
          )}

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
              <g key={gate.id} className={hasRecommendation ? "opacity-30" : "opacity-100"}>
                <circle cx={gx} cy={gy} r="10" fill="#111827" stroke={isOffline ? '#EF4444' : gate.occupancy > 0.85 ? '#F59E0B' : '#10B981'} strokeWidth="1" />
                <text x={gx} y={gy + 3} textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="monospace">
                  {gate.id}
                </text>
              </g>
            );
          })}

          {/* Dynamic Patrol Units */}
          <circle cx={100 + 300 * Math.abs(Math.sin(Date.now() / 8000))} cy="100" r="4" fill="#3B82F6" className={hasRecommendation ? "opacity-30" : "opacity-100"} />
          <circle cx={400 - 300 * Math.abs(Math.sin(Date.now() / 8000))} cy="400" r="4" fill="#3B82F6" className={hasRecommendation ? "opacity-30" : "opacity-100"} />
          
          {/* Animated Medical Responder */}
          <circle 
            cx={medicalPos.x} 
            cy={medicalPos.y} 
            r="4" 
            fill="#10B981" 
            className={hasRecommendation ? "opacity-30" : "opacity-100"}
          />
        </svg>
      </div>

      {/* Ticker HUD Stats Overlay at bottom of Digital Twin */}
      <div className="grid grid-cols-3 gap-2 border-t border-[#1F2937] pt-4 mt-2 text-center text-xs font-mono shrink-0">
        <div className="flex flex-col items-center">
          <span className="text-slate-500 text-[10px] uppercase tracking-wider flex items-center gap-1 justify-center font-bold">
            Crowd Inside
          </span>
          <span className="text-slate-300 font-semibold">{telemetry.crowd.totalInside.toLocaleString()}</span>
        </div>
        <div className="flex flex-col items-center border-x border-[#1F2937]">
          <span className="text-slate-500 text-[10px] uppercase tracking-wider flex items-center gap-1 justify-center font-bold">
            Average Flow Rate
          </span>
          <span className="text-slate-300 font-semibold">{telemetry.crowd.flowRate} p/min</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-slate-500 text-[10px] uppercase tracking-wider flex items-center gap-1 justify-center font-bold">
            Active Alerts
          </span>
          <span className={`font-semibold ${activeIncidents.length > 0 ? 'text-[#EF4444] font-extrabold' : 'text-[#10B981]'}`}>
            {activeIncidents.length > 0 ? `${activeIncidents.length} Alert${activeIncidents.length > 1 ? 's' : ''}` : 'None'}
          </span>
        </div>
      </div>
    </div>
  );
};

