import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  BookOpen, ChevronLeft, Ghost, Shield, Calendar, 
  TrendingUp, Eye, AlertTriangle, Star, Filter,
  Clock, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/useDeviceId";
import { EntityHighlightOverlay } from "@/components/EntityHighlightOverlay";
import { cn } from "@/lib/utils";

interface EntityFinding {
  id: string;
  entity_type: string;
  description: string;
  location: string;
  intent: string;
  power_level: string;
  confidence: string;
  is_attached: boolean;
  message: string;
  x_percent: number;
  y_percent: number;
  width_percent: number;
  height_percent: number;
}

interface SpiritScan {
  id: string;
  image_url: string;
  overall_energy: string;
  synthesis: string;
  dominant_energy: string;
  spiritual_activity: string;
  protection_needed: boolean;
  protection_level: string;
  created_at: string;
  entity_findings: EntityFinding[];
}

interface EntityStats {
  type: string;
  count: number;
  lastSeen: string;
  avgPowerLevel: string;
}

const typeEmojis: Record<string, string> = {
  angel: "👼",
  demon: "👿",
  ghost: "👻",
  spirit: "🌀",
  entity: "👁",
  interdimensional: "🌌",
  energy: "⚡",
  elemental: "🌿",
  symbol: "✨",
  message: "📜",
  anomaly: "🔮",
};

