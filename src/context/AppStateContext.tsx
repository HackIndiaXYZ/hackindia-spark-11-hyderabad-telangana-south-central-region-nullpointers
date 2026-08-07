import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import normalData from '../../public/mock-data/normal.json';
import heavyRainData from '../../public/mock-data/heavy-rain.json';
import metroDelayData from '../../public/mock-data/metro-delay.json';
import medicalEmergencyData from '../../public/mock-data/medical-emergency.json';
import gateFailureData from '../../public/mock-data/gate-failure.json';
import vipArrivalData from '../../public/mock-data/vip-arrival.json';
import powerFailureData from '../../public/mock-data/power-failure.json';
import type { LineageData } from '../components/common/InfoModal';

// Mapping scenarios statically for zero-latency offline loads
export const SCENARIO_DATA: Record<string, any> = {
  'normal': normalData,
  'heavy-rain': heavyRainData,
  'metro-delay': metroDelayData,
  'medical-emergency': medicalEmergencyData,
  'gate-failure': gateFailureData,
  'vip-arrival': vipArrivalData,
  'power-failure': powerFailureData
};

export type RoleType = 'commander' | 'security' | 'medical' | 'volunteer' | 'transport' | null;

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

interface AppStateContextType {
  currentRole: RoleType;
  setRole: (role: RoleType) => void;
  activeScenario: string;
  selectScenario: (scenario: string) => void;
  simulationStep: number;
  setSimulationStep: (step: number) => void;
  isSimulating: boolean;
  setIsSimulating: (simulating: boolean) => void;
  telemetry: any;
  isIntervened: boolean;
  approveIntervention: () => void;
  approvedScenarios: Record<string, boolean>;
  replayHistory: ReplayItem[];
  approvalLogs: string[];
  isApproving: boolean;
  resetSimulation: () => void;
  isMissionControlActive: boolean;
  startMissionControl: () => void;
  stopMissionControl: () => void;
  missionControlTimer: number;
  
