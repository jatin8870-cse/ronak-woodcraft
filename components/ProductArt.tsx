import { Bed, Sofa, UtensilsCrossed, Archive, Table2, Flower2, Armchair } from "lucide-react";
import type { Product } from "@/lib/data";

const icons: Record<string, any> = { Beds: Bed, Sofas: Sofa, Dining: UtensilsCrossed, Storage: Archive, Tables: Table2, Decor: Flower2 };

// Shows the uploaded photo if the admin added one, otherwise a wood-grain placeholder.
export default function ProductArt({ p, size = 44 }: { p: Pick<Product, "category" | "hue" | "tag" | "images" | "name">; size?: number }) {
  const Icon = icons[p.category] ?? Armchair;
  const img = p.images?.[0];
  return (
    <div className="grain" style={{ ["--h" as any]: p.hue, width: "100%", height: "100%" }}>
      {img ? (
  <img
    src={img}
    alt={p.name}
    onError={(e) => {
      e.currentTarget.style.display = "none";
      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
      if (fallback) fallback.style.display = "flex";
    }}
    style={{
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover",
    }}
  />
) : null}

<div
  style={{
    display: img ? "none" : "flex",
    position: "absolute",
    inset: 0,
    alignItems: "center",
    justifyContent: "center",
    color: "#9ca3af",
    background: "#f3f4f6",
  }}
>
  <Icon size={size} strokeWidth={1.4} />
</div>
    </div>
  );
}
