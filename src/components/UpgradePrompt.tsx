import { Crown, Shield, Sparkles, Zap, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface UpgradePromptProps {
  onUpgrade: (email?: string) => Promise<string | null>;
  variant?: "inline" | "full" | "minimal";
  featureName?: string;
}

export function UpgradePrompt({ onUpgrade, variant = "inline", featureName }: UpgradePromptProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleUpgrade = async () => {
    setLoading(true);
    const url = await onUpgrade(email || undefined);
    if (url) {
      window.open(url, "_blank");
    }
    setLoading(false);
  };

  if (variant === "minimal") {
    return (
      <Button
        onClick={handleUpgrade}
        disabled={loading}
        size="sm"
        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-semibold"
      >
        <Crown className="w-4 h-4 mr-1" />
        {loading ? "Loading..." : "Upgrade $1/mo"}
      </Button>
    );
  }

  if (variant === "full") {
    return (
      <div className="p-8 rounded-2xl bg-gradient-to-br from-amber-500/10 via-card to-orange-500/10 border-2 border-amber-500/40 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-full bg-amber-500/20">
            <Crown className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground">Spirit Vision™ Boosted</h3>
            <p className="text-muted-foreground">Unlock the full power of spiritual sight</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-card/50">
            <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Protection Guidance</p>
              <p className="text-sm text-muted-foreground">Learn how to protect yourself from entities</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-lg bg-card/50">
            <Sparkles className="w-5 h-5 text-violet-400 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Ritual Recommendations</p>
              <p className="text-sm text-muted-foreground">Personalized spiritual practices</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-lg bg-card/50">
            <Zap className="w-5 h-5 text-amber-400 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Entity Sketches</p>
              <p className="text-sm text-muted-foreground">AI-generated illustrations of detected beings</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-lg bg-card/50">
            <Crown className="w-5 h-5 text-orange-400 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Sketch Gallery</p>
              <p className="text-sm text-muted-foreground">Save and collect entity artwork</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <input
            type="email"
            placeholder="Email (optional, for receipt)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
          <Button
            onClick={handleUpgrade}
            disabled={loading}
            size="lg"
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-bold px-8"
          >
            <Crown className="w-5 h-5 mr-2" />
            {loading ? "Loading..." : "Unlock for $1/month"}
          </Button>
        </div>
      </div>
    );
  }

  // Default inline variant
  return (
    <div className="p-5 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-3">
        <Lock className="w-5 h-5 text-amber-400" />
        <span className="font-semibold text-foreground">
          {featureName ? `${featureName} - Boosted Feature` : "Boosted Feature"}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Unlock spiritual guidance, protection methods, and entity sketches for just $1/month.
      </p>
      <Button
        onClick={handleUpgrade}
        disabled={loading}
        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-semibold"
      >
        <Crown className="w-4 h-4 mr-2" />
        {loading ? "Loading..." : "Upgrade to Boosted"}
      </Button>
    </div>
  );
}
