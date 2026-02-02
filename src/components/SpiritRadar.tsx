import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Finding } from "@/hooks/useSpiritScan";

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
  return 0.5; // Default to neutral
};

// Map power level to distance from center (higher power = closer to center)
const getPowerDistance = (powerLevel: string): number => {
  const lower = powerLevel?.toLowerCase() || "";
  if (lower.includes("overwhelming") || lower.includes("extreme") || lower.includes("massive")) return 0.2;
  if (lower.includes("very strong") || lower.includes("powerful") || lower.includes("intense")) return 0.35;
  if (lower.includes("strong") || lower.includes("high")) return 0.5;
  if (lower.includes("moderate") || lower.includes("medium")) return 0.65;
  if (lower.includes("weak") || lower.includes("faint") || lower.includes("low") || lower.includes("subtle")) return 0.8;
  return 0.6; // Default
};

// Get color based on threat level (0 = cyan/blue, 1 = dark red)
const getThreatColor = (threatLevel: number): string => {
  if (threatLevel >= 0.9) return "hsl(0, 80%, 35%)"; // Dark red
  if (threatLevel >= 0.7) return "hsl(0, 70%, 50%)"; // Red
  if (threatLevel >= 0.5) return "hsl(30, 80%, 50%)"; // Orange
  if (threatLevel >= 0.3) return "hsl(60, 70%, 50%)"; // Yellow
  if (threatLevel >= 0.15) return "hsl(160, 70%, 50%)"; // Teal
  return "hsl(190, 80%, 55%)"; // Light blue/cyan
};

const getThreatGlow = (threatLevel: number): string => {
  if (threatLevel >= 0.7) return "0 0 20px hsl(0, 80%, 50%), 0 0 40px hsl(0, 70%, 40%)";
  if (threatLevel >= 0.5) return "0 0 20px hsl(30, 80%, 50%), 0 0 40px hsl(30, 70%, 40%)";
  if (threatLevel >= 0.3) return "0 0 20px hsl(60, 70%, 50%), 0 0 40px hsl(60, 60%, 40%)";
  return "0 0 20px hsl(190, 80%, 55%), 0 0 40px hsl(190, 70%, 45%)";
};

export function SpiritRadar({ findings, overallEnergy, className }: SpiritRadarProps) {
  // Calculate entity positions on radar
  const radarEntities = findings.map((finding, index) => {
    const threatLevel = getIntentThreatLevel(finding.intent || "");
    const distance = getPowerDistance(finding.powerLevel || "");
    // Distribute entities around the radar
    const angle = (index / findings.length) * 360 + (Math.random() * 30 - 15);
    const radians = (angle * Math.PI) / 180;
    
    return {
      ...finding,
      threatLevel,
      distance,
      x: 50 + Math.cos(radians) * (distance * 45), // % position
      y: 50 + Math.sin(radians) * (distance * 45), // % position
      color: getThreatColor(threatLevel),
      glow: getThreatGlow(threatLevel),
      size: 12 - distance * 6, // Stronger = bigger blip
    };
  });

  const overallThreat = findings.length > 0
    ? radarEntities.reduce((acc, e) => acc + e.threatLevel, 0) / radarEntities.length
    : 0;

  return (
    <div className={cn("relative", className)}>
      {/* Radar Container */}
      <div className="relative w-full max-w-md mx-auto aspect-square">
        {/* Background glow based on overall threat */}
        <div 
          className="absolute inset-0 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: getThreatColor(overallThreat) }}
        />
        
        {/* Radar circles */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          {/* Outer ring */}
          <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-border" />
          <circle cx="50" cy="50" r="36" fill="none" stroke="currentColor" strokeWidth="0.2" className="text-border" strokeDasharray="2 2" />
          <circle cx="50" cy="50" r="24" fill="none" stroke="currentColor" strokeWidth="0.2" className="text-border" strokeDasharray="2 2" />
          <circle cx="50" cy="50" r="12" fill="none" stroke="currentColor" strokeWidth="0.2" className="text-border" strokeDasharray="2 2" />
          
          {/* Cross lines */}
          <line x1="50" y1="2" x2="50" y2="98" stroke="currentColor" strokeWidth="0.15" className="text-border" />
          <line x1="2" y1="50" x2="98" y2="50" stroke="currentColor" strokeWidth="0.15" className="text-border" />
          <line x1="15" y1="15" x2="85" y2="85" stroke="currentColor" strokeWidth="0.1" className="text-border" strokeDasharray="1 2" />
          <line x1="85" y1="15" x2="15" y2="85" stroke="currentColor" strokeWidth="0.1" className="text-border" strokeDasharray="1 2" />
        </svg>

        {/* Scanning sweep animation */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: `conic-gradient(from 0deg, transparent 0deg, ${getThreatColor(overallThreat)}40 30deg, transparent 60deg)`,
            borderRadius: "50%",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />

        {/* Entity blips */}
        {radarEntities.map((entity, index) => (
          <motion.div
            key={index}
            className="absolute rounded-full"
            style={{
              left: `${entity.x}%`,
              top: `${entity.y}%`,
              width: `${entity.size}px`,
              height: `${entity.size}px`,
              backgroundColor: entity.color,
              boxShadow: entity.glow,
              transform: "translate(-50%, -50%)",
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: index * 0.3,
            }}
          />
        ))}

        {/* Center point */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary)),0_0_20px_hsl(var(--primary))]" />

        {/* Cardinal labels */}
        <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground font-medium">NORTH</span>
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground font-medium">SOUTH</span>
        <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-medium">WEST</span>
        <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-medium">EAST</span>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(0, 80%, 35%)", boxShadow: "0 0 8px hsl(0, 80%, 50%)" }} />
          <span className="text-muted-foreground">Malevolent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(0, 70%, 50%)", boxShadow: "0 0 8px hsl(0, 70%, 50%)" }} />
          <span className="text-muted-foreground">Hostile</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(30, 80%, 50%)", boxShadow: "0 0 8px hsl(30, 80%, 50%)" }} />
          <span className="text-muted-foreground">Chaotic</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(60, 70%, 50%)", boxShadow: "0 0 8px hsl(60, 70%, 50%)" }} />
          <span className="text-muted-foreground">Neutral</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(160, 70%, 50%)", boxShadow: "0 0 8px hsl(160, 70%, 50%)" }} />
          <span className="text-muted-foreground">Peaceful</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(190, 80%, 55%)", boxShadow: "0 0 8px hsl(190, 80%, 55%)" }} />
          <span className="text-muted-foreground">Benevolent</span>
        </div>
      </div>

      {/* Status indicator */}
      {findings.length > 0 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Detected <span className="font-bold text-foreground">{findings.length}</span> spiritual {findings.length === 1 ? "presence" : "presences"}
          </p>
          <p className="text-xs text-muted-foreground mt-1 capitalize">
            Overall Energy: <span className="font-medium" style={{ color: getThreatColor(overallThreat) }}>{overallEnergy || "Unknown"}</span>
          </p>
        </div>
      )}

      {findings.length === 0 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">Scanning for spiritual activity...</p>
        </div>
      )}
    </div>
  );
}
