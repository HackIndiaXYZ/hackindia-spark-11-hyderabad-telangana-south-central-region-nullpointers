import React from 'react';
import { useAppState } from '../context/AppStateContext';

export const DataSourcesPage: React.FC = () => {
  const { getIngestFeeds } = useAppState();
  const feeds = getIngestFeeds();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Healthy': return 'text-[#10B981] bg-[#10B981]/10';
      case 'Delayed': return 'text-[#F59E0B] bg-[#F59E0B]/10';
      default: return 'text-[#EF4444] bg-[#EF4444]/10';
    }
  };

  return (
    <div className="glass-panel p-6 w-full max-w-6xl mx-auto mt-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Live Data Sources</h2>
          <p className="text-sm text-slate-400">Enterprise telemetry integration layer</p>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1F2937] text-xs uppercase tracking-wider text-slate-500 font-semibold">
              <th className="pb-3 px-4">Source</th>
              <th className="pb-3 px-4">Status</th>
              <th className="pb-3 px-4">Trust</th>
              <th className="pb-3 px-4">Latency</th>
              <th className="pb-3 px-4">Refresh</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F2937]">
            {feeds.map((feed) => (
              <tr key={feed.id} className="hover:bg-[#111827]/80 transition-colors">
                <td className="py-4 px-4">
                  <div className="font-semibold text-slate-200">{feed.name}</div>
                  <div className="text-xs text-slate-500 font-mono mt-1">{feed.productionSource}</div>
                </td>
                <td className="py-4 px-4">
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${getStatusColor(feed.status)}`}>
                    {feed.status}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-sm ${feed.trust > 85 ? 'text-[#10B981]' : feed.trust > 50 ? 'text-[#F59E0B]' : 'text-[#EF4444]'}`}>
                      {feed.trust}%
                    </span>
                    <div className="w-16 h-1.5 bg-[#1F2937] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${feed.trust > 85 ? 'bg-[#10B981]' : feed.trust > 50 ? 'bg-[#F59E0B]' : 'bg-[#EF4444]'}`}
                        style={{ width: `${feed.trust}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="font-mono text-slate-300 text-sm">{feed.lastUpdated}</span>
                </td>
                <td className="py-4 px-4">
                  <span className="font-mono text-slate-400 text-sm">{feed.refreshRate}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

