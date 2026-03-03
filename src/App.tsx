import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";
import Index from "./pages/Index";
import SpiritJournal from "./pages/SpiritJournal";
import EntityEncyclopedia from "./pages/EntityEncyclopedia";
import SketchGallery from "./pages/SketchGallery";
import BoostedFeatures from "./pages/BoostedFeatures";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import PlayStoreListing from "./pages/PlayStoreListing";
import FortuneTeller from "./pages/FortuneTeller";
import SpiritBox from "./pages/SpiritBox";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import { AppLayout } from "@/components/layout/AppLayout";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason);
      toast.error("Something went wrong. Please try again.");
      event.preventDefault();
    };

    const onError = (event: ErrorEvent) => {
      console.error("Window error:", event.error ?? event.message);
      toast.error("Something went wrong. Please try again.");
    };

    window.addEventListener("unhandledrejection", onUnhandledRejection);
    window.addEventListener("error", onError);
    return () => {
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
      window.removeEventListener("error", onError);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppErrorBoundary>
          <BrowserRouter>
            <AppLayout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/journal" element={<SpiritJournal />} />
                <Route path="/encyclopedia" element={<EntityEncyclopedia />} />
                <Route path="/gallery" element={<SketchGallery />} />
                <Route path="/psychic" element={<BoostedFeatures />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/play-store-listing" element={<PlayStoreListing />} />
                <Route path="/fortune-teller" element={<FortuneTeller />} />
                <Route path="/spirit-box" element={<SpiritBox />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
          </BrowserRouter>
        </AppErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
