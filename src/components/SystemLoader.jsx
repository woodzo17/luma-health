import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const messages = [
  "INITIALIZING LUVO CORE...",
  "ESTABLISHING SECURE CONNECTION...",
  "AUTHENTICATING BIOMETRIC SIGNATURE...",
  "SEARCHING... 100-DAY HISTORY BUFFER...",
  "SYNCHRONIZING SLEEP ARCHITECTURE...",
  "ANALYZING CARDIAC VARIABILITY...",
  "CALIBRATING RECOVERY TRENDS...",
  "GENERATING TWIN SIMULATION...",
];

const SystemLoader = () => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Cycle through messages while loading
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < messages.length - 1 ? prev + 1 : prev));
    }, 800); 

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center font-space relative overflow-hidden">
      
      {/* Background Pulse */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent animate-pulse" />

      {/* Main Terminal Block */}
      <div className="z-10 w-full max-w-md p-8 border border-white/10 rounded-xl bg-black/50 backdrop-blur-md relative">
        {/* Decorative corner markers */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/50" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/50" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/50" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/50" />

        <h2 className="text-white/40 text-xs tracking-[0.2em] mb-8 text-center uppercase">
          System Sequence v2.0.4
        </h2>

        <div className="space-y-3 h-48 overflow-hidden flex flex-col justify-end">
          <AnimatePresence mode='popLayout'>
             {messages.slice(0, currentStep + 1).map((msg, index) => (
               <motion.div
                key={msg}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm md:text-base font-bold"
               >
                 <span className="text-holo-blue/50 mr-3">
                   {index < currentStep ? '✓' : '>'}
                 </span>
                 <span className={index === currentStep ? "text-white animate-pulse" : "text-white/30"}>
                   {msg}
                 </span>
               </motion.div>
             ))}
          </AnimatePresence>
        </div>
        
        {/* Loading Bar */}
        <div className="mt-8 w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
                className="h-full bg-holo-blue shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 7, ease: "linear" }}
            />
        </div>

      </div>
      
      <div className="absolute bottom-8 font-mono text-[10px] text-white/20">
        ENCRYPTED :: 256-BIT :: VERIFIED
      </div>
    </div>
  );
};

export default SystemLoader;
