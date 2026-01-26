import { useState, useCallback } from "react";
import { Upload, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  onImageSelect: (base64: string) => void;
  isAnalyzing: boolean;
}

export function ImageUploader({ onImageSelect, isAnalyzing }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    
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

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!preview ? (
        <label
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "flex flex-col items-center justify-center w-full h-72 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300",
            "bg-card/50 backdrop-blur-sm",
            isDragging 
              ? "border-primary bg-primary/10 shadow-mystic" 
              : "border-border hover:border-primary/50 hover:bg-card/80"
          )}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <div className={cn(
              "p-4 rounded-full mb-4 transition-all duration-300",
              isDragging ? "bg-primary/20" : "bg-muted"
            )}>
              <Upload className={cn(
                "w-10 h-10 transition-colors",
                isDragging ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <p className="mb-2 text-lg font-medium text-foreground">
              Drop your image here
            </p>
            <p className="text-sm text-muted-foreground">
              or click to browse
            </p>
            <p className="mt-3 text-xs text-muted-foreground/70">
              PNG, JPG, WEBP up to 10MB
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleInputChange}
          />
        </label>
      ) : (
        <div className="relative rounded-2xl overflow-hidden bg-card/50 backdrop-blur-sm border border-border">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-auto max-h-[500px] object-contain"
          />
          <div className="absolute top-4 right-4">
            <Button
              variant="secondary"
              size="icon"
              onClick={clearImage}
              className="bg-background/80 backdrop-blur-sm hover:bg-background"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="p-4 border-t border-border bg-card/80 backdrop-blur-sm">
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-lg shadow-mystic transition-all duration-300 hover:shadow-mystic-lg"
            >
              {isAnalyzing ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Revealing Hidden Messages...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Reveal Hidden Messages
                </span>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
