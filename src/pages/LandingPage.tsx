import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState, type RoleType } from '../context/AppStateContext';
import { Shield, Activity, Users, Truck, Cpu, ChevronRight } from 'lucide-react';

interface RoleOption {
  id: RoleType;
  title: string;
  desc: string;
  icon: any;
  color: string;
  accent: string;
}

const ROLES: RoleOption[] = [
  {
    id: 'commander',
    title: 'Operations Commander',
    desc: 'Full-spectrum oversight of the venue. Monitors global Operational Health, signs off on critical mitigation actions, and coordinates cross-agency logistics.',
    icon: Cpu,
    color: 'text-blue-400 border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-400',
    accent: 'bg-blue-400'
  },
  {
    id: 'security',
    title: 'Security Lead',
    desc: 'Controls perimeter security, gates scanning lines, and crowd density hazards. Responds to gate scanner outages, crowd crushes, and VIP sweeps.',
    icon: Shield,
    color: 'text-red-400 border-red-500/30 bg-red-500/5 hover:bg-red-500/10 hover:border-red-400',
    accent: 'bg-red-400'
  },
  {
    id: 'medical',
    title: 'Medical Officer',
    desc: 'Coordinates medical bays, triage units, and ambulance dispatch routes. Manages response times to emergencies, heatstroke hazards, and slips.',
    icon: Activity,
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-400',
    accent: 'bg-emerald-400'
  },
  {
    id: 'volunteer',
    title: 'Volunteer Coordinator',
    desc: 'Manages field volunteer distribution, information desk coverage, and staff fatigue index. Deploys auxiliary helpers to high-friction sectors.',
    icon: Users,
    color: 'text-amber-400 border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-400',
    accent: 'bg-amber-400'
  },
  {
    id: 'transport',
    title: 'Transport Manager',
    desc: 'Supervises train schedule buffers, bus terminals, and pedestrian plazas. Resolves transit blocks, metro delays, and schedules egress routing.',
    icon: Truck,
    color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10 hover:border-indigo-400',
    accent: 'bg-indigo-400'
  }
];

export const LandingPage: React.FC = () => {
  const { setRole } = useAppState();
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 60 } }
  };

  return (
    <div className="relative w-full h-full min-h-screen grid-bg flex flex-col justify-between p-8 md:p-16 overflow-hidden">
      
      {/* Background glowing rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Ticker HUD line */}
      <div className="flex justify-between items-center border-b border-white/5 pb-6 z-10">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse glow-blue" />
          <span className="font-mono text-xs uppercase tracking-widest text-white/40">CROWDOS // SECURE ACCESS PLATFORM</span>
        </div>
        <span className="font-mono text-xs text-white/20 hidden sm:block">SYSTEM_VER: 4.0.9 // HACKATHON_DEMO</span>
      </div>

      <AnimatePresence mode="wait">
        {!showRoleSelector ? (
          /* CINEMATIC LANDING SCREEN */
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col justify-center items-start max-w-4xl z-10 my-16"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8"
            >
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-green-400">OPERATIONAL INTELLIGENCE ENGAGED</span>
            </motion.div>

            <motion.h1 
              initial={{ letterSpacing: '-0.05em' }}
              animate={{ letterSpacing: '-0.02em' }}
              className="text-6xl sm:text-8xl font-bold tracking-tight text-white mb-6 leading-none"
            >
              CROWD<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">OS</span>
            </motion.h1>

            <motion.p className="text-xl sm:text-2xl text-white/50 font-light mb-12 max-w-2xl leading-relaxed">
              Operational Intelligence for High-Density Events. Real-time predictive command center, animated digital twin, and telemetry simulator.
            </motion.p>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowRoleSelector(true)}
              className="group flex items-center gap-3 px-8 py-4 rounded-xl bg-white text-black font-semibold shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 cursor-pointer"
            >
              INITIALIZE SYSTEM 
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        ) : (
          /* ROLE SELECTOR SCREEN */
          <motion.div
            key="roles"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col justify-center z-10 py-12"
          >
            <div className="text-left mb-10">
              <h2 className="text-4xl font-bold text-white tracking-tight mb-2">Select Your Station</h2>
              <p className="text-white/50 font-light">Choose your operational role to configure the telemetry dashboard overlay.</p>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
            >
              {ROLES.map((role) => {
                const IconComponent = role.icon;
                return (
                  <motion.div
                    key={role.id}
                    variants={itemVariants}
                    whileHover={{ y: -8, scale: 1.02 }}
                    onClick={() => setRole(role.id)}
                    className={`flex flex-col justify-between p-6 rounded-2xl border glass-panel transition-all duration-300 cursor-pointer group ${role.color}`}
                  >
                    <div>
                      <div className="p-3 w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">{role.title}</h3>
                      <p className="text-white/40 text-xs font-light leading-relaxed mb-6">
                        {role.desc}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 pt-4 text-xs font-mono tracking-wider opacity-60 group-hover:opacity-100 transition-opacity">
                      <span>STATION ACTIVE</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            <div className="mt-8 flex justify-start">
              <button 
                onClick={() => setShowRoleSelector(false)}
                className="text-xs font-mono uppercase tracking-widest text-white/30 hover:text-white/70 transition-colors cursor-pointer"
              >
                &larr; BACK TO OVERVIEW
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer System Specs */}
      <div className="flex flex-col sm:flex-row justify-between items-center border-t border-white/5 pt-6 mt-12 text-[10px] font-mono tracking-wider text-white/20 z-10 gap-4 sm:gap-0">
        <span>PROJECT: CROWDOS // STATUS: STABLE</span>
        <div className="flex gap-6">
          <span>LATENCY: 14MS</span>
          <span>SYSTEM_OS: 0XAA9</span>
          <span>SECURE CHANNEL: ENABLED</span>
        </div>
      </div>
    </div>
  );
};
