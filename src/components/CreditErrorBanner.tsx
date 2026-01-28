import { useState, useEffect } from "react";
import { AlertTriangle, RefreshCw, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CreditErrorBannerProps {
  errorType: "credits" | "rateLimit" | null;
  onRetry: () => void;
  onDismiss: () => void;
}

const COOLDOWN_SECONDS = 30;

export function CreditErrorBanner({ errorType, onRetry, onDismiss }: CreditErrorBannerProps) {
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (errorType === "rateLimit") {
      setCooldown(COOLDOWN_SECONDS);
    } else if (errorType === "credits") {
      setCooldown(0);
    }
  }, [errorType]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  if (!errorType) return null;

  const isRateLimit = errorType === "rateLimit";
  const canRetry = isRateLimit ? cooldown === 0 : false;

  return (
    <div
      className={cn(
        "w-full max-w-2xl mx-auto rounded-xl border p-4 mb-6 animate-in fade-in slide-in-from-top-2 duration-300",
        isRateLimit
          ? "bg-accent/10 border-accent/30"
          : "bg-destructive/10 border-destructive/30"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "p-2 rounded-full shrink-0",
            isRateLimit ? "bg-accent/20" : "bg-destructive/20"
          )}
        >
          {isRateLimit ? (
            <RefreshCw className="w-5 h-5 text-accent" />
          ) : (
            <CreditCard className="w-5 h-5 text-destructive" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4
            className={cn(
              "font-semibold",
              isRateLimit ? "text-accent" : "text-destructive"
            )}
          >
            {isRateLimit ? "Rate Limit Reached" : "AI Credits Exhausted"}
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            {isRateLimit
              ? "Too many requests. Please wait before scanning again."
              : "Your AI usage credits have run out. Add credits to continue scanning."}
          </p>

          <div className="flex items-center gap-3 mt-3 flex-wrap">
            {isRateLimit ? (
              <Button
                size="sm"
                variant="outline"
                onClick={onRetry}
                disabled={!canRetry}
                className="gap-2"
              >
                <RefreshCw className={cn("w-4 h-4", cooldown > 0 && "animate-spin")} />
                {cooldown > 0 ? `Retry in ${cooldown}s` : "Retry Now"}
              </Button>
            ) : (
              <Button
                size="sm"
                variant="default"
                onClick={() => window.open("https://lovable.dev/settings", "_blank")}
                className="gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Add Credits
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={onDismiss}>
              Dismiss
            </Button>
          </div>
        </div>

        <div className="shrink-0">
          <AlertTriangle
            className={cn(
              "w-5 h-5",
              isRateLimit ? "text-accent/50" : "text-destructive/50"
            )}
          />
        </div>
      </div>
    </div>
  );
}
