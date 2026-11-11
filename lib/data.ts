export type Product = {
  id: string; name: string; category: string; price: number; mrp: number;
  rating: number; tag?: string; hue: number; desc: string;
  images?: string[]; stock?: number;
};

export type Project = {
  id: string; title: string; category: string; location: string; year: number;
  description: string; images: string[]; hue: number; featured: boolean;
};


export const BRAND = {
  name: "Ronak Wood Craft",
  phone: "+91 98765 43210",         // TODO: your phone number
  whatsapp: "919876543210",         // TODO: with country code, without +
  email: "hello@ronakwoodcraft.in", // TODO
  address: "Plot 12, Timber Market Road, Ambala, Haryana", // TODO
};

export const SLIDES = [
  { tag: "New collection", save: "Flat 20% off", title: "Solid wood furniture, straight from our workshop",
    desc: "Sheesham and teak beds, sofas and dining sets — hand-finished.", cta: "Shop now", href: "/shop", code: "RONAK20" },
  { tag: "At-home service", save: "Free site visit", title: "Carpenter at your door",
    desc: "Measuring, repairs and fitting — our verified carpenters come to your home.", cta: "Book a visit", href: "/bookings?service=carpenter", code: "VISIT0" },
  { tag: "Custom work", save: "Save 15%", title: "Modular kitchen & wardrobe",
    desc: "Woodwork built to your size and design.", cta: "Get a quote", href: "/bookings?service=kitchen", code: "CUSTOM15" },
  { tag: "Repair & polish", save: "Save 10%", title: "Make old furniture look new again",
    desc: "Polish, PU coating, termite treatment aur repair.", cta: "Book now", href: "/bookings?service=polish", code: "POLISH10" },
];

export const SERVICES = [
  { id: "carpenter", name: "Carpenter", icon: "Hammer" },
  { id: "repair", name: "Furniture Repair", icon: "Wrench" },
  { id: "polish", name: "Polish & PU", icon: "Paintbrush" },
  { id: "kitchen", name: "Modular Kitchen", icon: "CookingPot" },
  { id: "wardrobe", name: "Wardrobe", icon: "DoorOpen" },
  { id: "doors", name: "Doors & Windows", icon: "Frame" },
  { id: "custom", name: "Custom Furniture", icon: "Ruler" },
  { id: "interior", name: "Interior Woodwork", icon: "Sofa" },
];

export const CATEGORIES = ["Beds", "Sofas", "Dining", "Storage", "Tables", "Decor"];

export const PRODUCTS: Product[] = [
  { id: "p1", name: "Sheesham King Bed", category: "Beds", price: 38999, mrp: 46999, rating: 4.8, tag: "Bestseller", hue: 24, desc: "Solid sheesham, hydraulic storage option, walnut finish." },
  { id: "p2", name: "Teak Queen Bed", category: "Beds", price: 44999, mrp: 52999, rating: 4.7, hue: 32, desc: "Premium teak frame with carved headboard." },
  { id: "p3", name: "3-Seater Wooden Sofa", category: "Sofas", price: 27499, mrp: 33999, rating: 4.6, hue: 20, desc: "Hand-finished frame, high-density cushions." },
  { id: "p4", name: "Lounge Chair", category: "Sofas", price: 11999, mrp: 14999, rating: 4.5, tag: "New", hue: 36, desc: "Curved back, solid wood arms." },
  { id: "p5", name: "6-Seater Dining Set", category: "Dining", price: 42999, mrp: 51999, rating: 4.9, tag: "Bestseller", hue: 28, desc: "Table + 6 chairs, scratch-resistant polish." },
  { id: "p6", name: "4-Seater Dining Set", category: "Dining", price: 29999, mrp: 35999, rating: 4.6, hue: 26, desc: "Compact set for small homes." },
  { id: "p7", name: "3-Door Wardrobe", category: "Storage", price: 34999, mrp: 41999, rating: 4.7, hue: 18, desc: "Mirror, locker and hanging space." },
  { id: "p8", name: "Bookshelf Unit", category: "Storage", price: 8999, mrp: 11499, rating: 4.4, hue: 34, desc: "5 shelves, wall-anchor included." },
  { id: "p9", name: "Carved Coffee Table", category: "Tables", price: 7499, mrp: 9499, rating: 4.5, hue: 30, desc: "Hand-carved top, storage drawer." },
  { id: "p10", name: "Study Table", category: "Tables", price: 9999, mrp: 12999, rating: 4.6, tag: "New", hue: 22, desc: "Cable cutout, 2 drawers." },
  { id: "p11", name: "Wooden Wall Shelf Set", category: "Decor", price: 1999, mrp: 2799, rating: 4.3, hue: 38, desc: "Set of 3 floating shelves." },
  { id: "p12", name: "Handcrafted Wooden Mandir (Home Temple)", category: "Decor", price: 6499, mrp: 7999, rating: 4.9, hue: 16, desc: "Teak mandir with doors and LED slot." },
];

export const COUPONS: Record<string, number> = { RONAK20: 20, CUSTOM15: 15, POLISH10: 10 };
export const TIME_SLOTS = ["9 AM – 11 AM", "11 AM – 1 PM", "2 PM – 4 PM", "4 PM – 6 PM"];

export const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export const SEED_PROJECTS: Project[] = [
  { id: "j1", title: "Modular kitchen — Sharma residence", category: "Kitchen", location: "Ambala", year: 2025, description: "L-shaped modular kitchen, marine ply with PU finish, soft-close drawers.", images: [], hue: 24, featured: true },
  { id: "j2", title: "Sliding wardrobe — 3 door", category: "Wardrobe", location: "Chandigarh", year: 2025, description: "Floor-to-ceiling wardrobe with loft, mirror panel and LED strip.", images: [], hue: 18, featured: true },
  { id: "j3", title: "Teak mandir unit", category: "Furniture", location: "Panchkula", year: 2024, description: "Hand-carved teak mandir (home temple) with doors and concealed lighting.", images: [], hue: 32, featured: true },
];
