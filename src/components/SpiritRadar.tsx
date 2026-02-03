import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Finding } from "@/hooks/useSpiritScan";
import { useEffect, useState } from "react";

interface SpiritRadarProps {
  findings: Finding[];
  overallEnergy?: string;
  className?: string;
}

// Map intent to threat level (0 = benevolent, 1 = malevolent)
const getIntentThreatLevel = (intent: string): number => {
  const lower = intent?.toLowerCase() || "";
  if (lower.includes("malevolent") || lower.includes("hostile") || lower.includes("dangerous") || lower.includes("dark") || lower.includes("evil")) {
    return 1;
  }
  if (lower.includes("mischievous") || lower.includes("chaotic") || lower.includes("warning") || lower.includes("aggressive")) {
    return 0.75;
  }
  if (lower.includes("neutral") || lower.includes("curious") || lower.includes("observing") || lower.includes("unknown")) {
    return 0.5;
  }
  if (lower.includes("peaceful") || lower.includes("gentle") || lower.includes("calm") || lower.includes("passive")) {
    return 0.25;
  }
  if (lower.includes("benevolent") || lower.includes("protective") || lower.includes("guardian") || lower.includes("guiding") || lower.includes("loving") || lower.includes("angelic")) {
    return 0;
  }
  return 0.5;
};

// Map power level to distance from center (higher power = closer to center)
const getPowerDistance = (powerLevel: string): number => {
  const lower = powerLevel?.toLowerCase() || "";
  if (lower.includes("overwhelming") || lower.includes("extreme") || lower.includes("massive")) return 0.15;
  if (lower.includes("very strong") || lower.includes("powerful") || lower.includes("intense")) return 0.3;
  if (lower.includes("strong") || lower.includes("high")) return 0.45;
  if (lower.includes("moderate") || lower.includes("medium")) return 0.6;
  if (lower.includes("weak") || lower.includes("faint") || lower.includes("low") || lower.includes("subtle")) return 0.8;
  return 0.55;
};

// Get color based on threat level
const getThreatColor = (threatLevel: number): { main: string; glow: string } => {
  if (threatLevel >= 0.9) return { main: "#8b0000", glow: "rgba(139, 0, 0, 0.8)" };
  if (threatLevel >= 0.7) return { main: "#dc2626", glow: "rgba(220, 38, 38, 0.8)" };
  if (threatLevel >= 0.5) return { main: "#f97316", glow: "rgba(249, 115, 22, 0.8)" };
  if (threatLevel >= 0.3) return { main: "#eab308", glow: "rgba(234, 179, 8, 0.8)" };
  if (threatLevel >= 0.15) return { main: "#22d3ee", glow: "rgba(34, 211, 238, 0.8)" };
  return { main: "#06b6d4", glow: "rgba(6, 182, 212, 0.8)" };
};

