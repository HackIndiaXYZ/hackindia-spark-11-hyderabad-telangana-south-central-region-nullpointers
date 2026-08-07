import React, { useEffect, useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { Terminal } from 'lucide-react';

export const DataSourcesPage: React.FC = () => {
  const { getIngestFeeds, activeScenario, telemetry } = useAppState();
  const [ticks, setTicks] = useState(0);

  // Periodically trigger a local rerender to animate the live JSON payload ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTicks((t) => t + 1);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const feeds = getIngestFeeds();

  // Helper to generate dynamic mock JSON payloads based on active scenario and ticking state
  const getMockPayload = (feedId: string) => {
    const timestamp = new Date().toISOString();
    const noise = Math.sin(ticks + feedId.charCodeAt(0)) * 2;
    
    switch (feedId) {
      case 'weather':
        return JSON.stringify({
          sensor_id: "WX-RADAR-09",
          timestamp,
          precipitation_rate_mm_h: telemetry.weather.condition === 'Heavy Rain' ? 18 : 0,
          temperature_c: telemetry.weather.temp,
          humidity_pct: telemetry.weather.condition === 'Heavy Rain' ? 95 : 62,
          wind_velocity_km_h: telemetry.weather.wind,
          status_code: "OK_SYS_UPTIME"
        }, null, 2);

      case 'traffic':
        return JSON.stringify({
          ingest_path: "LOOP-DETECTOR-EAST-22",
          timestamp,
          average_speed_km_h: activeScenario === 'heavy-rain' ? 24 : 48,
          inductance_count_sec: Math.floor(12 + noise),
          highway_saturation_ratio: activeScenario === 'heavy-rain' ? 0.85 : 0.42,
          feed_trust_factor: activeScenario === 'heavy-rain' ? 0.78 : 0.98
        }, null, 2);

      case 'crowd':
        return JSON.stringify({
          turnstiles_aggregate_inflow_sec: telemetry.crowd.flowRate,
          wifi_active_macs_concourse: Math.floor(telemetry.crowd.totalInside * 0.4 + noise * 50),
          ble_proximity_beacons_alert: telemetry.crowd.concourseDensity > 0.8,
          cctv_cv_seeding_density_ratio: telemetry.crowd.concourseDensity,
          stadium_total_inside: telemetry.crowd.totalInside
        }, null, 2);

      case 'parking':
        return JSON.stringify({
          terminal_count: 4,
          occupied_lots: Math.floor(3400 + noise * 20),
          total_lots: 4000,
          anpr_capture_rate_pct: 99.4,
          sys_voltage: 12.1
        }, null, 2);

      case 'transit':
        return JSON.stringify({
          metro_system_log: "ATS_LINE_1",
          active_trains_en_route: activeScenario === 'metro-delay' ? 3 : 8,
          headway_interval_sec: activeScenario === 'metro-delay' ? 540 : 240,
          plaza_transit_queue_est: telemetry.transport.busTerminalQueue,
          network_handshake_status: activeScenario === 'metro-delay' ? "STALE_TIMEOUT" : "ACK_SUCCESS"
        }, null, 2);

      case 'medical':
        return JSON.stringify({
          cad_dispatch_state: telemetry.medical.activeIncidents > 0 ? "ALERT_ACTIVE" : "STANDBY",
          active_dispatch_incidents: telemetry.medical.activeIncidents,
          gps_ambulance_units: [
            { unit_id: "MED-01", lat: 24.4782, lng: 54.3644 },
            { unit_id: "MED-02", lat: 24.4795, lng: 54.3621 }
          ],
          average_dispatch_latency_sec: telemetry.medical.responseTimeSec
        }, null, 2);

      case 'volunteer':
        return JSON.stringify({
          field_active_gps_pings: telemetry.volunteers.deployed || 240,
          wearable_battery_avg_pct: 82.5,
          active_task_allocation_pct: Math.floor(65 + noise * 4),
          staff_average_fatigue_ratio: telemetry.volunteers.fatigue
        }, null, 2);

      case 'security':
        return JSON.stringify({
          perimeter_sweeps_active: true,
          badge_readers_heartbeat: activeScenario === 'power-failure' ? "OFFLINE" : "ONLINE",
          alert_severity_level: telemetry.security.alertLevel || "STANDARD",
          unlocked_evacuation_gates: telemetry.gates.filter((g: any) => g.status === 'OPEN').map((g: any) => g.id)
        }, null, 2);

      case 'citizen':
        return JSON.stringify({
          geolocated_app_tickets: activeScenario === 'heavy-rain' ? 14 : activeScenario === 'metro-delay' ? 18 : 2,
          sentiment_frustration_index_pct: Math.floor(telemetry.riskLevel * 100),
          emergency_reports_verify_ratio: 0.88,
          keyword_matches: ["slip", "crowd", "wait", "stuck"]
        }, null, 2);

      default:
        return "{ 'status': 'ONLINE' }";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Healthy': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'Delayed': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in duration-300">
      {feeds.map((feed) => {
        const payload = getMockPayload(feed.id);
        
        return (
          <div key={feed.id} className="glass-panel rounded-2xl flex flex-col p-5 overflow-hidden text-left min-h-[380px]">
            
            {/* Header: Stream Name and Status */}
            <div className="flex justify-between items-start border-b border-white/5 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wide">{feed.name}</h3>
                <span className="font-mono text-[9px] text-white/30 uppercase mt-0.5 block">Refresh: {feed.refreshRate}</span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 border rounded uppercase ${getStatusColor(feed.status)}`}>
                {feed.status}
              </span>
            </div>

            {/* Lineage Details */}
            <div className="space-y-2 text-xs mb-4 font-mono">
              <div>
                <span className="text-white/30 text-[9px] uppercase block">Mock Data (Hackathon)</span>
                <span className="text-indigo-300 text-xs font-semibold">{feed.hackathonSource}</span>
              </div>
              <div>
                <span className="text-white/30 text-[9px] uppercase block">Equipment (Production)</span>
                <span className="text-green-400 text-xs font-semibold">{feed.productionSource}</span>
              </div>
              
              {/* Trust Score Bar */}
              <div className="pt-2 border-t border-white/5">
                <div className="flex justify-between items-center text-[10px] mb-1">
                  <span className="text-white/30 uppercase">Data Trust Score</span>
                  <span className={`font-bold ${feed.trust > 85 ? 'text-green-400' : feed.trust > 50 ? 'text-amber-400' : 'text-red-400'}`}>
                    {feed.trust}%
                  </span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      feed.trust > 85 ? 'bg-green-500' : feed.trust > 50 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${feed.trust}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Live payload terminal */}
            <div className="flex-1 flex flex-col rounded-xl bg-black/40 border border-white/5 p-3 overflow-hidden font-mono text-[10px] relative">
              <div className="flex justify-between items-center text-white/30 border-b border-white/5 pb-1.5 mb-2 shrink-0">
                <span className="flex items-center gap-1">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  Raw Telemetry Stream
                </span>
                <span className="text-[8px]">Last Received: {feed.lastUpdated}</span>
              </div>
              <pre className="flex-1 overflow-auto text-green-400/90 leading-tight select-text scrollbar-thin">
                {payload}
              </pre>
            </div>

          </div>
        );
      })}
    </div>
  );
};
