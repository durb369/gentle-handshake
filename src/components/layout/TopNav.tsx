import { Link, useLocation } from "react-router-dom";
import { Eye, BookOpen, Book, Sparkles, CreditCard, Crown, ImageIcon, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navItems = [
  { path: "/", icon: Eye, label: "Spirit Scan" },
  { path: "/journal", icon: BookOpen, label: "Journal" },
  { path: "/encyclopedia", icon: Book, label: "Bestiary" },
  { path: "/fortune-teller", icon: Sparkles, label: "Fortune Teller" },
  { path: "/psychic", icon: MessageCircle, label: "Psychic Portal" },
  { path: "/gallery", icon: ImageIcon, label: "Gallery" },
  { path: "/pricing", icon: CreditCard, label: "Plans" },
];

export function TopNav() {
  const location = useLocation();

  return (
    <nav className="hidden md:block sticky top-0 z-50">
      <div className="absolute inset-0 bg-background/70 backdrop-blur-xl border-b border-border/50" />
      
      <div className="relative container mx-auto px-4">
        <div className="flex items-center h-14 gap-1">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mr-6 shrink-0">
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-foreground">
              Spirit<span className="text-primary">Vision</span>
            </span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-1 flex-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="topNavIndicator"
                      className="absolute inset-0 bg-primary/10 rounded-lg"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                  <Icon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
