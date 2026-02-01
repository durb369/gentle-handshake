import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Flame, Sparkles, Eye, Aperture } from "lucide-react";

export type ImagingMode = "reflection" | "thermal" | "hyperspectral" | "polarimetric";

interface ImagingModeSelectorProps {
  value: ImagingMode;
  onChange: (mode: ImagingMode) => void;
}

const modes = [
  {
    id: "reflection" as const,
    label: "Reflection",
    icon: Aperture,
    description: "Window glass effects",
  },
  {
    id: "thermal" as const,
    label: "Thermal",
    icon: Flame,
    description: "Heat signature detection",
  },
  {
    id: "hyperspectral" as const,
    label: "Spectral",
    icon: Sparkles,
    description: "Multi-band analysis",
  },
  {
    id: "polarimetric" as const,
    label: "Polarimetric",
    icon: Eye,
    description: "Surface stress patterns",
  },
];

export function ImagingModeSelector({ value, onChange }: ImagingModeSelectorProps) {
  return (
    <div className="w-full">
      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(v as ImagingMode)}
        className="grid grid-cols-4 gap-2"
      >
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = value === mode.id;
          
          return (
            <Label
              key={mode.id}
              htmlFor={mode.id}
              className={`
                flex flex-col items-center gap-1 p-2 rounded-lg cursor-pointer transition-all
                border-2 text-center
                ${isSelected 
                  ? "border-primary bg-primary/10 text-primary" 
                  : "border-border/50 bg-card/50 text-muted-foreground hover:border-primary/50"
                }
              `}
            >
              <RadioGroupItem value={mode.id} id={mode.id} className="sr-only" />
              <Icon className={`w-5 h-5 ${isSelected ? "text-primary" : ""}`} />
              <span className="text-xs font-medium">{mode.label}</span>
            </Label>
          );
        })}
      </RadioGroup>
    </div>
  );
}
