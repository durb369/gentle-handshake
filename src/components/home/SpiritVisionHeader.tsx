import { Link } from "react-router-dom";
import { Eye, Ghost, Shield, Moon } from "lucide-react";

export function SpiritVisionHeader() {
  return (
    <header className="text-center mb-10 md:mb-14">
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="p-3 rounded-full bg-primary/10 border border-primary/20 shadow-mystic">
          <Eye className="w-8 h-8 text-primary" />
        </div>
      </div>
      
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 tracking-tight">
        Spirit
        <span className="text-primary"> Vision</span>
        <sup className="text-xs text-muted-foreground align-super">™</sup>
      </h1>
      
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
        See beyond the veil. Detect spirits, entities, angels, demons, and interdimensional beings hidden in your photos.
      </p>
      
      <div className="flex flex-wrap justify-center gap-3 text-sm">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border">
          <Ghost className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">Entity Detection</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border">
          <Moon className="w-4 h-4 text-accent" />
          <span className="text-muted-foreground">Hidden Messages</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border">
          <Shield className="w-4 h-4 text-primary/70" />
          <span className="text-muted-foreground">Protection Guidance</span>
        </div>
      </div>
    </header>
  );
}