  // New Ingestion & Context Fusion state
  activeTab: 'overview' | 'data-pipeline' | 'digital-twin' | 'decision-center' | 'replay' | 'settings';
  setActiveTab: (tab: 'overview' | 'data-pipeline' | 'digital-twin' | 'decision-center' | 'replay' | 'settings') => void;
  lineageModalData: LineageData | null;
  setLineageModalData: (data: LineageData | null) => void;
  getIngestFeeds: () => IngestFeed[];
  getIngestTimeline: () => { time: string; message: string }[];
  getConfidenceBreakdown: () => { label: string; value: number }[];
  getTrustPenalty: () => { feedName: string; penalty: number } | null;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setRoleState] = useState<RoleType>(null);
  const [activeScenario, setActiveScenarioState] = useState<string>('normal');
  const [simulationStep, setSimulationStep] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [isIntervened, setIsIntervened] = useState<boolean>(false);
  const [approvedScenarios, setApprovedScenarios] = useState<Record<string, boolean>>({});
  const [replayHistory, setReplayHistory] = useState<ReplayItem[]>([]);
  
  // Terminal animation states
  const [approvalLogs, setApprovalLogs] = useState<string[]>([]);
  const [isApproving, setIsApproving] = useState<boolean>(false);

  // Mission Control auto-demo states
  const [isMissionControlActive, setIsMissionControlActive] = useState<boolean>(false);
  const [missionControlTimer, setMissionControlTimer] = useState<number>(0);
  
  // Ingest state overrides
  const [activeTab, setActiveTab] = useState<'overview' | 'data-pipeline' | 'digital-twin' | 'decision-center' | 'replay' | 'settings'>('overview');
  const [lineageModalData, setLineageModalData] = useState<LineageData | null>(null);

  const simIntervalRef = useRef<any>(null);
  const mcIntervalRef = useRef<any>(null);

  // Sync role to local storage for persistence across reloads
  const setRole = (role: RoleType) => {
    setRoleState(role);
    if (role) localStorage.setItem('crowdos_role', role);
    else localStorage.removeItem('crowdos_role');
  };

  useEffect(() => {
    const savedRole = localStorage.getItem('crowdos_role') as RoleType;
    if (savedRole) {
      setRoleState(savedRole);
    }
  }, []);

  const selectScenario = (scenario: string) => {
    setActiveScenarioState(scenario);
    setSimulationStep(0);
    setIsIntervened(!!approvedScenarios[scenario]);
    setApprovalLogs([]);
    setIsApproving(false);
  };

  const resetSimulation = () => {
    setSimulationStep(0);
    setIsIntervened(false);
    setApprovedScenarios({});
    setReplayHistory([]);
    setApprovalLogs([]);
    setIsApproving(false);
    setIsSimulating(true);
    setActiveScenarioState('normal');
    stopMissionControl();
    setActiveTab('overview');
  };

  // 1. Ticking simulation logic
  useEffect(() => {
    if (isSimulating && !isApproving && !isMissionControlActive) {
      simIntervalRef.current = setInterval(() => {
        setSimulationStep((prev) => {
          const maxSteps = SCENARIO_DATA[activeScenario]?.telemetrySteps?.length || 5;
          if (prev < maxSteps - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 4000);
    } else {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    }

    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [isSimulating, activeScenario, isApproving, isMissionControlActive]);

  // 2. Sequential command execution micro-animations
  const approveIntervention = () => {
    if (isApproving || isIntervened) return;
    setIsApproving(true);
    setApprovalLogs([]);

    const steps = [
      'Mitigation recommendation approved...',
      'Deploying support staff to key sectors...',
      'Updating digital twin routing overlays...',
      'Recalculating local risk and traffic vectors...',
      'Operational health index restored successfully.'
    ];

    steps.forEach((logText, idx) => {
      setTimeout(() => {
        setApprovalLogs((prev) => [...prev, logText]);
        if (idx === steps.length - 1) {
          setIsApproving(false);
          setIsIntervened(true);
          setApprovedScenarios((prev) => ({ ...prev, [activeScenario]: true }));

          // Save to Replay Log
          const scenarioInfo = SCENARIO_DATA[activeScenario];
          const currentStepData = scenarioInfo.telemetrySteps[simulationStep];
          const rawHealth = currentStepData.operationalHealth;
          const rawRisk = currentStepData.riskLevel;
          const mod = scenarioInfo.recommendation.resolutionModifiers;

          const intervenedHealth = Math.min(100, rawHealth + (mod.operationalHealth || 0));
          const intervenedRisk = Math.max(0, rawRisk + (mod.riskLevel || 0));

          const newLog: ReplayItem = {
            id: `REP-${Math.floor(1000 + Math.random() * 9000)}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            scenario: activeScenario,
            roleName: currentRole || 'Operations Commander',
            recommendationTitle: scenarioInfo.recommendation.title,
            recommendationDesc: scenarioInfo.recommendation.description,
            confidence: getAdjustedConfidence(),
            expectedImpact: scenarioInfo.recommendation.expectedImpact,
            actualHealth: intervenedHealth,
            actualRisk: intervenedRisk,
            counterfactualHealth: Math.max(30, rawHealth - 15),
            counterfactualRisk: Math.min(1.0, rawRisk + 0.15)
          };

          setReplayHistory((prev) => [newLog, ...prev]);
        }
      }, (idx + 1) * 750);
    });
  };

  // 3. Dynamic Telemetry Calculation with Intervention Modifiers
  const getModifiedTelemetry = () => {
    const scenarioInfo = SCENARIO_DATA[activeScenario];
    if (!scenarioInfo) return null;
    const stepData = scenarioInfo.telemetrySteps[simulationStep];
    if (!stepData) return null;

    // Clone stepData to avoid mutation
    const tel = JSON.parse(JSON.stringify(stepData));

    if (isIntervened) {
      const mod = scenarioInfo.recommendation.resolutionModifiers;
      
      // Update global parameters
      tel.operationalHealth = Math.min(100, tel.operationalHealth + (mod.operationalHealth || 0));
      tel.riskLevel = Math.max(0, tel.riskLevel + (mod.riskLevel || 0));
      
      if (mod.medical) {
        tel.medical.activeIncidents = Math.max(0, tel.medical.activeIncidents + (mod.medical.activeIncidents || 0));
        tel.medical.responseTimeSec = Math.max(30, tel.medical.responseTimeSec + (mod.medical.responseTimeSec || 0));
      }

      if (mod.transport) {
        if (mod.transport.metroStatus) tel.transport.metroStatus = mod.transport.metroStatus;
        tel.transport.busTerminalQueue = Math.max(0, tel.transport.busTerminalQueue + (mod.transport.busTerminalQueue || 0));
      }

      if (mod.crowd) {
        tel.crowd.concourseDensity = Math.max(0.1, tel.crowd.concourseDensity + (mod.crowd.concourseDensity || 0));
        tel.crowd.standsDensity = Math.max(0.1, tel.crowd.standsDensity + (mod.crowd.standsDensity || 0));
        tel.crowd.flowRate = Math.max(10, tel.crowd.flowRate + (mod.crowd.flowRate || 0));
      }

      if (mod.gates) {
        tel.gates = tel.gates.map((g: any) => {
          const gateMod = mod.gates[g.id];
          if (gateMod) {
            return {
              ...g,
              status: gateMod.status || g.status,
              occupancy: Math.max(0, g.occupancy + (gateMod.occupancy || 0)),
              throughput: Math.max(0, g.throughput + (gateMod.throughput || 0))
            };
          }
          return g;
        });
      }
    }

    return tel;
  };

  // 4. Data Trust & Feeds Ingestion Configuration
  const getIngestFeeds = (): IngestFeed[] => {
    // Basic settings for all feeds
    const feeds: IngestFeed[] = [
      { id: 'weather', name: 'Weather Sensors', hackathonSource: 'OpenWeather API', productionSource: 'IMD Precipitation Radar', status: 'Healthy', lastUpdated: '12 sec ago', trust: 99, refreshRate: '5 minutes' },
      { id: 'traffic', name: 'Road Traffic', hackathonSource: 'Google Maps API', productionSource: 'Inductive Loop traffic sensors', status: 'Healthy', lastUpdated: '8 sec ago', trust: 98, refreshRate: '1 minute' },
      { id: 'crowd', name: 'Crowd Density', hackathonSource: 'Telemetry Sim Engine', productionSource: 'Turnstile Counters + WiFi Probes + Bluetooth + CCTV CV', status: 'Healthy', lastUpdated: '2 sec ago', trust: 99, refreshRate: '3 seconds' },
      { id: 'parking', name: 'Parking Lot occupancy', hackathonSource: 'Simulation Engine', productionSource: 'Magnetic ground loops + ANPR cameras', status: 'Healthy', lastUpdated: '18 sec ago', trust: 97, refreshRate: '30 seconds' },
      { id: 'transit', name: 'Public Transport', hackathonSource: 'GTFS static feeds', productionSource: 'Metro ATS Operations API logs', status: 'Healthy', lastUpdated: '14 sec ago', trust: 98, refreshRate: '30 seconds' },
      { id: 'medical', name: 'Medical CAD Dispatch', hackathonSource: 'Mock Incident Feed', productionSource: 'Ambulance GPS + Hospital ERP terminal', status: 'Healthy', lastUpdated: '5 sec ago', trust: 99, refreshRate: '10 seconds' },
      { id: 'volunteer', name: 'Volunteer wearable tracking', hackathonSource: 'Simulated GPS', productionSource: 'Volunteer App GPS logs + QR Checkins', status: 'Healthy', lastUpdated: '4 sec ago', trust: 99, refreshRate: '5 seconds' },
      { id: 'security', name: 'Security Access Control', hackathonSource: 'Mock CCTV event alerts', productionSource: 'CCTV CV + RFID Door Badge logs', status: 'Healthy', lastUpdated: '3 sec ago', trust: 99, refreshRate: '10 seconds' },
      { id: 'citizen', name: 'Citizen Community Signals', hackathonSource: 'Mock Community Feed', productionSource: 'Citizen Incident Mobile App reports', status: 'Healthy', lastUpdated: '24 sec ago', trust: 96, refreshRate: '1 minute' }
    ];

    // Alter feed status dynamically depending on scenario & step escalation
    if (activeScenario === 'metro-delay' && simulationStep >= 1) {
      const idx = feeds.findIndex(f => f.id === 'transit');
      if (idx !== -1) {
        feeds[idx].status = 'Delayed';
        feeds[idx].lastUpdated = '6 min ago';
        feeds[idx].trust = 71;
      }
    }

    if (activeScenario === 'power-failure' && simulationStep >= 1) {
      const idx = feeds.findIndex(f => f.id === 'security');
      if (idx !== -1) {
        feeds[idx].status = 'Offline';
        feeds[idx].lastUpdated = '12 min ago';
        feeds[idx].trust = 30;
      }
    }

    if (activeScenario === 'heavy-rain' && simulationStep >= 1) {
      const idx = feeds.findIndex(f => f.id === 'traffic');
      if (idx !== -1) {
        feeds[idx].status = 'Delayed';
        feeds[idx].lastUpdated = '3.5 min ago';
        feeds[idx].trust = 78;
      }
    }

    return feeds;
  };

  // Check if there is an active stale feed penalty
  const getTrustPenalty = () => {
    if (activeScenario === 'metro-delay' && simulationStep >= 1) {
      return { feedName: 'Metro Transit API', penalty: 10 };
    }
    if (activeScenario === 'power-failure' && simulationStep >= 1) {
      return { feedName: 'Security Access Grid', penalty: 25 };
    }
    return null;
  };

  const getAdjustedConfidence = () => {
    const base = SCENARIO_DATA[activeScenario]?.recommendation?.confidence || 95;
    const penalty = getTrustPenalty();
    if (penalty) {
      return Math.max(50, base - penalty.penalty);
    }
    return base;
  };

  // Get confidence contribution weights dynamically
  const getConfidenceBreakdown = () => {
    switch (activeScenario) {
      case 'heavy-rain':
        return [
          { label: 'Crowd Density', value: 40 },
          { label: 'Weather Sensors', value: 25 },
          { label: 'Road Traffic', value: 20 },
          { label: 'Medical Ingestion', value: 15 }
        ];
      case 'metro-delay':
        return [
          { label: 'Public Transport', value: 45 },
          { label: 'Crowd Density', value: 35 },
          { label: 'Citizen Reports', value: 20 }
        ];
      case 'power-failure':
        return [
          { label: 'Security Access', value: 40 },
          { label: 'Citizen Reports', value: 30 },
          { label: 'Crowd Density', value: 20 },
          { label: 'Medical Ingestion', value: 10 }
        ];
      default:
        return [
          { label: 'Crowd Density', value: 50 },
          { label: 'Security Access', value: 30 },
          { label: 'Public Transport', value: 20 }
        ];
    }
  };

  // Generate dynamic chronologically ticking data feed log timeline
  const getIngestTimeline = () => {
    const timeline: { time: string; message: string }[] = [];
    const baseTime = "18:";
    
    // Always load step 0 logs
    timeline.push(
      { time: `${baseTime}00:01`, message: '[INGEST] OpenWeather: Core telemetry feed synced.' },
      { time: `${baseTime}00:05`, message: '[INGEST] Turnstile Counters: Node gateway reporting nominal.' }
    );

    if (simulationStep >= 1) {
      if (activeScenario === 'heavy-rain') {
        timeline.push(
          { time: `${baseTime}02:10`, message: '[INGEST] Micro-radar: Rain rates crossed 12mm/h threshold.' },
          { time: `${baseTime}02:22`, message: '[FUSION] Concourse density index breached warning level (58%).' }
        );
      } else if (activeScenario === 'metro-delay') {
        timeline.push(
          { time: `${baseTime}02:08`, message: '[INGEST] Metro ATS: Transit log heartbeat timeout. Feed marked STALE.' },
          { time: `${baseTime}02:15`, message: '[DI_CORE] Trust score penalty applied to Metro lines telemetry.' }
        );
      } else if (activeScenario === 'gate-failure') {
        timeline.push(
          { time: `${baseTime}02:10`, message: '[INGEST] Turnstiles: Gate D reader network socket closed.' },
          { time: `${baseTime}02:22`, message: '[FUSION] Gate D flow rate index dropped to 0 p/m.' }
        );
      } else if (activeScenario === 'power-failure') {
        timeline.push(
          { time: `${baseTime}02:08`, message: '[INGEST] Security: Sector A RFID badge reader network OFFLINE.' },
          { time: `${baseTime}02:20`, message: '[DI_CORE] Trust score penalty applied to Security network.' }
        );
      } else {
        timeline.push(
          { time: `${baseTime}02:10`, message: '[INGEST] Road Traffic: Inbound highways reporting standard speeds.' }
        );
      }
    }

    if (simulationStep >= 2) {
      if (activeScenario === 'heavy-rain') {
        timeline.push(
          { time: `${baseTime}04:15`, message: '[INGEST] Citizen Reports: Concourse steps slip hazard alerts rising.' },
          { time: `${baseTime}04:30`, message: '[DI_CORE] Generating dynamic wet-weather circulation briefing.' }
        );
      } else if (activeScenario === 'metro-delay') {
        timeline.push(
          { time: `${baseTime}04:12`, message: '[INGEST] Citizen Reports: High passenger density pockets at East Subway plaza.' },
          { time: `${baseTime}04:25`, message: '[FUSION] Concourse egress backing up. Inflow restriction required.' }
        );
      } else if (activeScenario === 'gate-failure') {
        timeline.push(
          { time: `${baseTime}04:18`, message: '[INGEST] CCTV CV: 8,000 count buildup detected in Gate D outer plaza.' }
        );
      } else if (activeScenario === 'power-failure') {
        timeline.push(
          { time: `${baseTime}04:15`, message: '[INGEST] Citizen Reports: Severe blackout in Sector A stairwell.' }
        );
      }
    }

    if (simulationStep >= 3) {
      timeline.push(
        { time: `${baseTime}06:12`, message: '[FUSION] Cross-system parameters consolidated.' },
        { time: `${baseTime}06:20`, message: '[DI_CORE] Recommendation matrix generated. Awaiting approval.' }
      );
    }

    return timeline;
  };

  // 5. Mission Control Mode auto-runner scheduling
  const startMissionControl = () => {
    setIsMissionControlActive(true);
    setMissionControlTimer(0);
    setRole('commander');
    
    // Initial setup
    setActiveScenarioState('normal');
    setSimulationStep(0);
    setIsIntervened(false);
    setApprovedScenarios({});
    setReplayHistory([]);
    setApprovalLogs([]);
    setIsApproving(false);
    setActiveTab('overview');
  };

  const stopMissionControl = () => {
    setIsMissionControlActive(false);
    setMissionControlTimer(0);
    if (mcIntervalRef.current) clearInterval(mcIntervalRef.current);
  };

  useEffect(() => {
    if (isMissionControlActive) {
      mcIntervalRef.current = setInterval(() => {
        setMissionControlTimer((prev) => {
          const nextTime = prev + 1;
          
          if (nextTime === 5) {
            // Transition to Metro Delay
            setActiveScenarioState('metro-delay');
            setSimulationStep(1);
            setIsIntervened(false);
          } else if (nextTime === 10) {
            // Escalation
            setSimulationStep(3);
          } else if (nextTime === 14) {
            // Auto approve Metro Delay intervention
            approveIntervention();
          } else if (nextTime === 22) {
            // Transition to Heavy Rain
            setActiveScenarioState('heavy-rain');
            setSimulationStep(1);
            setIsIntervened(false);
          } else if (nextTime === 28) {
            // Escalation
            setSimulationStep(3);
          } else if (nextTime === 32) {
            // Auto approve Heavy Rain intervention
            approveIntervention();
          } else if (nextTime === 40) {
            // Loop or stop
            setIsMissionControlActive(false);
            if (mcIntervalRef.current) clearInterval(mcIntervalRef.current);
          }

          return nextTime;
        });
      }, 1000);
    } else {
      if (mcIntervalRef.current) clearInterval(mcIntervalRef.current);
    }

    return () => {
      if (mcIntervalRef.current) clearInterval(mcIntervalRef.current);
    };
  }, [isMissionControlActive, activeScenario, simulationStep, isIntervened, currentRole]);

  return (
    <AppStateContext.Provider value={{
      currentRole,
      setRole,
      activeScenario,
      selectScenario,
      simulationStep,
      setSimulationStep,
      isSimulating,
      setIsSimulating,
      telemetry: getModifiedTelemetry(),
      isIntervened,
      approveIntervention,
      approvedScenarios,
      replayHistory,
      approvalLogs,
      isApproving,
      resetSimulation,
      isMissionControlActive,
      startMissionControl,
      stopMissionControl,
      missionControlTimer,
      
      // Ingestion and context fusion extensions
      activeTab,
      setActiveTab,
      lineageModalData,
      setLineageModalData,
      getIngestFeeds,
      getIngestTimeline,
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
