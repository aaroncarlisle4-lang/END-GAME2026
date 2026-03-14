import {
  Bone,
  Brain,
  Baby,
  Stethoscope,
  Wind,
  Pill,
  Scan,
  Activity,
  Eye,
  Radiation,
  Heart,
  Scissors,
  Ear,
  CircleDot,
  Zap,
  type LucideIcon,
} from "lucide-react";

export interface CategoryMeta {
  icon: LucideIcon;
  accent: string;        // Tailwind bg class
  accentText: string;    // Tailwind text class
  accentBorder: string;  // Tailwind border class
}

export const categoryConfig: Record<string, CategoryMeta> = {
  MSK:        { icon: Bone,        accent: "bg-amber-50",    accentText: "text-amber-700",    accentBorder: "border-amber-200" },
  Neuro:      { icon: Brain,       accent: "bg-purple-50",   accentText: "text-purple-700",   accentBorder: "border-purple-200" },
  Paeds:      { icon: Baby,        accent: "bg-pink-50",     accentText: "text-pink-700",     accentBorder: "border-pink-200" },
  GU:         { icon: Stethoscope, accent: "bg-teal-50",     accentText: "text-teal-700",     accentBorder: "border-teal-200" },
  Chest:      { icon: Wind,        accent: "bg-blue-50",     accentText: "text-blue-700",     accentBorder: "border-blue-200" },
  GI:         { icon: Pill,        accent: "bg-green-50",    accentText: "text-green-700",    accentBorder: "border-green-200" },
  CXR:        { icon: Scan,        accent: "bg-sky-50",      accentText: "text-sky-700",      accentBorder: "border-sky-200" },
  "MSK-Rapid":{ icon: Zap,         accent: "bg-orange-50",   accentText: "text-orange-700",   accentBorder: "border-orange-200" },
  "Paeds-Rapid":{ icon: Activity,  accent: "bg-rose-50",     accentText: "text-rose-700",     accentBorder: "border-rose-200" },
  ENT:        { icon: Ear,         accent: "bg-indigo-50",   accentText: "text-indigo-700",   accentBorder: "border-indigo-200" },
  Breast:     { icon: CircleDot,   accent: "bg-fuchsia-50",  accentText: "text-fuchsia-700",  accentBorder: "border-fuchsia-200" },
  US:         { icon: Eye,         accent: "bg-cyan-50",     accentText: "text-cyan-700",     accentBorder: "border-cyan-200" },
  VIR:        { icon: Scissors,    accent: "bg-red-50",      accentText: "text-red-700",      accentBorder: "border-red-200" },
  NucMed:     { icon: Radiation,   accent: "bg-yellow-50",   accentText: "text-yellow-700",   accentBorder: "border-yellow-200" },
  Gynae:      { icon: Heart,       accent: "bg-violet-50",   accentText: "text-violet-700",   accentBorder: "border-violet-200" },
  Cardiac:    { icon: Heart,       accent: "bg-red-50",      accentText: "text-red-700",      accentBorder: "border-red-200" },
};

export function getCategoryMeta(abbrev: string): CategoryMeta {
  return categoryConfig[abbrev] ?? {
    icon: Scan,
    accent: "bg-gray-50",
    accentText: "text-gray-700",
    accentBorder: "border-gray-200",
  };
}
