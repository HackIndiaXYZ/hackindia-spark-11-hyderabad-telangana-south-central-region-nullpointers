import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import normalData from '../../public/mock-data/normal.json';
import heavyRainData from '../../public/mock-data/heavy-rain.json';
import metroDelayData from '../../public/mock-data/metro-delay.json';
import medicalEmergencyData from '../../public/mock-data/medical-emergency.json';
import gateFailureData from '../../public/mock-data/gate-failure.json';
import vipArrivalData from '../../public/mock-data/vip-arrival.json';
import powerFailureData from '../../public/mock-data/power-failure.json';

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
          return prev; // Hold at the end of the simulation timeline
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
      '[CMD] RECOMMENDATION ACCEPTED',
      '[OPS] VOLUNTEER DEPLOYMENT SEQUENCE ENGAGED',
      '[MAP] TRAFFIC REDISTRIBUTION ROUTE FLASHING',
      '[ANL] RISK LEVEL RE-EVALUATION IN PROGRESS',
      '[SYS] OPERATIONAL HEALTH INCREASING'
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
            confidence: scenarioInfo.recommendation.confidence,
            expectedImpact: scenarioInfo.recommendation.expectedImpact,
            actualHealth: intervenedHealth,
            actualRisk: intervenedRisk,
            counterfactualHealth: Math.max(30, rawHealth - 15), // Deteriorated state
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

  // 4. Mission Control Mode auto-runner scheduling
  // Timeline:
  // t=0: Reset, role=commander, scenario=normal, step=0
  // t=6: Switch to metro-delay, step=0 (signaling error alert)
  // t=12: metro-delay step=2 (crowd bottleneck develops, Operational Health drops to 62%)
  // t=18: Trigger recommendation box (Wait 2s, then trigger approval sequence)
  // t=20: Approve sequence auto-fires (health recovers to 81%, animations pulse)
  // t=28: Switch to heavy-rain, step=1 (Heavy rain deluge, health drops to 78%, digital twin rain starts)
  // t=34: Trigger approval sequence for heavy-rain (health recovers to 96%)
  // t=42: MC ends, logs showing full event list
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
          
          // Action mapping at specific timesteps
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
      missionControlTimer
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
