import { Slider } from "@/components/ui/slider";
import { ImagingMode } from "./ImagingModeSelector";

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
    );
  }

  if (mode === "thermal") {
    return (
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground flex items-center gap-1">
          <span>Thermal Sensitivity</span>
          <span className="text-orange-400">{thermalSensitivity[0]}%</span>
        </label>
        <Slider
          value={thermalSensitivity}
          onValueChange={setThermalSensitivity}
          max={100}
          step={1}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground/70">
          Higher sensitivity detects subtler temperature variations
        </p>
      </div>
    );
  }

  if (mode === "hyperspectral") {
    return (
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground flex items-center gap-1">
          <span>Spectral Band Separation</span>
          <span className="text-emerald-400">{spectralBands[0]}%</span>
        </label>
        <Slider
          value={spectralBands}
          onValueChange={setSpectralBands}
          max={100}
          step={1}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground/70">
          Separates wavelength bands to reveal hidden spectral signatures
        </p>
      </div>
    );
  }

  if (mode === "polarimetric") {
    return (
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground flex items-center gap-1">
          <span>Polarization Angle</span>
          <span className="text-violet-400">{polarizationAngle[0]}°</span>
        </label>
        <Slider
          value={polarizationAngle}
          onValueChange={setPolarizationAngle}
          max={100}
          step={1}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground/70">
          Rotate polarization to reveal surface stress patterns and hidden structures
        </p>
      </div>
    );
  }

  return null;
}
