import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BottomNav } from "./BottomNav";
import { TopNav } from "./TopNav";

// Pages where we hide the global nav (e.g. fullscreen chat experiences)
const HIDE_NAV_ROUTES = ["/fortune-teller"];

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const hideNav = HIDE_NAV_ROUTES.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col">
      {!hideNav && <TopNav />}
      
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={!hideNav ? "flex-1 pb-20 md:pb-0" : "flex-1"}
        >
          {children}
        </motion.main>
      </AnimatePresence>

      {!hideNav && <BottomNav />}
    </div>
  );
}
