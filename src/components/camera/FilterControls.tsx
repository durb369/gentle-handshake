import { Slider } from "@/components/ui/slider";
import { ImagingMode } from "./ImagingModeSelector";
import { Zap, Waves, Eye, Ghost } from "lucide-react";

interface FilterControlsProps {
  mode: ImagingMode;
  reflectionIntensity: number[];
  setReflectionIntensity: (value: number[]) => void;
  lightBleed: number[];
  setLightBleed: (value: number[]) => void;
  shadowDepth: number[];
  setShadowDepth: (value: number[]) => void;
  thermalSensitivity: number[];
  setThermalSensitivity: (value: number[]) => void;
  spectralBands: number[];
  setSpectralBands: (value: number[]) => void;
  polarizationAngle: number[];
  setPolarizationAngle: (value: number[]) => void;
}

export function FilterControls({
  mode,
  reflectionIntensity,
  setReflectionIntensity,
  lightBleed,
  setLightBleed,
  shadowDepth,
  setShadowDepth,
  thermalSensitivity,
  setThermalSensitivity,
  spectralBands,
  setSpectralBands,
  polarizationAngle,
  setPolarizationAngle,
}: FilterControlsProps) {
  if (mode === "reflection") {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Ghost className="w-3.5 h-3.5 text-primary" />
          <span>Dimensional Breach Detection</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground flex items-center gap-1">
              <span>Mirror Plane</span>
              <span className="text-primary font-medium">{reflectionIntensity[0]}%</span>
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
              <span className="text-primary font-medium">{lightBleed[0]}%</span>
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
              <span>Shadow Realm</span>
              <span className="text-primary font-medium">{shadowDepth[0]}%</span>
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
        <p className="text-xs text-muted-foreground/70 mt-1">
          Reveals spirits hiding in reflections and dimensional overlaps
        </p>
      </div>
    );
  }

  if (mode === "thermal") {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Zap className="w-3.5 h-3.5 text-orange-400" />
          <span>Entity Energy Field Detection</span>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground flex items-center gap-1">
            <span>Thermal Sensitivity</span>
            <span className="text-orange-400 font-medium">{thermalSensitivity[0]}%</span>
          </label>
          <Slider
            value={thermalSensitivity}
            onValueChange={setThermalSensitivity}
            max={100}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground/70">
            Detects cold spots, heat anomalies, and energy signatures of entities
          </p>
        </div>
      </div>
    );
  }

  if (mode === "hyperspectral") {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Waves className="w-3.5 h-3.5 text-emerald-400" />
          <span>Interdimensional Frequency Scanner</span>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground flex items-center gap-1">
            <span>Spectral Band Separation</span>
            <span className="text-emerald-400 font-medium">{spectralBands[0]}%</span>
          </label>
          <Slider
            value={spectralBands}
            onValueChange={setSpectralBands}
            max={100}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground/70">
            Separates light frequencies to reveal beings existing outside visible spectrum
          </p>
        </div>
      </div>
    );
  }

  if (mode === "polarimetric") {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Eye className="w-3.5 h-3.5 text-violet-400" />
          <span>Aura & Energy Field Visualization</span>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground flex items-center gap-1">
            <span>Polarization Angle</span>
            <span className="text-violet-400 font-medium">{polarizationAngle[0]}°</span>
          </label>
          <Slider
            value={polarizationAngle}
            onValueChange={setPolarizationAngle}
            max={100}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground/70">
            Reveals auras, energy fields, and the boundaries between dimensions
          </p>
        </div>
      </div>
    );
  }

  return null;
}
