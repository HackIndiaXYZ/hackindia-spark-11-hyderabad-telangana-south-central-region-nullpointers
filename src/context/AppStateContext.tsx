import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { LineageData } from '../components/common/InfoModal';
import normalData from '../../public/mock-data/normal.json';
import heavyRainData from '../../public/mock-data/heavy-rain.json';
import metroDelayData from '../../public/mock-data/metro-delay.json';
import medicalEmergencyData from '../../public/mock-data/medical-emergency.json';
import gateFailureData from '../../public/mock-data/gate-failure.json';
import vipArrivalData from '../../public/mock-data/vip-arrival.json';
import powerFailureData from '../../public/mock-data/power-failure.json';
import { generateEventInsights } from '../services/groqService';

export const SCENARIO_DATA: Record<string, any> = {
  'normal': normalData,
  'heavy-rain': heavyRainData,
  'metro-delay': metroDelayData,
  'medical-emergency': medicalEmergencyData,
  'gate-failure': gateFailureData,
  'vip-arrival': vipArrivalData,
  'power-failure': powerFailureData
};

export type RoleType = 'commander' | 'station' | 'passenger' | 'security' | 'transit' | 'emergency' | null;
export type ResourceState = 'Idle' | 'Assigned' | 'Travelling' | 'Arrived' | 'Completed';

export interface ReplayItem {
  id: string;
  timestamp: string;
  scenario: string;
  roleName: string;
  recommendationTitle: string;
  recommendationDesc: string;
  confidence: number;
  expectedImpact: string;
  actualHealth: number;
  actualRisk: number;
  counterfactualHealth: number;
  counterfactualRisk: number;
}

export interface IngestFeed {
  id: string;
  name: string;
  hackathonSource: string;
  productionSource: string;
  status: 'Healthy' | 'Delayed' | 'Offline';
  lastUpdated: string;
  trust: number;
  refreshRate: string;
}

export interface LiveEvent {
  id: string;
  time: string;
  source: string;
  message: string;
  type: 'info' | 'warning' | 'critical' | 'success';
  packetId?: string;
  affectedModules?: string[];
  
  // AI Pipeline Metadata
  rawInput?: string;
  aiModel?: string;
  extractedInsights?: string;
  contextFusion?: string;
  prediction?: string;
  decision?: string;
}

interface AppStateContextType {
  currentRole: RoleType;
  setRole: (role: RoleType) => void;
  activeScenario: string;
  selectScenario: (scenario: string) => void;
  isSimulating: boolean;
  setIsSimulating: (simulating: boolean) => void;
  telemetry: any; // Live mutable state
  isIntervened: boolean;
  approveIntervention: () => void;
  approvedScenarios: Record<string, boolean>;
  replayHistory: ReplayItem[];
  approvalLogs: string[];
  isApproving: boolean;
  resetSimulation: () => void;
  
  // New Generative Live State
  liveEventsLog: LiveEvent[];
  pipelineMetrics: {
    eventsPerSec: number;
    avgLatency: number;
    queueSize: number;
    packetsProcessed: number;
  };
  activeRecommendation: any | null; // AI recommendation currently active
  resourceStates: Record<string, ResourceState>;
  currentPulseModule: string | null;
  lastIngestedPacket: LiveEvent | null;
  
  activeTab: 'vision-intelligence' | 'overview' | 'data-pipeline' | 'digital-twin' | 'decision-center' | 'replay' | 'settings';
  setActiveTab: (tab: 'vision-intelligence' | 'overview' | 'data-pipeline' | 'digital-twin' | 'decision-center' | 'replay' | 'settings') => void;
  lineageModalData: LineageData | null;
  setLineageModalData: (data: LineageData | null) => void;
  getIngestFeeds: () => IngestFeed[];
  getConfidenceBreakdown: () => { label: string; value: number }[];
  getTrustPenalty: () => { feedName: string; penalty: number } | null;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

// Initial base state
const INITIAL_TELEMETRY = JSON.parse(JSON.stringify(normalData.telemetrySteps[0]));

// The rigid narrative sequence
type EventLogic = (tel: any, ctx: any) => void;
interface SequenceEvent {
  source: string;
  message: string;
  type: 'info'|'warning'|'critical'|'success';
  affectedModules: string[];
  logic: EventLogic;
  
