import { Hammer, Wrench, Paintbrush, CookingPot, DoorOpen, Frame, Ruler, Sofa, LucideIcon } from "lucide-react";
const map: Record<string, LucideIcon> = { Hammer, Wrench, Paintbrush, CookingPot, DoorOpen, Frame, Ruler, Sofa };
export default function ServiceIcon({ name, size = 24 }: { name: string; size?: number }) {
  const I = map[name] ?? Hammer;
  return <I size={size} />;
}
