import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RotateCcw, Star, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/useDeviceId";
import ReactMarkdown from "react-markdown";

interface TarotCard {
  name: string;
  number: number;
  arcana: "major" | "minor";
  suit: string | null;
  keywords: string[];
  isReversed: boolean;
}

interface TarotReading {
  card: TarotCard;
  reading: string;
  date: string;
}

const suitIcons: Record<string, string> = {
  Wands: "🔥",
  Cups: "💧",
  Swords: "💨",
  Pentacles: "🌍",
};

const suitColors: Record<string, string> = {
  Wands: "from-orange-500/20 to-red-500/20",
  Cups: "from-blue-400/20 to-cyan-500/20",
  Swords: "from-slate-400/20 to-purple-500/20",
  Pentacles: "from-emerald-500/20 to-amber-500/20",
};

export function DailyTarot() {
  const [isDrawing, setIsDrawing] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [reading, setReading] = useState<TarotReading | null>(null);
  const [error, setError] = useState<string | null>(null);
  const deviceId = useDeviceId();

  // Check for cached reading from today
  useEffect(() => {
    const cached = localStorage.getItem("dailyTarot");
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as TarotReading;
        const today = new Date().toISOString().split("T")[0];
        if (parsed.date === today) {
          setReading(parsed);
          setIsRevealed(true);
        }
      } catch {
        localStorage.removeItem("dailyTarot");
      }
    }
  }, []);

  const drawCard = async () => {
    if (!deviceId) return;

    setIsDrawing(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("daily-tarot", {
        body: { deviceId },
      });

      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);

      setReading(data);
      localStorage.setItem("dailyTarot", JSON.stringify(data));

      // Delay reveal for dramatic effect
      setTimeout(() => {
        setIsRevealed(true);
        setIsDrawing(false);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to draw card");
      setIsDrawing(false);
    }
  };

  const getSuitGradient = () => {
    if (!reading?.card.suit) return "from-purple-500/20 to-indigo-500/20";
    return suitColors[reading.card.suit] || "from-purple-500/20 to-indigo-500/20";
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
          <Star className="w-6 h-6 text-amber-400" />
          Daily Tarot Pull
          <Moon className="w-6 h-6 text-primary" />
        </h2>
        <p className="text-muted-foreground">
          {reading
            ? "Your card for today has been revealed"
            : "Draw your daily card for spiritual guidance"}
        </p>
      </div>

      <div className="flex justify-center">
        <AnimatePresence mode="wait">
          {!reading ? (
            <motion.div
              key="draw-button"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Button
                onClick={drawCard}
                disabled={isDrawing || !deviceId}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-6 text-lg"
              >
                {isDrawing ? (
                  <>
                    <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                    Drawing from the deck...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Draw Your Daily Card
                  </>
                )}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="card-display"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full max-w-2xl"
            >
              {/* The Card */}
              <div className="flex justify-center mb-6">
                <motion.div
                  className="relative perspective-1000"
                  initial={{ rotateY: 180 }}
                  animate={{ rotateY: isRevealed ? 0 : 180 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <Card
                    className={`w-48 h-72 md:w-56 md:h-80 bg-gradient-to-br ${getSuitGradient()} border-2 border-primary/30 shadow-2xl shadow-primary/20 overflow-hidden`}
                  >
                    <CardContent className="h-full flex flex-col items-center justify-center p-4 text-center">
                      {isRevealed && reading && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="space-y-3"
                        >
                          {/* Card Number/Suit Icon */}
                          <div className="text-4xl">
                            {reading.card.arcana === "major" ? (
                              <span className="text-amber-400">✦</span>
                            ) : (
                              suitIcons[reading.card.suit || ""] || "✦"
                            )}
                          </div>

                          {/* Roman numeral or number */}
                          <div className="text-2xl font-bold text-primary">
                            {reading.card.arcana === "major"
                              ? toRoman(reading.card.number)
                              : reading.card.number <= 10
                              ? reading.card.number
                              : ["Page", "Knight", "Queen", "King"][
                                  reading.card.number - 11
                                ]}
                          </div>

                          {/* Card Name */}
                          <h3
                            className={`text-lg font-bold ${
                              reading.card.isReversed ? "rotate-180" : ""
                            }`}
                          >
                            {reading.card.name}
                          </h3>

                          {reading.card.isReversed && (
                            <span className="text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded">
                              Reversed
                            </span>
                          )}

                          {/* Suit indicator */}
                          {reading.card.suit && (
                            <p className="text-sm text-muted-foreground">
                              {reading.card.suit}
                            </p>
                          )}
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Mystical glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-lg blur-xl -z-10" />
                </motion.div>
              </div>

              {/* Keywords */}
              {isRevealed && reading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-wrap justify-center gap-2 mb-6"
                >
                  {reading.card.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary"
                    >
                      {keyword}
                    </span>
                  ))}
                </motion.div>
              )}

              {/* Reading */}
              {isRevealed && reading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Sun className="w-5 h-5 text-amber-400" />
                        <h4 className="font-semibold text-foreground">
                          Your Reading for Today
                        </h4>
                      </div>
                      <div className="prose prose-sm prose-invert max-w-none text-muted-foreground">
                        <ReactMarkdown>{reading.reading}</ReactMarkdown>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Come back tomorrow message */}
              {isRevealed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-center text-sm text-muted-foreground mt-4"
                >
                  <RotateCcw className="w-4 h-4 inline mr-1" />
                  Return tomorrow for a new card
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <div className="text-center text-destructive text-sm">{error}</div>
      )}
    </div>
  );
}

function toRoman(num: number): string {
  const romanNumerals: [number, string][] = [
    [21, "XXI"],
    [20, "XX"],
    [19, "XIX"],
    [18, "XVIII"],
    [17, "XVII"],
    [16, "XVI"],
    [15, "XV"],
    [14, "XIV"],
    [13, "XIII"],
    [12, "XII"],
    [11, "XI"],
    [10, "X"],
    [9, "IX"],
    [8, "VIII"],
    [7, "VII"],
    [6, "VI"],
    [5, "V"],
    [4, "IV"],
    [3, "III"],
    [2, "II"],
    [1, "I"],
    [0, "0"],
  ];
  for (const [value, numeral] of romanNumerals) {
    if (num >= value) return numeral;
  }
  return String(num);
}
