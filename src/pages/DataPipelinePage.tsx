import React, { useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import type { IngestFeed } from '../context/AppStateContext';
import { Server, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { SourcePreviewModal } from '../components/common/SourcePreviewModal';

export const DataPipelinePage: React.FC = () => {
  const { getIngestFeeds, lastIngestedPacket, liveEventsLog } = useAppState();
  const feeds = getIngestFeeds();
  const [selectedPreviewFeed, setSelectedPreviewFeed] = useState<IngestFeed | null>(null);
  const [viewOffset, setViewOffset] = useState(0);

  const displayedPacket = liveEventsLog.length > 0 ? liveEventsLog[Math.min(viewOffset, liveEventsLog.length - 1)] : lastIngestedPacket;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Healthy': return 'text-[#10B981]';
      case 'Delayed': return 'text-[#F59E0B]';
      default: return 'text-[#EF4444]';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'Healthy': return 'bg-[#10B981]/10 border-[#10B981]/20';
      case 'Delayed': return 'bg-[#F59E0B]/10 border-[#F59E0B]/20';
      default: return 'bg-[#EF4444]/10 border-[#EF4444]/20';
    }
  };

  const liveFeeds = feeds.filter(f => ['weather', 'traffic', 'transit'].includes(f.id));
  const simFeeds = feeds.filter(f => !['weather', 'traffic', 'transit'].includes(f.id));

  const FeedTable = ({ title, data }: { title: string, data: typeof feeds }) => (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4 border-b border-[#27272a] pb-2">
        <Server className="w-5 h-5 text-slate-400" />
        <h2 className="text-lg font-bold text-slate-200">{title}</h2>
      </div>
      <div className="grid grid-cols-5 gap-4 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider px-4">
        <div className="col-span-2">Source</div>
        <div>Status</div>
        <div>Latency / Refresh</div>
        <div>Trust Score</div>
      </div>
      <div className="flex flex-col gap-2">
        {data.map(feed => (
          <div 
            key={feed.id} 
            onClick={() => setSelectedPreviewFeed(feed)}
            className={`grid grid-cols-5 gap-4 items-center px-4 py-3 rounded-lg border cursor-pointer hover:brightness-110 transition-all ${getStatusBgColor(feed.status)}`}
          >
            <div className="col-span-2 flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${feed.status === 'Healthy' ? 'bg-[#10B981]' : feed.status === 'Delayed' ? 'bg-[#F59E0B]' : 'bg-[#EF4444]'} animate-pulse`} />
              <div>
                <div className="font-bold text-slate-200">{feed.name}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{feed.productionSource}</div>
              </div>
            </div>
            <div className={`font-bold text-sm ${getStatusColor(feed.status)}`}>
              {feed.status}
            </div>
            <div>
              <div className="text-sm font-mono text-slate-300">{feed.lastUpdated}</div>
              <div className="text-[10px] text-slate-500 font-mono">{feed.refreshRate}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`font-bold text-sm ${feed.trust > 85 ? 'text-[#10B981]' : feed.trust > 50 ? 'text-[#F59E0B]' : 'text-[#EF4444]'}`}>
                {feed.trust}%
              </span>
              <div className="flex-1 h-1.5 bg-[#27272a] rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${feed.trust > 85 ? 'bg-[#10B981]' : feed.trust > 50 ? 'bg-[#F59E0B]' : 'bg-[#EF4444]'}`}
                  style={{ width: `${feed.trust}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 pb-12 mt-6">
      <SourcePreviewModal feed={selectedPreviewFeed} onClose={() => setSelectedPreviewFeed(null)} />
      
      {/* Top section: Feeds */}
      <div className="max-w-3xl mx-auto w-full">
        <div className="flex flex-col gap-8">
          {/* Live Ingestion Stream */}
          <div className="glass-panel p-6 border-l-4 border-l-[#3B82F6] relative overflow-hidden flex flex-col gap-4">
            <div className="absolute top-0 right-0 p-4">
              <div className="flex gap-1">
                 <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{animationDelay: '0ms'}}/>
                 <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{animationDelay: '150ms'}}/>
                 <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{animationDelay: '300ms'}}/>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-200 flex items-center gap-3 uppercase tracking-widest">
                Live Ingestion Stream
              </h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setViewOffset(prev => Math.min(liveEventsLog.length - 1, prev + 1))}
                  disabled={viewOffset >= liveEventsLog.length - 1 || liveEventsLog.length === 0}
                  className="p-1 rounded bg-[#27272a] hover:bg-slate-700 disabled:opacity-50 text-slate-300 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono text-slate-500 w-12 text-center">
                  {viewOffset === 0 ? 'LATEST' : `-${viewOffset}`}
                </span>
                <button 
                  onClick={() => setViewOffset(prev => Math.max(0, prev - 1))}
                  disabled={viewOffset === 0}
                  className="p-1 rounded bg-[#27272a] hover:bg-slate-700 disabled:opacity-50 text-slate-300 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {displayedPacket ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-blue-400 font-mono text-xs">{displayedPacket.time}</span>
                    <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30 text-[10px] font-bold uppercase tracking-wider">
                      {displayedPacket.source}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{displayedPacket.packetId || 'PKT-PENDING'}</span>
                </div>
                
                <div className="text-sm font-semibold text-white">
                  {displayedPacket.message}
                </div>

                {/* AI Pipeline Mini View */}
                {displayedPacket.rawInput && (
                  <div className="flex flex-col gap-3 bg-[#09090b] border border-[#27272a] rounded-lg p-4 mt-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Raw Input</span>
                      <span className="text-xs font-mono text-slate-300 bg-[#18181b] px-2 py-1 rounded border border-[#374151]">{displayedPacket.rawInput}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
                        <ArrowDown className="w-3 h-3 text-indigo-400" /> AI Model
                      </span>
                      <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20 w-fit">{displayedPacket.aiModel}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
                        <ArrowDown className="w-3 h-3 text-emerald-400" /> Extracted Insights
                      </span>
                      <span className="text-xs text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">{displayedPacket.extractedInsights}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-slate-500 text-sm py-8 text-center">Awaiting telemetry packet...</div>
            )}
          </div>

          <div className="glass-panel p-6">
            <FeedTable title="Live Sources" data={liveFeeds} />
            <FeedTable title="Simulated Sources" data={simFeeds} />
          </div>
        </div>


      </div>
    </div>
  );
};
