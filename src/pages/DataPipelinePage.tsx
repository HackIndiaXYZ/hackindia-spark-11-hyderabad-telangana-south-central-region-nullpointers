import React from 'react';
import { useAppState } from '../context/AppStateContext';
import { Server, Activity, Clock, ShieldCheck, Database, ArrowRight, ArrowDown } from 'lucide-react';

export const DataPipelinePage: React.FC = () => {
  const { getIngestFeeds } = useAppState();
  const feeds = getIngestFeeds();

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
      <div className="flex items-center gap-3 mb-4 border-b border-[#1F2937] pb-2">
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
          <div key={feed.id} className={`grid grid-cols-5 gap-4 items-center px-4 py-3 rounded-lg border ${getStatusBgColor(feed.status)}`}>
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
              <div className="flex-1 h-1.5 bg-[#1F2937] rounded-full overflow-hidden">
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
      
      {/* Top section: Two columns of feeds */}
      <div className="grid grid-cols-2 gap-12">
        <div className="glass-panel p-6">
          <FeedTable title="Live Sources" data={liveFeeds} />
          <FeedTable title="Simulated Sources" data={simFeeds} />
        </div>

        {/* Right side: Pipeline Health and Data Flow */}
        <div className="flex flex-col gap-8">
          
          {/* Pipeline Health */}
          <div className="glass-panel p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-3">
              <Activity className="w-5 h-5 text-[#3B82F6]" />
              Pipeline Health
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-[#0F172A] p-4 rounded-lg border border-[#1F2937]">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Overall Availability</div>
                <div className="text-3xl font-bold text-[#10B981]">99.8%</div>
                <div className="mt-4 h-2 bg-[#1F2937] rounded-full overflow-hidden">
                  <div className="h-full bg-[#10B981] w-[99.8%]" />
                </div>
              </div>
              <div className="bg-[#0F172A] p-4 rounded-lg border border-[#1F2937]">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Average Latency</div>
                <div className="text-3xl font-bold text-[#3B82F6]">132 ms</div>
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <Clock className="w-3 h-3" /> P99: 215ms
                </div>
              </div>
              <div className="bg-[#0F172A] p-4 rounded-lg border border-[#1F2937]">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Events / Sec</div>
                <div className="text-3xl font-bold text-slate-200">42</div>
                <div className="mt-4 flex items-center gap-2 text-xs text-[#10B981] font-mono">
                  +12% vs avg
                </div>
              </div>
              <div className="bg-[#0F172A] p-4 rounded-lg border border-[#1F2937]">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Messages Processed</div>
                <div className="text-3xl font-bold text-slate-200">18,220</div>
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <Database className="w-3 h-3" /> Last 1hr
                </div>
              </div>
            </div>
          </div>

          {/* Data Flow Diagram */}
          <div className="glass-panel p-6 flex-1 flex flex-col">
            <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#8B5CF6]" />
              Data Flow Architecture
            </h2>
            <div className="flex-1 flex flex-col justify-center items-center py-4 text-sm font-bold text-slate-300">
              
              <div className="flex items-center justify-center gap-4 w-full px-8">
                <div className="bg-[#1F2937] px-4 py-3 rounded-lg border border-[#374151] flex-1 text-center shadow-lg">
                  Raw Sources
                </div>
                <ArrowRight className="text-slate-500" />
                <div className="bg-[#3B82F6]/20 text-[#3B82F6] px-4 py-3 rounded-lg border border-[#3B82F6]/40 flex-1 text-center shadow-lg">
                  Parser & Normalizer
                </div>
                <ArrowRight className="text-slate-500" />
                <div className="bg-[#10B981]/20 text-[#10B981] px-4 py-3 rounded-lg border border-[#10B981]/40 flex-1 text-center shadow-lg">
                  Kafka Data Bus
                </div>
              </div>

              <ArrowDown className="text-slate-500 my-4" />

              <div className="bg-[#8B5CF6]/20 text-[#8B5CF6] px-8 py-4 rounded-lg border border-[#8B5CF6]/40 w-3/4 text-center shadow-lg text-lg">
                Context Fusion Engine
              </div>

              <ArrowDown className="text-slate-500 my-4" />

              <div className="flex items-center justify-center gap-4 w-3/4">
                 <div className="bg-[#F59E0B]/20 text-[#F59E0B] px-4 py-3 rounded-lg border border-[#F59E0B]/40 flex-1 text-center shadow-lg">
                  Operational Reasoning
                </div>
                <ArrowRight className="text-slate-500" />
                <div className="bg-[#EF4444]/20 text-[#EF4444] px-4 py-3 rounded-lg border border-[#EF4444]/40 flex-1 text-center shadow-lg">
                  Decision Intelligence
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
