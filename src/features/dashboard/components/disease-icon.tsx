import {
  Activity,
  Baby,
  Bird,
  Bug,
  BugOff,
  Droplets,
  Radiation,
  ShieldAlert,
  Skull,
  Stethoscope,
  Syringe,
  Thermometer,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Activity,
  Baby,
  Bird,
  Bug,
  BugOff,
  Droplets,
  Radiation,
  ShieldAlert,
  Skull,
  Stethoscope,
  Syringe,
  Thermometer,
};

interface DiseaseIconProps {
  name?: string | null;
  className?: string;
}

export function DiseaseIcon({ name, className }: DiseaseIconProps) {
  const Icon = (name && ICON_MAP[name]) || Activity;
  return <Icon className={className} aria-hidden="true" />;
}