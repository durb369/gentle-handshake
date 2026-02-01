import { Crown, Zap, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScanLimitBannerProps {
  scanCount: number;
  remainingScans: number;
  hasReachedLimit: boolean;
  isBoosted: boolean;
  onUpgrade: () => void;
}

export function ScanLimitBanner({
  scanCount,
  remainingScans,
  hasReachedLimit,
  isBoosted,
  onUpgrade,
}: ScanLimitBannerProps) {
  // Don't show for boosted users
  if (isBoosted) return null;

  // Show limit reached banner
  if (hasReachedLimit) {
    return (
      <div className="max-w-2xl mx-auto p-5 rounded-xl bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/40 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-red-500/20">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Free Scan Limit Reached</p>
              <p className="text-sm text-muted-foreground">
                You've used all 5 free scans. Upgrade to continue revealing the spiritual realm.
              </p>
            </div>
          </div>
          <Button
            onClick={onUpgrade}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-semibold whitespace-nowrap"
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade - $1/mo
          </Button>
        </div>
      </div>
    );
  }

  // Show remaining scans indicator (subtle)
  if (scanCount > 0) {
    return (
      <div className="max-w-2xl mx-auto flex justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border text-sm">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">
            <span className="font-medium text-foreground">{remainingScans}</span> free scans remaining
          </span>
        </div>
      </div>
    );
  }

  return null;
}
