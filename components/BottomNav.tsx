"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Store, CalendarCheck, ShoppingBag, User } from "lucide-react";
import { useStore } from "@/context/StoreContext";

const tabs = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/shop", label: "Shop", Icon: Store },
  { href: "/bookings", label: "Bookings", Icon: CalendarCheck },
  { href: "/cart", label: "Cart", Icon: ShoppingBag },
  { href: "/account", label: "Account", Icon: User },
];

export default function BottomNav() {
  const path = usePathname();
  const { cartCount } = useStore();
  return (
    <nav className="bottom" aria-label="Tabs">
      {tabs.map(({ href, label, Icon }) => {
        const on = href === "/" ? path === "/" : path.startsWith(href);
        return (
          <Link key={href} href={href} className={on ? "on" : ""}>
            <Icon size={22} />
            {label}
            {label === "Cart" && cartCount > 0 && <span className="badge">{cartCount}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
