import React from 'react';
import { useAppState } from '../context/AppStateContext';

export const ResourceMap: React.FC = () => {
  const { resourceStates } = useAppState();

  const getAmitState = () => {
    const s = resourceStates['Supervisor Amit'] || 'Idle';
    if (s === 'Assigned') return { status: '🟡 Dispatched', loc: 'ETA 4 min', col: 'text-[#F59E0B]' };
    if (s === 'Travelling') return { status: '🟡 En Route', loc: 'ETA 1 min', col: 'text-[#3B82F6]' };
    if (s === 'Arrived') return { status: '🟢 Active', loc: 'At Platform 3', col: 'text-[#10B981]' };
    return { status: 'Idle', loc: '25 m away', col: 'text-[#9CA3AF]' };
  };
  
  const amit = getAmitState();

  const resources = [
    { type: 'Security', name: 'Officer Rahul', status: '🟢 Active', location: 'ETA 1 min', color: 'text-[#10B981]' },
    { type: 'Medical', name: 'Team Bravo', status: '🟢 En Route', location: 'ETA 2 min', color: 'text-[#10B981]' },
    { type: 'Platform Supervisor', name: 'Supervisor Amit', status: amit.status, location: amit.loc, color: amit.col },
    { type: 'Maintenance', name: 'Escalator Tech', status: '🟡 Dispatched', location: 'ETA 5 min', color: 'text-[#F59E0B]' },
  ];

  return (
    <div className="w-full flex flex-col gap-4">
      <h2 className="text-xl font-semibold tracking-wide text-slate-100 mb-2">Live Resource Map</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {resources.map((res, idx) => (
          <div key={idx} className="glass-panel p-4 flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{res.type}</span>
              <span className={`text-xs font-medium ${res.color}`}>{res.status}</span>
            </div>
            <div>
              <div className="text-lg font-bold text-slate-200">{res.name}</div>
              <div className="text-sm font-mono text-slate-400 mt-1">{res.location}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
