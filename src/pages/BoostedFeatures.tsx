import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, Hash, Crown, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PsychicChat } from "@/components/PsychicChat";
import { NumerologyChart } from "@/components/NumerologyChart";
import { DailyTarot } from "@/components/DailyTarot";
import { useSubscription } from "@/hooks/useSubscription";

export default function BoostedFeatures() {
  const { isBoosted, loading, startCheckout } = useSubscription();
  const [activeTab, setActiveTab] = useState("tarot");

  if (loading) {
    return (
      <div className="min-h-screen bg-mystic-gradient flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isBoosted) {
    return (
      <div className="min-h-screen bg-mystic-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-glow-gradient pointer-events-none" />
        
          <div className="relative z-10 container mx-auto px-4 py-12">

          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Crown className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-3xl font-bold text-foreground">
              Unlock Boosted Features
            </h1>

            <p className="text-muted-foreground">
              Access exclusive psychic readings and numerology insights with the Boosted subscription.
            </p>

            <div className="space-y-4 text-left bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-primary/20">
              <h2 className="font-semibold text-foreground">Boosted includes:</h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  Unlimited AI Psychic Chat with Seraphina
                </li>
                <li className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-primary" />
                  Personal Numerology Chart & Reading
                </li>
                <li className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-500" />
                  Unlimited Spirit Scans
                </li>
                <li className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-500" />
                  Entity Sketch Generation
                </li>
              </ul>
            </div>

            <Button
              onClick={async () => {
                const url = await startCheckout();
                if (url) window.open(url, "_blank");
              }}
              size="lg"
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
            >
              <Crown className="w-5 h-5 mr-2" />
              Upgrade to Boosted - $1/month
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mystic-gradient relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-glow-gradient pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-center mb-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-sm font-medium">
            <Crown className="w-4 h-4" />
            Boosted
          </span>
        </div>

        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-foreground">
            Psychic Portal
          </h1>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="tarot" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Daily Tarot
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Psychic Chat
              </TabsTrigger>
              <TabsTrigger value="numerology" className="flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Numerology
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tarot">
              <DailyTarot />
            </TabsContent>

            <TabsContent value="chat">
              <PsychicChat />
            </TabsContent>

            <TabsContent value="numerology">
              <NumerologyChart />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