export function SpiritRadar({ findings, overallEnergy, className }: SpiritRadarProps) {
  const [sweepAngle, setSweepAngle] = useState(0);
  const [pingBlips, setPingBlips] = useState<number[]>([]);

  // Sweep animation
  useEffect(() => {
    const interval = setInterval(() => {
      setSweepAngle((prev) => (prev + 2) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // Ping effect when sweep passes entities
  useEffect(() => {
    findings.forEach((_, index) => {
      const entityAngle = (index / findings.length) * 360;
      const diff = Math.abs(sweepAngle - entityAngle);
      if (diff < 5 || diff > 355) {
        if (!pingBlips.includes(index)) {
          setPingBlips((prev) => [...prev, index]);
          setTimeout(() => {
            setPingBlips((prev) => prev.filter((i) => i !== index));
          }, 1500);
        }
      }
    });
  }, [sweepAngle, findings, pingBlips]);

  // Calculate entity positions
  const radarEntities = findings.map((finding, index) => {
    const threatLevel = getIntentThreatLevel(finding.intent || "");
    const distance = getPowerDistance(finding.powerLevel || "");
    const angle = (index / findings.length) * 360;
    const radians = (angle * Math.PI) / 180;
    const colors = getThreatColor(threatLevel);
    
    return {
      ...finding,
      threatLevel,
      distance,
      angle,
      x: 50 + Math.cos(radians) * (distance * 42),
      y: 50 + Math.sin(radians) * (distance * 42),
      colors,
      isPinging: pingBlips.includes(index),
    };
  });

  return (
    <div className={cn("relative", className)}>
      {/* Radar Container */}
      <div className="relative w-full max-w-md mx-auto aspect-square">
        {/* Outer casing / bezel */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-900 p-2 shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.5)]">
          {/* Inner radar screen */}
          <div className="relative w-full h-full rounded-full bg-[#001a0a] overflow-hidden border-4 border-zinc-900 shadow-[inset_0_0_60px_rgba(0,50,20,0.5)]">
            
            {/* Scanline effect overlay */}
            <div 
              className="absolute inset-0 pointer-events-none z-20 opacity-10"
              style={{
                backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.03) 2px, rgba(0,255,0,0.03) 4px)",
              }}
            />

            {/* Grid circles */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
              {/* Concentric rings */}
              {[40, 32, 24, 16, 8].map((r, i) => (
                <circle
                  key={r}
                  cx="50"
                  cy="50"
                  r={r}
                  fill="none"
                  stroke="#00ff4420"
                  strokeWidth="0.5"
                  className="opacity-60"
                />
              ))}
              
              {/* Cross hairs */}
              <line x1="50" y1="6" x2="50" y2="94" stroke="#00ff4430" strokeWidth="0.5" />
              <line x1="6" y1="50" x2="94" y2="50" stroke="#00ff4430" strokeWidth="0.5" />
              <line x1="18" y1="18" x2="82" y2="82" stroke="#00ff4420" strokeWidth="0.3" />
              <line x1="82" y1="18" x2="18" y2="82" stroke="#00ff4420" strokeWidth="0.3" />
              
              {/* Degree markers */}
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
                const rad = (deg * Math.PI) / 180;
                const x1 = 50 + Math.cos(rad) * 40;
                const y1 = 50 + Math.sin(rad) * 40;
                const x2 = 50 + Math.cos(rad) * 43;
                const y2 = 50 + Math.sin(rad) * 43;
                return (
                  <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#00ff4450" strokeWidth="1" />
                );
              })}
            </svg>

            {/* Sweep arm with glow trail */}
            <motion.div
              className="absolute top-1/2 left-1/2 origin-left"
              style={{
                width: "50%",
                height: "2px",
                rotate: sweepAngle,
                translateY: "-50%",
              }}
            >
              {/* Main sweep line */}
              <div 
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(90deg, #00ff44 0%, transparent 100%)",
                  boxShadow: "0 0 10px #00ff44, 0 0 20px #00ff44",
                }}
              />
            </motion.div>

            {/* Sweep trail/fade effect */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(from ${sweepAngle - 60}deg at 50% 50%, 
                  transparent 0deg, 
                  rgba(0, 255, 68, 0.15) 30deg, 
                  rgba(0, 255, 68, 0.05) 50deg, 
                  transparent 60deg)`,
              }}
            />

            {/* Entity blips */}
            {radarEntities.map((entity, index) => (
              <div key={index}>
                {/* Base blip */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    left: `${entity.x}%`,
                    top: `${entity.y}%`,
                    width: "10px",
                    height: "10px",
                    backgroundColor: entity.colors.main,
                    transform: "translate(-50%, -50%)",
                    boxShadow: `0 0 8px ${entity.colors.glow}, 0 0 16px ${entity.colors.glow}`,
                  }}
                  animate={{
                    opacity: [0.6, 1, 0.6],
                    scale: [0.9, 1.1, 0.9],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                {/* Ping ripple effect when sweep passes */}
                <AnimatePresence>
                  {entity.isPinging && (
                    <>
                      <motion.div
                        className="absolute rounded-full border-2"
                        style={{
                          left: `${entity.x}%`,
                          top: `${entity.y}%`,
                          borderColor: entity.colors.main,
                          transform: "translate(-50%, -50%)",
                        }}
                        initial={{ width: 10, height: 10, opacity: 1 }}
                        animate={{ width: 50, height: 50, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                      <motion.div
                        className="absolute rounded-full border"
                        style={{
                          left: `${entity.x}%`,
                          top: `${entity.y}%`,
                          borderColor: entity.colors.main,
                          transform: "translate(-50%, -50%)",
                        }}
                        initial={{ width: 10, height: 10, opacity: 0.8 }}
                        animate={{ width: 35, height: 35, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                      />
                    </>
                  )}
                </AnimatePresence>
              </div>
            ))}

            {/* Center point */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-3 h-3 rounded-full bg-[#00ff44] shadow-[0_0_10px_#00ff44,0_0_20px_#00ff44,0_0_30px_#00ff44]" />
            </div>

            {/* Distance labels */}
            <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[8px] text-[#00ff44]/60 font-mono">0°</span>
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] text-[#00ff44]/60 font-mono">180°</span>
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[8px] text-[#00ff44]/60 font-mono">270°</span>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] text-[#00ff44]/60 font-mono">90°</span>
          </div>
        </div>

        {/* Corner screws decoration */}
        {["-top-1 -left-1", "-top-1 -right-1", "-bottom-1 -left-1", "-bottom-1 -right-1"].map((pos, i) => (
          <div key={i} className={`absolute ${pos} w-3 h-3 rounded-full bg-zinc-600 shadow-inner border border-zinc-500`}>
            <div className="absolute inset-1 bg-zinc-700 rounded-full" />
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 rounded-lg bg-zinc-900/80 border border-zinc-700">
        <div className="flex flex-wrap justify-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#8b0000", boxShadow: "0 0 6px rgba(139, 0, 0, 0.8)" }} />
            <span className="text-zinc-400">MALEVOLENT</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#dc2626", boxShadow: "0 0 6px rgba(220, 38, 38, 0.8)" }} />
            <span className="text-zinc-400">HOSTILE</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#f97316", boxShadow: "0 0 6px rgba(249, 115, 22, 0.8)" }} />
            <span className="text-zinc-400">CHAOTIC</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#eab308", boxShadow: "0 0 6px rgba(234, 179, 8, 0.8)" }} />
            <span className="text-zinc-400">NEUTRAL</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#22d3ee", boxShadow: "0 0 6px rgba(34, 211, 238, 0.8)" }} />
            <span className="text-zinc-400">PEACEFUL</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#06b6d4", boxShadow: "0 0 6px rgba(6, 182, 212, 0.8)" }} />
            <span className="text-zinc-400">BENEVOLENT</span>
          </div>
        </div>
        <p className="text-center text-[10px] text-zinc-500 mt-3 font-mono">
          PROXIMITY TO CENTER = POWER LEVEL • SWEEP PING = ACTIVE DETECTION
        </p>
      </div>

      {/* Status readout */}
      <div className="mt-4 text-center font-mono">
        {findings.length > 0 ? (
          <>
            <p className="text-sm text-[#00ff44]">
              ▶ CONTACTS DETECTED: <span className="font-bold">{findings.length}</span>
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              ENERGY SIGNATURE: <span className="text-[#00ff44]/80 uppercase">{overallEnergy || "ANALYZING..."}</span>
            </p>
          </>
        ) : (
          <p className="text-sm text-[#00ff44]/60 animate-pulse">▶ SCANNING FOR SPIRITUAL CONTACTS...</p>
        )}
      </div>
    </div>
  );
}
