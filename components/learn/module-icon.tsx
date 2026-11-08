import {
  Activity,
  BookOpen,
  CalendarClock,
  Coins,
  Ruler,
  TrendingDown,
  TrendingUp,
  Waves,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  BookOpen,
  Ruler,
  TrendingUp,
  TrendingDown,
  Coins,
  Activity,
  Waves,
  CalendarClock,
};

export function ModuleIcon({
  name,
  className = "size-4",
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICONS[name] ?? BookOpen;
  return <Icon className={className} aria-hidden="true" />;
}
