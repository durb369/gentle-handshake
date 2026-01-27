import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, X, Sparkles, Eye, SwitchCamera, Aperture } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

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
  
  // Filter controls
  const [reflectionIntensity, setReflectionIntensity] = useState([50]);
  const [lightBleed, setLightBleed] = useState([30]);
  const [shadowDepth, setShadowDepth] = useState([40]);

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

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame
    ctx.drawImage(video, 0, 0);

    // Apply reflection filter effects
    applyReflectionFilter(ctx, canvas.width, canvas.height);

    // Convert to base64
    const base64 = canvas.toDataURL("image/jpeg", 0.95);
    onCapture(base64);
  };

  const applyReflectionFilter = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    const reflectIntensity = reflectionIntensity[0] / 100;
    const lightIntensity = lightBleed[0] / 100;
    const shadowIntensity = shadowDepth[0] / 100;

    // Create reflection zones (simulate window glass reflection)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        
        // Create diagonal light streaks (window reflection pattern)
        const diagonalFactor = Math.sin((x + y) * 0.02) * 0.5 + 0.5;
        const verticalGradient = y / height;
        const horizontalWave = Math.sin(x * 0.01) * 0.3 + 0.7;
        
        // Light bleed effect - simulate light hitting glass
        const lightBleedEffect = Math.pow(diagonalFactor, 2) * lightIntensity * 60;
        
        // Shadow depth - enhance dark areas to reveal hidden forms
        const luminance = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
        const shadowEnhance = luminance < 0.4 ? (0.4 - luminance) * shadowIntensity * 50 : 0;
        
        // Reflection overlay - creates ghostly double exposure effect
        const reflectionOffset = Math.floor(width * 0.1);
        const mirrorX = width - x - 1;
        const mirrorI = (y * width + Math.min(mirrorX + reflectionOffset, width - 1)) * 4;
        
        // Blend original with mirrored reflection
        const reflectBlend = reflectIntensity * 0.3 * horizontalWave;
        
        // Apply effects
        data[i] = Math.min(255, data[i] + lightBleedEffect - shadowEnhance + (data[mirrorI] - data[i]) * reflectBlend);
        data[i + 1] = Math.min(255, data[i + 1] + lightBleedEffect * 0.9 - shadowEnhance + (data[mirrorI + 1] - data[i + 1]) * reflectBlend);
        data[i + 2] = Math.min(255, data[i + 2] + lightBleedEffect * 1.2 - shadowEnhance + (data[mirrorI + 2] - data[i + 2]) * reflectBlend);
        
        // Add subtle vignette for dimensional depth
        const centerX = width / 2;
        const centerY = height / 2;
        const distFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        const maxDist = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));
        const vignette = 1 - (distFromCenter / maxDist) * 0.3;
        
        data[i] *= vignette;
        data[i + 1] *= vignette;
        data[i + 2] *= vignette;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    // Add glass reflection overlay
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${0.05 * reflectIntensity})`);
    gradient.addColorStop(0.3, `rgba(200, 220, 255, ${0.02 * reflectIntensity})`);
    gradient.addColorStop(0.7, `rgba(255, 255, 255, ${0.03 * reflectIntensity})`);
    gradient.addColorStop(1, `rgba(180, 200, 255, ${0.04 * reflectIntensity})`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-primary/10">
            <Aperture className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Reflection Filter</h2>
            <p className="text-xs text-muted-foreground">Breaking the plane between worlds</p>
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
            filter: `
              contrast(${1 + shadowDepth[0] / 200})
              brightness(${1 + lightBleed[0] / 300})
            `,
          }}
        />
        
        {/* Reflection overlay effect (CSS-based real-time preview) */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              linear-gradient(
                135deg,
                rgba(255, 255, 255, ${0.08 * reflectionIntensity[0] / 100}) 0%,
                rgba(200, 220, 255, ${0.03 * reflectionIntensity[0] / 100}) 25%,
                transparent 50%,
                rgba(255, 255, 255, ${0.05 * reflectionIntensity[0] / 100}) 75%,
                rgba(180, 200, 255, ${0.06 * reflectionIntensity[0] / 100}) 100%
              )
            `,
          }}
        />
        
        {/* Glass streaks effect */}
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

        {/* Shadow depth vignette */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, ${0.4 * shadowDepth[0] / 100}) 100%)`,
          }}
        />

        {/* Mystical scanning lines */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div 
            className="absolute w-full h-px bg-primary/30 animate-pulse"
            style={{ 
              top: '30%',
              boxShadow: '0 0 20px hsl(var(--primary))',
              animation: 'scan 3s ease-in-out infinite'
            }}
          />
        </div>

        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <div className="text-center">
              <Sparkles className="w-10 h-10 text-primary animate-spin mx-auto mb-3" style={{ animationDuration: '2s' }} />
              <p className="text-muted-foreground">Activating spiritual lens...</p>
            </div>
          </div>
        )}

        {/* Hidden canvas for capture processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Filter Controls */}
      <div className="p-4 space-y-4 bg-card/80 backdrop-blur-sm border-t border-border">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground flex items-center gap-1">
              <span>Reflection</span>
              <span className="text-primary">{reflectionIntensity[0]}%</span>
            </label>
            <Slider
              value={reflectionIntensity}
              onValueChange={setReflectionIntensity}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground flex items-center gap-1">
              <span>Light Bleed</span>
              <span className="text-primary">{lightBleed[0]}%</span>
            </label>
            <Slider
              value={lightBleed}
              onValueChange={setLightBleed}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground flex items-center gap-1">
              <span>Shadow Depth</span>
              <span className="text-primary">{shadowDepth[0]}%</span>
            </label>
            <Slider
              value={shadowDepth}
              onValueChange={setShadowDepth}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        </div>

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
            className="rounded-full w-20 h-20 bg-primary hover:bg-primary/90 shadow-mystic hover:shadow-mystic-lg transition-all"
          >
            <Eye className="w-8 h-8" />
          </Button>
          
          <div className="w-12 h-12" /> {/* Spacer for symmetry */}
        </div>
        
        <p className="text-center text-xs text-muted-foreground">
          The reflection filter creates a dimensional mirror to reveal what hides between light and shadow
        </p>
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { transform: translateY(0); opacity: 0.3; }
          50% { transform: translateY(200px); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
