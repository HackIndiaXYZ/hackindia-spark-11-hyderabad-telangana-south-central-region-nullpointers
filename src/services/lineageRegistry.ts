import type { LineageData } from '../components/common/InfoModal';

export const LINEAGE_REGISTRY: Record<string, LineageData> = {
  'stands-density': {
    title: 'Stands Crowd Density',
    type: 'DERIVED METRICS',
    sourceName: 'Crowd Density Ingestion',
    hackathonSource: 'Client-side Telemetry Simulation Engine',
    productionSource: 'CCTV People Counting Cameras + WiFi Probe Requests + Bluetooth Beacons',
    refreshRate: '3 seconds',
    logic: 'Calculates the ratio of active seats occupied in the bowl by counting unique MAC address probe pings and computer vision human silhouettes.',
    usage: 'Predicts evacuation duration and exit gangway bottlenecks.'
  },
  'concourse-density': {
    title: 'Concourse Density Index',
    type: 'DERIVED METRICS',
    sourceName: 'Crowd Density Ingestion',
    hackathonSource: 'Client-side Telemetry Simulation Engine',
    productionSource: 'People Counting Cameras + WiFi Probe Requests + Bluetooth Beacons',
    refreshRate: '3 seconds',
    logic: 'Aggregates spatial density of concourse pathways using CCTV computer vision grid occupancy ratios.',
    usage: 'Identifies crushing hazards and triggers volunteer redistribution protocols.'
  },
  'gate-occupancy': {
    title: 'Perimeter Gate Queue Occupancy',
    type: 'LIVE DATA',
    sourceName: 'Crowd Density Ingestion',
    hackathonSource: 'Client-side Telemetry Simulation Engine',
    productionSource: 'Turnstile Counters + CCTV Queue Length Estimators',
    refreshRate: '3 seconds',
    logic: 'Tracks real-time swipe logs at ticketing turnstiles divided by target throughput limits.',
    usage: 'Identifies scan bottleneck delays and recommends opening emergency exits.'
  },
  'flow-rate': {
    title: 'Average Crowd Flow Rate',
    type: 'DERIVED METRICS',
    sourceName: 'Crowd Density Ingestion',
    hackathonSource: 'Client-side Telemetry Simulation Engine',
    productionSource: 'Turnstile Counters + People Counting Cameras',
    refreshRate: '3 seconds',
    logic: 'Measures the rate of ticket scans per minute across all entrance channels.',
    usage: 'Estimates time of stadium seating saturation.'
  },
  'active-alerts': {
    title: 'Security Alert Incidents',
    type: 'LIVE DATA',
    sourceName: 'Security Ingestion',
    hackathonSource: 'Mock CCTV security event generator',
    productionSource: 'CCTV CV anomalous movement detection + Access logs (RFID Badge Reader logs)',
    refreshRate: '10 seconds',
    logic: 'Logs active safety tickets registered by security staff or automatically flagged by CCTV abnormal velocity checks.',
    usage: 'Triggers priority alarm levels and increases risk factor calculations.'
  },
  'medical-response': {
    title: 'Avg Medical Response Time',
    type: 'DERIVED METRICS',
    sourceName: 'Medical Ingestion',
    hackathonSource: 'Mock Incident Feed',
    productionSource: 'Hospital ERP system + Emergency Dispatch CAD terminals + Responder GPS',
    refreshRate: '10 seconds',
    logic: 'Calculates dispatch-to-arrival latency by tracking responder GPS coordinates entering incident radius.',
    usage: 'Identifies bottlenecks in access walkways. Triggers standby squads.'
  },
  'volunteer-fatigue': {
    title: 'Staff Fatigue Index',
    type: 'DERIVED METRICS',
    sourceName: 'Volunteer Ingestion',
    hackathonSource: 'Simulated GPS & duty roster tracker',
    productionSource: 'Volunteer Mobile App GPS + Active Task Queue + QR Checkpoints',
    refreshRate: '5 seconds',
    logic: 'Calculates fatigue levels based on shift duration, active movement distance (GPS), and consecutive tasks completed.',
    usage: 'Balances workforce deployment and rotates personnel out of high-density zones.'
  },
  'metro-status': {
    title: 'Metro Transit Intervals',
    type: 'LIVE DATA',
    sourceName: 'Public Transit Ingestion',
    hackathonSource: 'GTFS static feeds & mock train logs',
    productionSource: 'Metro ATS Operations API (Automatic Train Supervision logs)',
    refreshRate: '30 seconds',
    logic: 'Pulls train location logs and signal terminal departures from rail control servers.',
    usage: 'Predicts egress plaza crowd surges when train intervals spike.'
  },
  'weather': {
    title: 'Precipitation & Wind Telemetry',
    type: 'LIVE DATA',
    sourceName: 'Weather Ingestion',
    hackathonSource: 'OpenWeather API',
    productionSource: 'IMD Meteorological API + Local Venue Micro-weather Precipitation Radar',
    refreshRate: '5 minutes',
    logic: 'Retrieves localized barometric pressure, rain rate (mm/h), and wind velocities.',
    usage: 'Calculates crowd migration shifts to covered stands.'
  },
  'risk-score': {
    title: 'Global Risk Factor',
    type: 'AI INSIGHTS',
    sourceName: 'Context Fusion Engine',
    hackathonSource: 'Context Fusion Engine heuristics',
    productionSource: 'Context Fusion Engine + Decision Reasoning Engine',
    refreshRate: '3 seconds',
    logic: 'Fuses concourse density (40%), transit delays (20%), weather rates (20%), and medical dispatch latency (20%) into a unified vector safety index.',
    usage: 'Heartbeat safety threshold. Determines emergency overrides.'
  },
  'operational-health': {
    title: 'Operational Health Index',
    type: 'AI INSIGHTS',
    sourceName: 'Context Fusion Engine',
    hackathonSource: 'Context Fusion Engine heuristics',
    productionSource: 'Context Fusion Engine + Decision Reasoning Engine',
    refreshRate: '3 seconds',
    logic: 'Calculates system-wide efficiency (100 - Risk Score) adjusting for active resolution overrides.',
    usage: 'Central executive parameter indicating global operations integrity.'
  },
  'traffic': {
    title: 'Road Traffic Flow',
    type: 'LIVE DATA',
    sourceName: 'Road Traffic Ingestion',
    hackathonSource: 'Google Maps API',
    productionSource: 'Google Maps / TomTom API + Local Inductive Loop Traffic Sensors',
    refreshRate: '1 minute',
    logic: 'Aggregates vehicle speeds and congestion levels along major stadium approach roads.',
    usage: 'Predicts commuter arrival surges and calculates ambulance response routes.'
  },
  'citizen': {
    title: 'Citizen Community Signals',
    type: 'LIVE DATA',
    sourceName: 'Citizen Reports Ingestion',
    hackathonSource: 'Mock Community Feed',
    productionSource: 'Citizen Reporting Mobile App + Geo-localized Sentiment API',
    refreshRate: '1 minute',
    logic: 'Scrapes geo-fenced report tickets, mobile app checkins, and keyword triggers.',
    usage: 'Detects early crowd discomfort indicators (slippery stairs, queuing bottlenecks) before official logs catch them.'
  }
};
