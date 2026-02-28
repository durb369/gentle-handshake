import { Link, useLocation } from "react-router-dom";
import { Eye, BookOpen, Book, Sparkles, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navItems = [
  { path: "/", icon: Eye, label: "Scan" },
  { path: "/journal", icon: BookOpen, label: "Journal" },
  { path: "/encyclopedia", icon: Book, label: "Bestiary" },
  { path: "/fortune-teller", icon: Sparkles, label: "Fortune" },
  { path: "/pricing", icon: CreditCard, label: "Plans" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Frosted glass background */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-border/50" />
      
      <div className="relative flex items-center justify-around px-2 py-1 safe-area-bottom">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors relative min-w-[56px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground active:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <Icon className={cn("w-5 h-5 relative z-10", isActive && "drop-shadow-[0_0_6px_hsl(175_70%_45%/0.5)]")} />
              <span className="text-[10px] font-medium relative z-10 leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