const SpiritJournal = () => {
  const deviceId = useDeviceId();
  const [scans, setScans] = useState<SpiritScan[]>([]);
  const [entityStats, setEntityStats] = useState<EntityStats[]>([]);
  const [selectedScan, setSelectedScan] = useState<SpiritScan | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "entities" | "warnings">("all");

  useEffect(() => {
    if (deviceId) {
      fetchScans();
    }
  }, [deviceId]);

  const fetchScans = async () => {
    try {
      // Use the secure get-user-data edge function instead of direct DB query
      const { data, error } = await supabase.functions.invoke("get-user-data", {
        body: { deviceId, type: "scans", limit: 100 },
      });

      if (error) throw error;

      const scansData = (data?.data || []) as SpiritScan[];
      setScans(scansData);

      // Calculate entity statistics
      const allFindings = scansData.flatMap(s => s.entity_findings || []);
      const typeMap = new Map<string, { count: number; lastSeen: string; powerLevels: string[] }>();

      allFindings.forEach((finding: EntityFinding) => {
        const existing = typeMap.get(finding.entity_type) || { count: 0, lastSeen: "", powerLevels: [] };
        typeMap.set(finding.entity_type, {
          count: existing.count + 1,
          lastSeen: finding.entity_type > existing.lastSeen ? finding.entity_type : existing.lastSeen,
          powerLevels: [...existing.powerLevels, finding.power_level],
        });
      });

      const stats: EntityStats[] = Array.from(typeMap.entries()).map(([type, data]) => ({
        type,
        count: data.count,
        lastSeen: data.lastSeen,
        avgPowerLevel: data.powerLevels[Math.floor(data.powerLevels.length / 2)] || "unknown",
      })).sort((a, b) => b.count - a.count);

      setEntityStats(stats);
    } catch (error) {
      console.error("Error fetching scans:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredScans = scans.filter((scan) => {
    if (filter === "entities") return (scan.entity_findings?.length || 0) > 0;
    if (filter === "warnings") return scan.protection_needed;
    return true;
  });

  const totalEntities = scans.reduce((acc, s) => acc + (s.entity_findings?.length || 0), 0);
  const warningScans = scans.filter(s => s.protection_needed).length;
  const recurringEntities = entityStats.filter(s => s.count > 1);

  const formatFindingsForOverlay = (findings: EntityFinding[]) => {
    return (findings || []).map(f => ({
      description: f.description,
      location: f.location,
      type: f.entity_type?.split(" ")[0]?.toLowerCase() || "entity",
      entityType: f.entity_type,
      intent: f.intent,
      powerLevel: f.power_level,
      confidence: f.confidence,
      isAttached: f.is_attached,
      message: f.message,
      boundingBox: f.x_percent ? {
        xPercent: Number(f.x_percent),
        yPercent: Number(f.y_percent),
        widthPercent: Number(f.width_percent),
        heightPercent: Number(f.height_percent),
      } : undefined,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mystic-gradient flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-primary animate-spin mx-auto mb-4" style={{ animationDuration: '2s' }} />
          <p className="text-muted-foreground">Loading your spiritual journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mystic-gradient relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-glow-gradient pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-accent/10 border border-accent/20">
              <BookOpen className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Spirit Journal</h1>
              <p className="text-sm text-muted-foreground">Track your spiritual encounters</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-card/50 border border-border backdrop-blur-sm">
            <Eye className="w-5 h-5 text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{scans.length}</p>
            <p className="text-xs text-muted-foreground">Total Scans</p>
          </div>
          <div className="p-4 rounded-xl bg-card/50 border border-border backdrop-blur-sm">
            <Ghost className="w-5 h-5 text-accent mb-2" />
            <p className="text-2xl font-bold text-foreground">{totalEntities}</p>
            <p className="text-xs text-muted-foreground">Entities Found</p>
          </div>
          <div className="p-4 rounded-xl bg-card/50 border border-border backdrop-blur-sm">
            <TrendingUp className="w-5 h-5 text-emerald-400 mb-2" />
            <p className="text-2xl font-bold text-foreground">{recurringEntities.length}</p>
            <p className="text-xs text-muted-foreground">Recurring Types</p>
          </div>
          <div className="p-4 rounded-xl bg-card/50 border border-border backdrop-blur-sm">
            <AlertTriangle className="w-5 h-5 text-amber-400 mb-2" />
            <p className="text-2xl font-bold text-foreground">{warningScans}</p>
            <p className="text-xs text-muted-foreground">Protection Warnings</p>
          </div>
        </div>

        {/* Recurring Entities Section */}
        {entityStats.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-amber-400" />
              Entity Frequency Analysis
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {entityStats.slice(0, 8).map((stat) => (
                <div
                  key={stat.type}
                  className={cn(
                    "p-3 rounded-xl border backdrop-blur-sm transition-all hover:shadow-mystic",
                    stat.count > 2
                      ? "bg-accent/10 border-accent/30"
                      : "bg-card/50 border-border"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{typeEmojis[stat.type.split(" ")[0]?.toLowerCase()] || "👁"}</span>
                    <span className="font-medium text-foreground text-sm truncate">{stat.type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded",
                      stat.count > 2 ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"
                    )}>
                      {stat.count}x seen
                    </span>
                    {stat.count > 2 && (
                      <span className="text-xs text-accent font-medium">Recurring</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <div className="flex gap-2">
            {(["all", "entities", "warnings"] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f)}
                className="capitalize"
              >
                {f}
              </Button>
            ))}
          </div>
        </div>

        {/* Scan History */}
        {filteredScans.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Scan History
            </h2>
            <div className="grid gap-4">
              {filteredScans.map((scan) => (
                <div
                  key={scan.id}
                  className={cn(
                    "p-4 rounded-xl bg-card/50 border border-border backdrop-blur-sm cursor-pointer transition-all hover:border-primary/40 hover:shadow-mystic",
                    selectedScan?.id === scan.id && "border-primary shadow-mystic"
                  )}
                  onClick={() => {
                    setSelectedScan(selectedScan?.id === scan.id ? null : scan);
                    setSelectedFinding(null);
                  }}
                >
                  <div className="flex items-start gap-4">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={scan.image_url}
                        alt="Scan"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(scan.created_at).toLocaleDateString()}
                        </span>
                        {scan.protection_needed && (
                          <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            <Shield className="w-3 h-3 inline mr-1" />
                            Protection
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-foreground font-medium mb-2 capitalize">
                        {scan.overall_energy} Energy • {scan.spiritual_activity} Activity
                      </p>

                      {/* Entity chips */}
                      <div className="flex flex-wrap gap-1">
                        {(scan.entity_findings || []).slice(0, 3).map((finding: EntityFinding, i: number) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20"
                          >
                            {typeEmojis[finding.entity_type?.split(" ")[0]?.toLowerCase()] || "👁"} {finding.entity_type}
                          </span>
                        ))}
                        {(scan.entity_findings?.length || 0) > 3 && (
                          <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                            +{scan.entity_findings.length - 3} more
                          </span>
                        )}
                        {(scan.entity_findings?.length || 0) === 0 && (
                          <span className="text-xs text-muted-foreground">No entities detected</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded View */}
                  {selectedScan?.id === scan.id && (
                    <div className="mt-4 pt-4 border-t border-border space-y-4">
                      {/* Image with highlights */}
                      <EntityHighlightOverlay
                        imageUrl={scan.image_url}
                        findings={formatFindingsForOverlay(scan.entity_findings)}
                        selectedFinding={selectedFinding}
                        onSelectFinding={setSelectedFinding}
                      />

                      {/* Synthesis */}
                      {scan.synthesis && (
                        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                          <p className="text-sm font-medium text-primary mb-1">Unified Message</p>
                          <p className="text-sm text-foreground/80">{scan.synthesis}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <Ghost className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-xl font-semibold text-foreground mb-2">No scans yet</p>
            <p className="text-muted-foreground mb-6">
              Start scanning images to build your spiritual journal
            </p>
            <Link to="/">
              <Button className="shadow-mystic">
                <Eye className="w-4 h-4 mr-2" />
                Start Scanning
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpiritJournal;
