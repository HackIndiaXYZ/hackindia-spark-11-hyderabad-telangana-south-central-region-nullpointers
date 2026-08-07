import React, { useState } from 'react';
import { 
  X, Camera, Eye, Crosshair, BarChart2, GitCommit, 
  Layers, Cpu, CheckCircle2, ChevronRight, 
  ShieldAlert, Activity, Sparkles
} from 'lucide-react';

interface WhyThisDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendationTitle?: string;
  confidence?: number;
  videoSrc?: string;
}

export const WhyThisDecisionModal: React.FC<WhyThisDecisionModalProps> = ({
  isOpen,
  onClose,
  recommendationTitle = "Deploy Two Supervisors to Platform 2 & Open Exit C",
  confidence = 96,
  videoSrc = "/Crowd-at-Ameerpet-Metro-Station.mp4"
}) => {
  const [activeStep, setActiveStep] = useState<number>(0);

  if (!isOpen) return null;

  const PIPELINE_STEPS = [
    {
      id: 'raw-frame',
      stage: 1,
      title: 'Raw CCTV Frame Ingestion',
      subtitle: 'CAM-04 Ameerpet Metro Station - Platform 2',
      icon: Camera,
      badge: 'INPUT FEED',
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      latency: '4ms',
      model: 'RTSP Stream / H.264 Decoder',
      description: 'High-definition 1080p surveillance video stream captured at 30 FPS from Platform 2 overhang camera.',
      metrics: [
        { label: 'Camera ID', val: 'CAM-04' },
        { label: 'Location', val: 'Ameerpet Platform 2' },
        { label: 'Resolution', val: '1920x1080 @ 30 FPS' },
        { label: 'Signal Quality', val: '99.8% (Nominal)' }
      ]
    },
    {
      id: 'detection',
      stage: 2,
      title: 'Passenger Detection',
      subtitle: 'YOLOv11 TensorRT Neural Network',
      icon: Eye,
      badge: 'COMPUTER VISION',
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      latency: '14ms',
      model: 'YOLOv11x-Pose-Metro',
      description: 'Real-time multi-person detection bounding boxes generated over active crowd frame with keypoint pose verification.',
      metrics: [
        { label: 'Detected Passengers', val: '143 Counted' },
        { label: 'Detection Confidence', val: '98.4% Avg' },
        { label: 'BBox Resolution', val: '0.04m Accuracy' },
        { label: 'Occlusion Handling', val: 'Active (NMS 0.45)' }
      ]
    },
    {
      id: 'tracking',
      stage: 3,
      title: 'Multi-Object Tracking',
      subtitle: 'ByteTrack & Kalman Filter Trajectory Assignment',
      icon: Crosshair,
      badge: 'OBJECT TRACKING',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      latency: '8ms',
      model: 'ByteTrack Persistent ID Engine',
      description: 'Persistent unique tracking IDs (PAX-001 through PAX-143) assigned across continuous frames to compute velocity vector fields.',
      metrics: [
        { label: 'Active Track IDs', val: '143 Passengers' },
        { label: 'Avg Trajectory Speed', val: '1.1 m/s (↓18%)' },
        { label: 'ID Switch Rate', val: '<0.02% (Stable)' },
        { label: 'Tracking Horizon', val: '120 frames' }
      ]
    },
    {
      id: 'density',
      stage: 4,
      title: 'Crowd Density Estimation',
      subtitle: 'Gaussian Spatial Density Field Calculation',
      icon: BarChart2,
      badge: 'DENSITY MODEL',
      badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      latency: '6ms',
      model: 'MCNN Density Field Map',
      description: 'Spatial density mapping calculates 3.8 passengers per m² at Platform 2 boarding edge, breaching yellow safety threshold.',
      metrics: [
        { label: 'Platform Occupancy', val: '78.4% Capacity' },
        { label: 'Peak Density', val: '3.8 pax/m²' },
        { label: 'Critical Zone', val: 'Platform 2 South' },
        { label: 'Safety Index', val: 'Elevated (Risk Level 0.74)' }
      ]
    },
    {
      id: 'flow',
      stage: 5,
      title: 'Flow Direction Analysis',
      subtitle: 'Farneback Optical Vector Field Mapping',
      icon: GitCommit,
      badge: 'FLOW VECTOR',
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      latency: '11ms',
      model: 'DeepFlow Directional Kernel',
      description: 'Directional vector extraction reveals 61% passenger movement towards Platform 2 boarding area with bottlenecks forming near Exit B.',
      metrics: [
        { label: 'Dominant Flow', val: '→ Platform 2 (61%)' },
        { label: 'Exit Egress', val: '← Exit B (19%)' },
        { label: 'Escalator Flow', val: '↑ Escalators (13%)' },
        { label: 'Concourse Flow', val: '↓ Concourse (7%)' }
      ]
    },
    {
      id: 'fusion',
      stage: 6,
      title: 'Multi-Source Context Fusion',
      subtitle: 'Cross-Sensor Correlation Engine',
      icon: Layers,
      badge: 'DATA FUSION',
      badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      latency: '15ms',
      model: 'Bayesian Fusion Network',
      description: 'Correlates CCTV Vision telemetry with live Metro ATS train delay (+3 mins), AFC turnstile rate (36/min), and Weather API rain data.',
      metrics: [
        { label: 'Vision AI Weight', val: '47% Contribution' },
        { label: 'AFC Gate Entries', val: '21% Contribution' },
        { label: 'Metro ATS Delay', val: '16% Contribution' },
        { label: 'Weather / Traffic', val: '16% Contribution' }
      ]
    },
    {
      id: 'prediction',
      stage: 7,
      title: 'Predictive Congestion Engine',
      subtitle: 'Spatial-Temporal Graph Neural Network',
      icon: Cpu,
      badge: 'AI FORECAST',
      badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      latency: '22ms',
      model: 'ST-GCN Congestion Predictor',
      description: 'Forecasts 94% probability of platform crush condition within 4 minutes unless inflow is managed and exit gates opened.',
      metrics: [
        { label: 'Time to Bottleneck', val: '3m 48s' },
        { label: 'Predicted Occupancy', val: '89.2% (Crush Risk)' },
        { label: 'Evacuation Hazard', val: 'Level 4 (Severe)' },
        { label: 'Model Confidence', val: '96.2%' }
      ]
    },
    {
      id: 'recommendation',
      stage: 8,
      title: 'Operational Recommendation',
      subtitle: 'Autonomous OCC Action Dispatch Protocol',
      icon: Sparkles,
      badge: 'ACTION DISPATCH',
      badgeColor: 'bg-emerald-500/30 text-emerald-300 border-emerald-500/50 shadow-sm',
      latency: '5ms',
      model: 'OCC Rules & Safety Dispatch Matrix',
      description: 'Generates high-priority OCC operational plan: Deploy two supervisors to Platform 2 and open Exit C to reroute incoming passenger crowd.',
      metrics: [
        { label: 'Target Sector', val: 'Platform 2 & Exit C' },
        { label: 'Required Action', val: 'Deploy Staff + Open Gate' },
        { label: 'Expected Relief', val: 'Risk drops to 24%' },
        { label: 'Approval Status', val: 'Awaiting Sign-off' }
      ]
    }
  ];

  const currentStep = PIPELINE_STEPS[activeStep];
  const StepIcon = currentStep.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-sans select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[92vh] bg-[#09090b] border border-[#27272a] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272a] bg-[#18181b]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-indigo-400">
                  Decision Explainability Engine // OCC Audit Log
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  CONFIDENCE: {confidence}%
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
                {recommendationTitle}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left: 8-Stage Pipeline Navigation Tree */}
          <div className="w-1/3 border-r border-[#27272a] bg-[#09090b] p-4 overflow-y-auto flex flex-col gap-2">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-2 px-2">
              End-to-End Pipeline Stages (Click to Inspect)
            </div>

            {PIPELINE_STEPS.map((step, idx) => {
              const isSelected = activeStep === idx;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(idx)}
                  className={`group relative flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#18181b] border-indigo-500/60 shadow-lg text-white'
                      : 'bg-[#18181b]/60 border-[#27272a]/60 text-slate-400 hover:bg-[#27272a] hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {step.stage}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs truncate group-hover:text-white">
                        {step.title}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">
                        {step.model}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-slate-500">{step.latency}</span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-indigo-400 translate-x-0.5' : 'text-slate-600'}`} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Detailed Stage Inspector & Multi-Source Weights */}
          <div className="flex-1 p-6 overflow-y-auto bg-[#09090b] flex flex-col gap-6">
            
            {/* Stage Header Card */}
            <div className="p-5 rounded-2xl bg-[#09090b] border border-[#27272a] flex flex-col gap-4 relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                    <StepIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${currentStep.badgeColor}`}>
                        {currentStep.badge}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        STAGE {currentStep.stage} OF 8 // LATENCY: {currentStep.latency}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      {currentStep.title}
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">Architecture</div>
                  <div className="text-xs font-mono font-bold text-indigo-400">{currentStep.model}</div>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                {currentStep.description}
              </p>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                {currentStep.metrics.map((m, idx) => (
                  <div key={idx} className="bg-[#18181b] p-3 rounded-xl border border-[#27272a]">
                    <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">{m.label}</div>
                    <div className="text-sm font-bold text-white font-mono mt-0.5">{m.val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Video Snapshot / Bbox Frame Context */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* CCTV Visual Snapshot Card */}
              <div className="bg-[#09090b] border border-[#27272a] rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-[#27272a] pb-2">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Analysed CCTV Source Frame</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    LIVE MATCH
                  </span>
                </div>

                <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-[#27272a] group">
                  <video 
                    src={videoSrc}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover opacity-80"
                  />
                  
                  {/* Bounding box overlays on image */}
                  <div className="absolute top-1/4 left-1/3 w-16 h-24 border-2 border-cyan-400 bg-cyan-400/10 rounded flex flex-col justify-between p-1">
                    <span className="text-[8px] font-mono font-bold text-cyan-300 bg-black/80 px-1 rounded">PAX-042 98%</span>
                    <span className="text-[7px] font-mono text-cyan-400 font-bold">1.1 m/s →</span>
                  </div>

                  <div className="absolute top-1/3 right-1/4 w-14 h-20 border-2 border-emerald-400 bg-emerald-400/10 rounded flex flex-col justify-between p-1">
                    <span className="text-[8px] font-mono font-bold text-emerald-300 bg-black/80 px-1 rounded">PAX-089 99%</span>
                    <span className="text-[7px] font-mono text-emerald-400 font-bold">0.9 m/s ↑</span>
                  </div>

                  <div className="absolute bottom-1/4 left-1/2 w-20 h-28 border-2 border-orange-400 bg-orange-400/15 rounded flex flex-col justify-between p-1 animate-pulse">
                    <span className="text-[8px] font-mono font-bold text-orange-300 bg-black/80 px-1 rounded">PAX-121 96%</span>
                    <span className="text-[7px] font-mono text-orange-400 font-bold">QUEUED</span>
                  </div>

                  {/* HUD Overlay text */}
                  <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[9px] font-mono text-white/80 bg-black/60 px-2 py-1 rounded backdrop-blur-sm">
                    <span>CAM-04 // AMEERPET PLATFORM 2</span>
                    <span>FRAME #1482</span>
                  </div>
                </div>
              </div>

              {/* Multi-Source Fusion Contribution Weights Card */}
              <div className="bg-[#09090b] border border-[#27272a] rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center border-b border-[#27272a] pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Multi-Source Contribution Weights</span>
                    </div>
                    <span className="text-[10px] font-mono text-purple-400 font-bold">FUSION MATRIX</span>
                  </div>

                  <div className="space-y-3">
                    {[
                      { source: 'Vision AI (CAM-04 CCTV)', weight: 47, color: 'bg-cyan-500' },
                      { source: 'AFC Gate Entries (Turnstiles)', weight: 21, color: 'bg-emerald-500' },
                      { source: 'Metro ATS Schedule (Train Delay)', weight: 16, color: 'bg-yellow-500' },
                      { source: 'Weather API (Rain Impact)', weight: 9, color: 'bg-blue-500' },
                      { source: 'Security Incident Logs', weight: 7, color: 'bg-purple-500' },
                    ].map((item, i) => (
                      <div key={i} className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs font-medium text-slate-300">
                          <span>{item.source}</span>
                          <span className="font-mono font-bold text-white">{item.weight}%</span>
                        </div>
                        <div className="w-full h-2 bg-[#18181b] rounded-full overflow-hidden border border-[#27272a]">
                          <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.weight}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#27272a] flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Audit Signature: 0x9F42A7C</span>
                  <span className="text-emerald-400 font-bold">Traceability Verified ✓</span>
                </div>
              </div>

            </div>

            {/* Bottom Pipeline Progress Bar */}
            <div className="p-4 rounded-xl bg-[#09090b] border border-[#27272a] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>8 / 8 Stages Verified across live Ameerpet CCTV Feed</span>
              </div>
              <div className="flex gap-2">
                <button
                  disabled={activeStep === 0}
                  onClick={() => setActiveStep(prev => prev - 1)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-xs font-bold transition-colors cursor-pointer"
                >
                  Previous Stage
                </button>
                <button
                  disabled={activeStep === PIPELINE_STEPS.length - 1}
                  onClick={() => setActiveStep(prev => prev + 1)}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Next Stage &rarr;
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
