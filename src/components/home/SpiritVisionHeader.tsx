import { Link } from "react-router-dom";
import { Eye, Ghost, Shield, Moon, BookOpen, Book, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SpiritVisionHeader() {
  return (
    <header className="text-center mb-10 md:mb-14">
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="p-3 rounded-full bg-primary/10 border border-primary/20 shadow-mystic">
          <Eye className="w-8 h-8 text-primary" />
        </div>
        <Link to="/journal">
          <Button variant="outline" className="gap-2">
            <BookOpen className="w-4 h-4" />
            Journal
          </Button>
        </Link>
        <Link to="/encyclopedia">
          <Button variant="outline" className="gap-2">
            <Book className="w-4 h-4" />
            Bestiary
          </Button>
        </Link>
        <Link to="/fortune-teller">
          <Button variant="outline" className="gap-2">
            <Sparkles className="w-4 h-4" />
            Fortune Teller
          </Button>
        </Link>
      </div>
      
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 tracking-tight">
        Spirit
        <span className="text-primary"> Vision</span>
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
