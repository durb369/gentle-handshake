import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Crown, Calendar, Ghost, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useSketchGallery, type EntitySketch } from "@/hooks/useSketchGallery";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function SketchGallery() {
  const { sketches, loading } = useSketchGallery();
  const { isBoosted, startCheckout } = useSubscription();
  const [selectedSketch, setSelectedSketch] = useState<EntitySketch | null>(null);

  if (!isBoosted) {
    return (
      <div className="min-h-screen bg-mystic-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-glow-gradient pointer-events-none" />
        <div className="relative z-10 container mx-auto px-4 py-8">

          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <Crown className="w-16 h-16 text-amber-400 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-foreground mb-2">Entity Sketch Gallery</h1>
              <p className="text-muted-foreground">
                Unlock Boosted to generate and collect hand-drawn sketches of detected entities
              </p>
            </div>
            <UpgradePrompt onUpgrade={startCheckout} variant="full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mystic-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-glow-gradient pointer-events-none" />
      
      <div className="relative z-10 container mx-auto px-4 py-8">

        <div className="flex items-center gap-3 mb-8">
          <Ghost className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Entity Sketch Gallery</h1>
            <p className="text-muted-foreground">Your collection of detected spiritual beings</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : sketches.length === 0 ? (
          <div className="text-center py-20">
            <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No sketches yet</h2>
            <p className="text-muted-foreground mb-4">
              Generate entity sketches from your spirit scans to start your collection
            </p>
            <Button asChild>
              <Link to="/">Start Scanning</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sketches.map((sketch) => (
              <div
                key={sketch.id}
                className="group cursor-pointer rounded-xl overflow-hidden border border-border bg-card/50 backdrop-blur-sm hover:border-primary/40 transition-all duration-300 hover:shadow-mystic"
                onClick={() => setSelectedSketch(sketch)}
              >
                <AspectRatio ratio={1}>
                  <img
                    src={sketch.sketch_url}
                    alt={sketch.entity_type}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </AspectRatio>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground truncate">{sketch.entity_type}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {sketch.entity_description || "Mysterious entity"}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {new Date(sketch.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sketch Detail Modal */}
      <Dialog open={!!selectedSketch} onOpenChange={() => setSelectedSketch(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ghost className="w-5 h-5 text-primary" />
              {selectedSketch?.entity_type}
            </DialogTitle>
          </DialogHeader>
          {selectedSketch && (
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden">
                <img
                  src={selectedSketch.sketch_url}
                  alt={selectedSketch.entity_type}
                  className="w-full h-auto"
                />
              </div>
              {selectedSketch.entity_description && (
                <p className="text-foreground/80">{selectedSketch.entity_description}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Created: {new Date(selectedSketch.created_at).toLocaleString()}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
