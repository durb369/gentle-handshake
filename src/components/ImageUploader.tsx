import { useState, useCallback } from "react";
import { Upload, X, Eye, Sparkles, Camera, Aperture, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CameraCapture } from "./CameraCapture";
import type { ImagingMode } from "@/components/camera";

interface ImageUploaderProps {
  onImageSelect: (base64: string) => void;
  isAnalyzing: boolean;
  disabled?: boolean;
}

export function ImageUploader({ onImageSelect, isAnalyzing, disabled = false }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraMode, setCameraMode] = useState<ImagingMode>("reflection");

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreview(base64);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleAnalyze = () => {
    if (preview) {
      onImageSelect(preview);
    }
  };

  const clearImage = () => {
    setPreview(null);
  };

  const handleCameraCapture = (base64: string) => {
    setPreview(base64);
    setShowCamera(false);
  };

  if (showCamera) {
    return (
      <CameraCapture 
        onCapture={handleCameraCapture} 
        onClose={() => setShowCamera(false)}
        initialMode={cameraMode}
      />
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!preview ? (
        <div className="space-y-4">
          {/* Camera Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {/* Reflection Camera */}
            <Button
              onClick={() => { setCameraMode("reflection"); setShowCamera(true); }}
              variant="outline"
              className="py-6 border-2 border-dashed border-accent/50 hover:border-accent hover:bg-accent/10 transition-all duration-300 group h-auto"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 rounded-full bg-accent/10 group-hover:bg-accent/20 group-hover:shadow-purple-glow transition-all">
                  <Aperture className="w-6 h-6 text-accent" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground text-sm">Spirit Glass</p>
                  <p className="text-[10px] text-muted-foreground">Reflection filter</p>
                </div>
              </div>
            </Button>

            {/* Thermal Camera */}
            <Button
              onClick={() => { setCameraMode("thermal"); setShowCamera(true); }}
              variant="outline"
              className="py-6 border-2 border-dashed border-orange-500/50 hover:border-orange-500 hover:bg-orange-500/10 transition-all duration-300 group h-auto"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 rounded-full bg-orange-500/10 group-hover:bg-orange-500/20 transition-all">
                  <Flame className="w-6 h-6 text-orange-400" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground text-sm">Thermal Scan</p>
                  <p className="text-[10px] text-muted-foreground">Energy field detection</p>
                </div>
              </div>
            </Button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Upload Area */}
          <label
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              "flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-500",
              "bg-card/30 backdrop-blur-sm relative overflow-hidden group",
              isDragging 
                ? "border-primary bg-primary/10 shadow-mystic-lg" 
                : "border-border hover:border-primary/50 hover:bg-card/50 hover:shadow-mystic"
            )}
          >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-glow-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 flex flex-col items-center justify-center pt-5 pb-6">
              <div className={cn(
                "p-4 rounded-full mb-4 transition-all duration-500",
                isDragging 
                  ? "bg-primary/20 shadow-mystic" 
                  : "bg-muted group-hover:bg-primary/10 group-hover:shadow-mystic"
              )}>
                <Upload className={cn(
                  "w-10 h-10 transition-all duration-300",
                  isDragging ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                )} />
              </div>
              
              <p className="mb-2 text-lg font-semibold text-foreground">
                Upload Existing Photo
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                Drop your photo here or click to browse
              </p>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
                <Sparkles className="w-3 h-3" />
                <span>Photos with smoke, mist, or shadows work best</span>
                <Sparkles className="w-3 h-3" />
              </div>
            </div>
            
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleInputChange}
            />
          </label>
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden bg-card/50 backdrop-blur-sm border border-border shadow-mystic">
          {/* Image */}
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-auto max-h-[500px] object-contain"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />
          </div>
          
          {/* Clear button */}
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="secondary"
              size="icon"
              onClick={clearImage}
              className="bg-background/80 backdrop-blur-sm hover:bg-background border border-border"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Analyze button */}
          <div className="p-5 border-t border-border bg-card/80 backdrop-blur-sm">
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || disabled}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-7 text-lg shadow-mystic transition-all duration-300 hover:shadow-mystic-lg disabled:opacity-50"
            >
              {isAnalyzing ? (
                <span className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Scanning the Unseen...
                </span>
              ) : (
                <span className="flex items-center gap-3">
                  <Eye className="w-6 h-6" />
                  Reveal What's Hidden
                  <Sparkles className="w-5 h-5" />
                </span>
              )}
            </Button>
            
            <p className="text-center text-xs text-muted-foreground mt-3">
              AI will scan for spirits, entities, hidden messages, and energies
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
