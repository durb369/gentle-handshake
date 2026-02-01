import { useState, useRef, useCallback, useEffect } from "react";
import { X, Eye, SwitchCamera, Aperture, Flame, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ImagingModeSelector,
  ImagingMode,
  FilterControls,
  applyImagingFilter,
  getLivePreviewFilter,
  getLivePreviewOverlay,
} from "@/components/camera";

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  onClose: () => void;
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [imagingMode, setImagingMode] = useState<ImagingMode>("reflection");
  
  // Filter controls for each mode
  const [reflectionIntensity, setReflectionIntensity] = useState([50]);
  const [lightBleed, setLightBleed] = useState([30]);
  const [shadowDepth, setShadowDepth] = useState([40]);
  const [thermalSensitivity, setThermalSensitivity] = useState([70]);
  const [spectralBands, setSpectralBands] = useState([60]);
  const [polarizationAngle, setPolarizationAngle] = useState([45]);

  const getFilterSettings = useCallback(() => ({
    reflectionIntensity: reflectionIntensity[0],
    lightBleed: lightBleed[0],
    shadowDepth: shadowDepth[0],
    thermalSensitivity: thermalSensitivity[0],
    spectralBands: spectralBands[0],
    polarizationAngle: polarizationAngle[0],
  }), [reflectionIntensity, lightBleed, shadowDepth, thermalSensitivity, spectralBands, polarizationAngle]);

  const startCamera = useCallback(async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          setIsReady(true);
        };
      }
    } catch (error) {
      console.error("Camera access error:", error);
    }
  }, [facingMode, stream]);

  useEffect(() => {
    startCamera();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (stream) {
      startCamera();
    }
  }, [facingMode]);

  const switchCamera = () => {
    setFacingMode(prev => prev === "user" ? "environment" : "user");
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // Apply the selected imaging filter
    applyImagingFilter(ctx, canvas.width, canvas.height, imagingMode, getFilterSettings());

    const base64 = canvas.toDataURL("image/jpeg", 0.95);
    onCapture(base64);
  };

  const getModeIcon = () => {
    switch (imagingMode) {
      case "thermal": return <Flame className="w-5 h-5 text-orange-400" />;
      case "hyperspectral": return <Sparkles className="w-5 h-5 text-emerald-400" />;
      case "polarimetric": return <Eye className="w-5 h-5 text-violet-400" />;
      default: return <Aperture className="w-5 h-5 text-primary" />;
    }
  };

  const getModeTitle = () => {
    switch (imagingMode) {
      case "thermal": return "Thermal Imaging";
      case "hyperspectral": return "Hyperspectral Analysis";
      case "polarimetric": return "Polarimetric Detection";
      default: return "Reflection Filter";
    }
  };

  const getModeDescription = () => {
    switch (imagingMode) {
      case "thermal": return "Detecting heat signatures and temperature anomalies";
      case "hyperspectral": return "Separating light wavelengths to reveal hidden spectra";
      case "polarimetric": return "Analyzing surface stress patterns and hidden structures";
      default: return "Breaking the plane between worlds";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-full ${
            imagingMode === "thermal" ? "bg-orange-500/10" :
            imagingMode === "hyperspectral" ? "bg-emerald-500/10" :
            imagingMode === "polarimetric" ? "bg-violet-500/10" :
            "bg-primary/10"
          }`}>
            {getModeIcon()}
          </div>
          <div>
            <h2 className="font-semibold text-foreground">{getModeTitle()}</h2>
            <p className="text-xs text-muted-foreground">{getModeDescription()}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{
            filter: getLivePreviewFilter(imagingMode, getFilterSettings()),
          }}
        />
        
        {/* Mode-specific overlay effect */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: getLivePreviewOverlay(imagingMode, getFilterSettings()),
          }}
        />

        {/* Thermal scan lines */}
        {imagingMode === "thermal" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div 
              className="absolute w-full h-1 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent"
              style={{ 
                top: '50%',
                animation: 'thermalScan 2s ease-in-out infinite'
              }}
            />
          </div>
        )}

        {/* Hyperspectral band lines */}
        {imagingMode === "hyperspectral" && (
          <div 
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              background: `
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 20px,
                  rgba(0, 255, 100, 0.1) 20px,
                  rgba(0, 255, 100, 0.1) 21px
                )
              `,
            }}
          />
        )}

        {/* Polarimetric cross pattern */}
        {imagingMode === "polarimetric" && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div 
              className="w-full h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent"
              style={{ transform: `rotate(${polarizationAngle[0] * 1.8}deg)` }}
            />
            <div 
              className="absolute w-full h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent"
              style={{ transform: `rotate(${polarizationAngle[0] * 1.8 + 90}deg)` }}
            />
          </div>
        )}

        {/* Reflection glass streaks */}
        {imagingMode === "reflection" && (
          <div 
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              background: `
                repeating-linear-gradient(
                  120deg,
                  transparent,
                  transparent 100px,
                  rgba(255, 255, 255, ${0.1 * reflectionIntensity[0] / 100}) 100px,
                  rgba(255, 255, 255, ${0.1 * reflectionIntensity[0] / 100}) 102px
                )
              `,
            }}
          />
        )}

        {/* Vignette for all modes */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.4) 100%)`,
          }}
        />

        {/* Scanning line animation */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div 
            className={`absolute w-full h-px ${
              imagingMode === "thermal" ? "bg-orange-500/30" :
              imagingMode === "hyperspectral" ? "bg-emerald-500/30" :
              imagingMode === "polarimetric" ? "bg-violet-500/30" :
              "bg-primary/30"
            }`}
            style={{ 
              top: '30%',
              boxShadow: imagingMode === "thermal" ? "0 0 20px orange" :
                        imagingMode === "hyperspectral" ? "0 0 20px emerald" :
                        imagingMode === "polarimetric" ? "0 0 20px violet" :
                        "0 0 20px hsl(var(--primary))",
              animation: 'scan 3s ease-in-out infinite'
            }}
          />
        </div>

        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <div className="text-center">
              {getModeIcon()}
              <p className="text-muted-foreground mt-3">Initializing {getModeTitle().toLowerCase()}...</p>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls */}
      <div className="p-4 space-y-4 bg-card/80 backdrop-blur-sm border-t border-border">
        {/* Mode selector */}
        <ImagingModeSelector value={imagingMode} onChange={setImagingMode} />

        {/* Mode-specific filter controls */}
        <FilterControls
          mode={imagingMode}
          reflectionIntensity={reflectionIntensity}
          setReflectionIntensity={setReflectionIntensity}
          lightBleed={lightBleed}
          setLightBleed={setLightBleed}
          shadowDepth={shadowDepth}
          setShadowDepth={setShadowDepth}
          thermalSensitivity={thermalSensitivity}
          setThermalSensitivity={setThermalSensitivity}
          spectralBands={spectralBands}
          setSpectralBands={setSpectralBands}
          polarizationAngle={polarizationAngle}
          setPolarizationAngle={setPolarizationAngle}
        />

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="secondary"
            size="icon"
            onClick={switchCamera}
            className="rounded-full w-12 h-12"
          >
            <SwitchCamera className="w-5 h-5" />
          </Button>
          
          <Button
            onClick={capturePhoto}
            disabled={!isReady}
            className={`rounded-full w-20 h-20 shadow-mystic hover:shadow-mystic-lg transition-all ${
              imagingMode === "thermal" ? "bg-orange-500 hover:bg-orange-600" :
              imagingMode === "hyperspectral" ? "bg-emerald-500 hover:bg-emerald-600" :
              imagingMode === "polarimetric" ? "bg-violet-500 hover:bg-violet-600" :
              "bg-primary hover:bg-primary/90"
            }`}
          >
            <Eye className="w-8 h-8" />
          </Button>
          
          <div className="w-12 h-12" />
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { transform: translateY(0); opacity: 0.3; }
          50% { transform: translateY(200px); opacity: 0.8; }
        }
        @keyframes thermalScan {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