  rawInput?: string;
  aiModel?: string;
  extractedInsights?: string;
  contextFusion?: string;
  prediction?: string;
  decision?: string;
}

const NARRATIVE_SEQUENCE: SequenceEvent[] = [
  { 
    source: 'Weather API', message: 'Rain probability 82%', type: 'info', affectedModules: ['Context Fusion', 'Prediction'], 
    rawInput: 'Rain: 82%, Wind: 18 km/h', aiModel: 'AI Behaviour Model', extractedInsights: 'Covered Entrance Usage +31%, Platform Waiting Time +18%', contextFusion: 'Correlated with rush hour baseline', prediction: 'Platform entry bottleneck in 15 mins', decision: 'Prepare Additional Entry Gates',
    logic: (tel, ctx) => { tel.weather.precipitation = '82%'; tel.weather.condition = 'Heavy Rain'; ctx.setMetrics({lat: 112, qs: 4, eps: 42}); } 
  },
  { 
    source: 'Google Maps Traffic', message: 'Heavy Traffic on East Corridor', type: 'warning', affectedModules: ['Context Fusion', 'Prediction Engine'], 
    rawInput: 'Traffic: Heavy, Arrival Roads: East Corridor', aiModel: 'Route Optimization Engine', extractedInsights: 'Passenger Delay: 7 min, Ride Share Congestion: High', contextFusion: 'Aggregated with Weather Delay', prediction: 'Passenger Arrival Surge 8 minutes later', decision: 'Adjust AFC gate inflow rate',
    logic: (_tel, ctx) => { ctx.setMetrics({lat: 135, qs: 8, eps: 45}); } 
  },
  { 
    source: 'Metro ATS', message: 'Blue Line Delayed by 3 min', type: 'critical', affectedModules: ['Context Fusion', 'Prediction', 'Decision Center'], 
    rawInput: 'Blue Line: Running -> Delay +3 min', aiModel: 'Transport Simulation', extractedInsights: 'Expected Passenger Accumulation: Platform 3 Current 76% -> Expected 89% ETA 4 min', contextFusion: 'Combined with Weather and Traffic surge', prediction: 'Platform Overcrowding imminent', decision: 'Deploy Platform Supervisor',
    logic: (tel) => { tel.transport.metroIntervalMin += 3; tel.transport.metroStatus = 'DELAYED'; tel.crowd.standsDensity += 0.05; } 
  },
  { 
    source: 'CCTV Computer Vision', message: 'Density Spikes at Exit B', type: 'warning', affectedModules: ['Platform Occupancy', 'Digital Twin'], 
    rawInput: 'Live CCTV Feed (Platform 3)', aiModel: 'YOLOv11 Person Detection', extractedInsights: 'People: 127, Avg Speed: 0.8 m/s, Queue Growing: YES, Zone: Exit B (Confidence 96%)', contextFusion: 'Overlapped with ATS train delay data', prediction: 'Stampede risk at Exit B if flow unchanged', decision: 'Open Exit C',
    logic: (tel, ctx) => { tel.crowd.standsDensity = 0.84; tel.operationalHealth -= 4; tel.riskLevel += 0.05; ctx.setMetrics({lat: 120, qs: 5, eps: 44}); } 
  },
  { 
    source: 'AFC Gate', message: 'Arrival Rate 36/min (Increasing)', type: 'info', affectedModules: ['Passenger Flow', 'Operational Health'], 
    rawInput: 'Gate A Live Stream Tap Data (18:04:12)', aiModel: 'Time Series Forecast', extractedInsights: 'Current: 36/min, Trend: Increasing, Expected in 5 min: 52/min', contextFusion: 'Merged with CCTV density', prediction: 'Entry queue will exceed safe limits', decision: 'Throttle Gate A',
    logic: (tel) => { tel.crowd.totalInside += 41; tel.crowd.concourseDensity += 0.05; tel.crowd.standsDensity += 0.02; } 
  },
  { 
    source: 'Staff GPS', message: 'Supervisor Assigned to Platform 3', type: 'info', affectedModules: ['Resource Dispatch', 'Digital Twin'], 
    rawInput: 'Supervisor Amit Current Position: Platform 1', aiModel: 'AI Routing Algorithm', extractedInsights: 'Nearest Incident: Platform 3, Walking Time: 46 sec', contextFusion: 'Matched with Decision Center task', prediction: 'Arrival in <1 min', decision: 'Dispatch Supervisor Amit',
    logic: (_tel, ctx) => { ctx.setResourceState('Supervisor Amit', 'Assigned'); setTimeout(() => ctx.setResourceState('Supervisor Amit', 'Travelling'), 1000); } 
  },
  { 
    source: 'Escalator Health', message: 'Escalator B Failure Predicted', type: 'warning', affectedModules: ['Digital Twin', 'Decision Center'], 
    rawInput: 'Motor Temp: High, Current Draw: Spiky, Vibration: Anomalous', aiModel: 'IoT Predictive Maintenance Model', extractedInsights: 'Failure Probability: 62%, Est Remaining Time: 48 mins', contextFusion: 'Intersected with Exit B congestion', prediction: 'Escalator will fail during peak flow', decision: 'Dispatch Maintenance Team & Reroute flow',
    logic: (tel, ctx) => { tel.operationalHealth -= 5; ctx.setActiveRecommendation(SCENARIO_DATA['metro-delay'].recommendation); ctx.logReplay('Dispatch Maintenance', 'Escalator failure imminent.'); } 
  },
  { 
    source: 'Lift Telemetry', message: 'Lift Door Cycles Anomalous', type: 'info', affectedModules: ['Context Fusion'], 
    rawInput: 'Door Cycles: High, Travel Count: 14/hr, Motor Load: Normal', aiModel: 'Anomaly Detection', extractedInsights: 'Passenger Delay Risk: High, Accessibility Impact: Medium', contextFusion: 'N/A', prediction: 'Lift congestion forming', decision: 'Monitor',
    logic: (tel) => { tel.riskLevel += 0.05; } 
  },
  { 
    source: 'Security Incidents', message: 'Unattended Bag Detected', type: 'critical', affectedModules: ['Security Dispatch', 'Digital Twin'], 
    rawInput: 'Concourse Camera 4 Feed', aiModel: 'Object Tracking & Classification', extractedInsights: 'Time Since Detection: 4m, Risk Score: High', contextFusion: 'Near Gate A queue', prediction: 'Potential security threat', decision: 'Close Zone C, Deploy Security Team',
    logic: (tel, ctx) => { tel.riskLevel += 0.15; ctx.logReplay('Security Alert', 'Unattended bag detected.'); } 
  },
  { 
    source: 'Passenger SOS App', message: 'Medical Assistance Requested', type: 'critical', affectedModules: ['Medical Dispatch', 'Digital Twin'], 
    rawInput: 'SOS App Ticket #492 (Platform 3)', aiModel: 'NLP Classification', extractedInsights: 'Classification: Emergency, Priority: High', contextFusion: 'Linked to Medical Incident System', prediction: 'Patient condition deteriorating', decision: 'Dispatch Nearest Team',
    logic: (tel, ctx) => { tel.operationalHealth -= 10; ctx.setResourceState('Medical Team Alpha', 'Assigned'); } 
  },
  { 
    source: 'Medical Incident System', message: 'Passenger Collapse (Platform 3)', type: 'critical', affectedModules: ['Medical Dispatch', 'Digital Twin'], 
    rawInput: 'Platform 3 CCTV / SOS confirmed', aiModel: 'Resource Allocation Optimizer', extractedInsights: 'Nearest Medical Team: Alpha, ETA: 52 sec, Nearby Crowd: High', contextFusion: 'Requires space clearing', prediction: 'Response delayed by crowd', decision: 'Create Emergency Corridor',
    logic: (_tel, ctx) => { ctx.setResourceState('Medical Team Alpha', 'Travelling'); ctx.logReplay('Emergency Corridor', 'Creating corridor for medical team.'); } 
  }
];

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setRoleState] = useState<RoleType>(null);
  const [activeScenario, setActiveScenarioState] = useState<string>('metro-delay');
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [isIntervened, setIsIntervened] = useState<boolean>(false);
  const [approvedScenarios, setApprovedScenarios] = useState<Record<string, boolean>>({});
  const [replayHistory, setReplayHistory] = useState<ReplayItem[]>([]);
  
  const [approvalLogs, setApprovalLogs] = useState<string[]>([]);
  const [isApproving, setIsApproving] = useState<boolean>(false);

  const [activeTab, setActiveTabState] = useState<'vision-intelligence' | 'overview' | 'data-pipeline' | 'digital-twin' | 'decision-center' | 'replay' | 'settings'>(
    (window.location.hash.replace('#', '') as any) || 'overview'
  );

  const setActiveTab = (tab: any) => {
    window.location.hash = tab;
    setActiveTabState(tab);
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['vision-intelligence', 'overview', 'data-pipeline', 'digital-twin', 'decision-center', 'replay', 'settings'].includes(hash)) {
        setActiveTabState(hash as any);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  const [lineageModalData, setLineageModalData] = useState<LineageData | null>(null);

  // Live Generative State
  const [telemetry, setTelemetry] = useState<any>(INITIAL_TELEMETRY);
  const [liveEventsLog, setLiveEventsLog] = useState<LiveEvent[]>([]);
  const [pipelineMetrics, setPipelineMetrics] = useState({
    eventsPerSec: 42,
    avgLatency: 115,
    queueSize: 5,
    packetsProcessed: 15400
  });
  const [activeRecommendation, setActiveRecommendation] = useState<any | null>(null);
  const [resourceStates, setResourceStates] = useState<Record<string, ResourceState>>({
    'Supervisor Amit': 'Idle',
    'Medical Team Alpha': 'Idle'
  });
  const [currentPulseModule, setCurrentPulseModule] = useState<string | null>(null);
  const [lastIngestedPacket, setLastIngestedPacket] = useState<LiveEvent | null>(null);

  const engineIntervalRef = useRef<any>(null);
  const pulseTimeoutRef = useRef<any>(null);
  const totalEventsRef = useRef(0);
  const sequenceIndexRef = useRef(0);

  // Persist role
  const setRole = (role: RoleType) => {
    setRoleState(role);
    if (role) localStorage.setItem('crowdos_role', role);
    else localStorage.removeItem('crowdos_role');
  };

  useEffect(() => {
    const savedRole = localStorage.getItem('crowdos_role') as RoleType;
    if (savedRole) setRoleState(savedRole);
  }, []);

  const selectScenario = (scenario: string) => {
    setActiveScenarioState(scenario);
    setIsIntervened(!!approvedScenarios[scenario]);
    setApprovalLogs([]);
    setIsApproving(false);
    setActiveRecommendation(null);
  };

  const resetSimulation = () => {
    setIsIntervened(false);
    setApprovedScenarios({});
    setReplayHistory([]);
    setApprovalLogs([]);
    setIsApproving(false);
    setIsSimulating(true);
    setActiveScenarioState('normal');
    setActiveTab('overview');
    setTelemetry(JSON.parse(JSON.stringify(INITIAL_TELEMETRY)));
    setLiveEventsLog([]);
    setActiveRecommendation(null);
    sequenceIndexRef.current = 0;
  };

  const setResourceState = (resource: string, state: ResourceState) => {
    setResourceStates(prev => ({ ...prev, [resource]: state }));
  };

  const setMetrics = (metrics: { lat?: number, qs?: number, eps?: number }) => {
    setPipelineMetrics(prev => ({
      ...prev,
      avgLatency: metrics.lat || prev.avgLatency,
      queueSize: metrics.qs || prev.queueSize,
      eventsPerSec: metrics.eps || prev.eventsPerSec,
      packetsProcessed: prev.packetsProcessed + 1
    }));
  };

  // ---------------------------------------------------------
  // GENERATIVE SIMULATION ENGINE
  // ---------------------------------------------------------
  
  const addEventLog = (evt: SequenceEvent) => {
    const packetId = `PKT-${Math.floor(90000 + Math.random() * 9999)}`;
    const newLog: LiveEvent = {
      id: `EVT-${Math.random().toString(36).substring(2, 9)}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      source: evt.source,
      message: evt.message,
      type: evt.type,
      packetId,
      affectedModules: evt.affectedModules,
      rawInput: evt.rawInput,
      aiModel: evt.aiModel,
      extractedInsights: evt.extractedInsights,
      contextFusion: evt.contextFusion,
      prediction: evt.prediction,
      decision: evt.decision
    };
    
    setLiveEventsLog(prev => [newLog, ...prev].slice(0, 50));
    setLastIngestedPacket(newLog);
    totalEventsRef.current += 1;

    // Trigger pipeline pulse animation
    triggerPulse();
  };

  const triggerPulse = () => {
    const modules = ['Raw Input', 'Validated', 'Normalized', 'Kafka Event Bus', 'Context Fusion', 'Prediction Engine', 'Decision Intelligence', 'Digital Twin Updated', 'Replay Logged'];
    let step = 0;
    
    const pulseStep = () => {
      if (step < modules.length) {
        setCurrentPulseModule(modules[step]);
        step++;
        pulseTimeoutRef.current = setTimeout(pulseStep, 250); // Pulse moves every 250ms
      } else {
        setCurrentPulseModule(null);
      }
    };
    
    if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
    pulseStep();
  };

  const logReplay = (title: string, desc: string, confidence: number = 95) => {
    setReplayHistory(prev => {
      const newLog: ReplayItem = {
        id: `REP-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        scenario: activeScenario,
        roleName: currentRole || 'System Auto',
        recommendationTitle: title,
        recommendationDesc: desc,
        confidence,
        expectedImpact: 'Mitigates risk escalation',
        actualHealth: telemetry.operationalHealth,
        actualRisk: telemetry.riskLevel,
        counterfactualHealth: Math.max(30, telemetry.operationalHealth - 15),
        counterfactualRisk: Math.min(1.0, telemetry.riskLevel + 0.15)
      };
      return [newLog, ...prev];
    });
  };

  // Event Engine (every 3 - 5 seconds)
  useEffect(() => {
    if (!isSimulating || isApproving) {
      if (engineIntervalRef.current) clearTimeout(engineIntervalRef.current);
      return;
    }

    const tickEngine = async () => {
      // Process one event from the sequence
      const baseEvt = NARRATIVE_SEQUENCE[sequenceIndexRef.current];
      
      // Fetch dynamic insights via Groq RAG
      const dynamicInsights = await generateEventInsights(
        { source: baseEvt.source, message: baseEvt.message }, 
        activeScenario, 
        telemetry
      );

      // Merge dynamic insights over static defaults
      const evt = { ...baseEvt, ...dynamicInsights };
      
      // Update telemetry context
      setTelemetry((prevTel: any) => {
        const nextTel = JSON.parse(JSON.stringify(prevTel));
        evt.logic(nextTel, {
            setActiveRecommendation,
            setResourceState,
            logReplay,
            setMetrics,
            scenarioRec: SCENARIO_DATA['metro-delay'].recommendation
        });
        return nextTel;
      });

      // Log it
      addEventLog(evt);

      // Advance sequence
      sequenceIndexRef.current = (sequenceIndexRef.current + 1) % NARRATIVE_SEQUENCE.length;

      // Schedule next tick
      engineIntervalRef.current = setTimeout(tickEngine, 3000 + Math.random() * 2000); // 3s - 5s
    };

    // Start engine
    engineIntervalRef.current = setTimeout(tickEngine, 2000);

    return () => {
      if (engineIntervalRef.current) clearTimeout(engineIntervalRef.current);
      if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
    };
  }, [isSimulating, isApproving]);


  // ---------------------------------------------------------
  // INTERVENTION (User clicks approve)
  // ---------------------------------------------------------

  const approveIntervention = () => {
    // We disable the manual approve for this strict narrative simulation
    // Since the event sequence auto-resolves things, we just do a quick effect
    if (isApproving || isIntervened) return;
    setIsApproving(true);
    setTimeout(() => {
        setIsApproving(false);
    }, 2000);
  };

  // ---------------------------------------------------------
  // HELPERS
  // ---------------------------------------------------------

  const getIngestFeeds = (): IngestFeed[] => {
    const isDelayed = telemetry.transport.metroStatus === 'DELAYED';
    return [
      { id: 'cctv', name: 'CCTV Computer Vision', hackathonSource: 'YOLOv11 Detection', productionSource: 'Platform Cameras', status: 'Healthy', lastUpdated: `${Math.floor(Math.random()*3)} sec ago`, trust: 96, refreshRate: '1 second' },
      { id: 'afc', name: 'AFC Gate Data', hackathonSource: 'Live Stream Tap Data', productionSource: 'Turnstile Counters', status: 'Healthy', lastUpdated: `${Math.floor(Math.random()*2)} sec ago`, trust: 99, refreshRate: '2 seconds' },
      { id: 'transit', name: 'Metro ATS', hackathonSource: 'Transport Sim', productionSource: 'ATS Logs', status: isDelayed ? 'Delayed' : 'Healthy', lastUpdated: `${Math.floor(Math.random()*5)} sec ago`, trust: isDelayed ? 71 : 98, refreshRate: '30 seconds' },
      { id: 'weather', name: 'Weather API', hackathonSource: 'OpenWeather', productionSource: 'IMD Radar', status: telemetry.weather.precipitation === '82%' ? 'Delayed' : 'Healthy', lastUpdated: `${Math.floor(Math.random()*5)} sec ago`, trust: 99, refreshRate: '5 minutes' },
      { id: 'traffic', name: 'Google Maps Traffic', hackathonSource: 'Maps API', productionSource: 'Inductive Loops', status: 'Healthy', lastUpdated: `${Math.floor(Math.random()*8)} sec ago`, trust: 98, refreshRate: '1 minute' },
      { id: 'escalator', name: 'Escalator Health', hackathonSource: 'IoT Predictive Model', productionSource: 'Motor PLCs', status: 'Healthy', lastUpdated: '1 sec ago', trust: 92, refreshRate: '1 second' },
      { id: 'lift', name: 'Lift Telemetry', hackathonSource: 'Anomaly Detection', productionSource: 'Elevator PLCs', status: 'Healthy', lastUpdated: '3 sec ago', trust: 95, refreshRate: '1 second' },
      { id: 'staffgps', name: 'Staff GPS', hackathonSource: 'AI Routing Algo', productionSource: 'Radio Tetra Terminals', status: 'Healthy', lastUpdated: '2 sec ago', trust: 99, refreshRate: '2 seconds' },
      { id: 'medical', name: 'Medical Incident System', hackathonSource: 'Resource Optimizer', productionSource: 'Dispatch Logs', status: 'Healthy', lastUpdated: '10 sec ago', trust: 98, refreshRate: 'Real-time' },
      { id: 'security', name: 'Security Incidents', hackathonSource: 'Object Tracking', productionSource: 'VMS Alarms', status: 'Healthy', lastUpdated: '5 sec ago', trust: 94, refreshRate: 'Real-time' },
      { id: 'sos', name: 'Passenger SOS App', hackathonSource: 'NLP Classification', productionSource: 'Mobile App API', status: 'Healthy', lastUpdated: '1 sec ago', trust: 90, refreshRate: 'Real-time' }
    ];
  };

  const getTrustPenalty = () => {
    if (telemetry.transport.metroStatus === 'DELAYED') return { feedName: 'Metro Transit API', penalty: 10 };
    return null;
  };

  const getConfidenceBreakdown = () => {
    return [
      { label: 'Crowd Density', value: 40 },
      { label: 'Security Access', value: 30 },
      { label: 'Public Transport', value: 30 }
    ];
  };

  return (
    <AppStateContext.Provider value={{
      currentRole,
      setRole,
      activeScenario,
      selectScenario,
      isSimulating,
      setIsSimulating,
      telemetry,
      isIntervened,
      approveIntervention,
      approvedScenarios,
      replayHistory,
      approvalLogs,
      isApproving,
      resetSimulation,
      liveEventsLog,
      pipelineMetrics,
      activeRecommendation,
      resourceStates,
      currentPulseModule,
      lastIngestedPacket,
      activeTab,
      setActiveTab,
      lineageModalData,
      setLineageModalData,
      getIngestFeeds,
      getConfidenceBreakdown,
      getTrustPenalty
    }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
