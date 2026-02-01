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
    label: "Spirit Glass",
    icon: Aperture,
    description: "Dimensional breach detection",
  },
  {
    id: "thermal" as const,
    label: "Energy Field",
    icon: Flame,
    description: "Entity heat signatures",
  },
  {
    id: "hyperspectral" as const,
    label: "Beyond Sight",
    icon: Sparkles,
    description: "Hidden frequency scanner",
  },
  {
    id: "polarimetric" as const,
    label: "Aura Vision",
    icon: Eye,
    description: "Energy field visualization",
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
