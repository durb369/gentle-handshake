import { useState, useCallback } from "react";
import { Hash, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/useDeviceId";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface NumerologyNumbers {
  lifePath: number;
  expression: number;
  soulUrge: number;
  personality: number;
  birthday: number;
}

interface NumerologyResult {
  numbers: NumerologyNumbers;
  reading: string;
}

const numberMeanings: Record<number, { name: string; color: string }> = {
  1: { name: "The Leader", color: "from-red-500 to-orange-500" },
  2: { name: "The Peacemaker", color: "from-blue-400 to-cyan-400" },
  3: { name: "The Creative", color: "from-yellow-400 to-amber-500" },
  4: { name: "The Builder", color: "from-green-500 to-emerald-500" },
  5: { name: "The Freedom Seeker", color: "from-purple-500 to-pink-500" },
  6: { name: "The Nurturer", color: "from-rose-400 to-pink-400" },
  7: { name: "The Seeker", color: "from-indigo-500 to-violet-500" },
  8: { name: "The Powerhouse", color: "from-amber-500 to-yellow-600" },
  9: { name: "The Humanitarian", color: "from-teal-400 to-cyan-500" },
  11: { name: "Master Intuitive", color: "from-violet-400 to-purple-600" },
  22: { name: "Master Builder", color: "from-gold to-amber-600" },
  33: { name: "Master Teacher", color: "from-rose-500 to-violet-500" },
};

function NumberBadge({ number, label }: { number: number; label: string }) {
  const meaning = numberMeanings[number] || { name: "Universal", color: "from-gray-400 to-gray-600" };
  
  return (
    <div className="text-center">
      <div
        className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${meaning.color} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}
      >
        {number}
      </div>
      <p className="mt-2 text-sm font-medium text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">{meaning.name}</p>
    </div>
  );
}

export function NumerologyChart() {
  const deviceId = useDeviceId();
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<NumerologyResult | null>(null);

  const generateReading = useCallback(async () => {
    if (!name.trim() || !birthdate || !deviceId) {
      toast.error("Please enter your full name and birthdate");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("numerology-reading", {
        body: { name: name.trim(), birthdate, deviceId },
      });

      if (error) {
        const status = (error as any)?.context?.status ?? (error as any)?.status;
        if (status === 402) {
          toast.error("AI credits exhausted. Please add credits to continue.");
          return;
        }
        if (status === 429) {
          toast.error("Rate limit reached. Please wait a moment.");
          return;
        }
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setResult(data);
      toast.success("Your numerology chart has been revealed!");
    } catch (error) {
      console.error("Numerology error:", error);
      toast.error("Failed to generate reading. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [name, birthdate, deviceId]);

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Hash className="w-5 h-5 text-primary" />
            Calculate Your Numbers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Birth Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name as given at birth"
              className="bg-background/50"
            />
            <p className="text-xs text-muted-foreground">
              Use the name on your birth certificate for accurate results
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthdate">Birth Date</Label>
            <Input
              id="birthdate"
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              className="bg-background/50"
            />
          </div>

          <Button
            onClick={generateReading}
            disabled={isLoading || !name.trim() || !birthdate}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Calculating Your Destiny...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Reveal My Numbers
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Number Grid */}
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg text-center">Your Core Numbers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                <NumberBadge number={result.numbers.lifePath} label="Life Path" />
                <NumberBadge number={result.numbers.expression} label="Expression" />
                <NumberBadge number={result.numbers.soulUrge} label="Soul Urge" />
                <NumberBadge number={result.numbers.personality} label="Personality" />
                <NumberBadge number={result.numbers.birthday} label="Birthday" />
              </div>
            </CardContent>
          </Card>

          {/* Full Reading */}
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Your Complete Numerology Reading</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown>{result.reading}</ReactMarkdown>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
