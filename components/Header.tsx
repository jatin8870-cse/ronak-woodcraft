"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Store, Images, CalendarCheck, ShoppingBag, TreePine, LocateFixed, Package } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/context/StoreContext";
import ThemeToggle from "./ThemeToggle";
import SearchBar from "./SearchBar";
import AccountMenu from "./AccountMenu";

const LINKS = [
  { href: "/shop", label: "Shop", Icon: Store },
  { href: "/projects", label: "Projects", Icon: Images },
  { href: "/bookings", label: "Bookings", Icon: CalendarCheck },
];

export default function Header() {
  const { cartCount, address, setAddress, user } = useStore();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [locating, setLocating] = useState(false);
  const [locErr, setLocErr] = useState("");

  // Ask the browser for the current position, then turn it into a readable address (OpenStreetMap Nominatim).
  const useCurrentLocation = () => {
    setLocErr("");
    if (!navigator.geolocation) return setLocErr("Location isn't supported in this browser.");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=16&lat=${coords.latitude}&lon=${coords.longitude}`);
          const a = (await res.json()).address ?? {};
          const text = [a.road, a.suburb || a.neighbourhood, a.city || a.town || a.village || a.county, a.state].filter(Boolean).join(", ");
          if (!text) throw new Error("no address");
          setAddress(text); setDraft(text); setOpen(false);
        } catch { setLocErr("Couldn't work out your address. Please type it instead."); }
        finally { setLocating(false); }
      },
      (e) => { setLocating(false); setLocErr(e.code === 1 ? "Location permission was denied. Allow it in your browser settings or type your address." : "Couldn't get your location. Please type it instead."); },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <>
      <div className="promo">Free site visit on every booking · Flat 20% off furniture with code <b>RONAK20</b></div>
      <header className="topbar">
        <div className="wrap" style={{ position: "relative" }}>
          <div className="top-row">
            <Link href="/" className="brand" aria-label="Ronak Wood Craft home">
              <span className="brand-mark"><TreePine size={24} /></span>
              <span><b>Ronak Wood Craft</b><small>Furniture & Carpentry</small></span>
            </Link>

            <nav className="nav" aria-label="Main">
              {LINKS.map(({ href, label, Icon }) => (
                <Link key={href} href={href} className={`nl ${path.startsWith(href) ? "on" : ""}`}><Icon size={18} /> {label}</Link>
              ))}
              {user && (
                <Link href="/orders" className={`nl ${path.startsWith("/orders") ? "on" : ""}`}><Package size={18} /> My orders</Link>
              )}
            </nav>

            <div className="actions">
              <ThemeToggle />
              <Link href="/cart" className="icon-btn nav-cart" aria-label={`Cart${cartCount ? `, ${cartCount} items` : ""}`}>
                <ShoppingBag size={18} />{cartCount > 0 && <span className="badge">{cartCount}</span>}
              </Link>
              <span className="acct-full"><AccountMenu /></span>
              <span className="acct-compact"><AccountMenu compact /></span>
            </div>
          </div>

          <div className="sub-row">
            <button className="loc" onClick={() => { setDraft(address); setOpen(!open); }} aria-expanded={open}>
              <MapPin size={18} /><span>{address}</span>
            </button>
            <SearchBar />
            {open && (
              <div className="loc-panel">
                <label className="field">Delivery / service address
                  <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Flat, street, city" />
                </label>
                <button type="button" className="btn ghost sm" onClick={useCurrentLocation} disabled={locating}><LocateFixed size={16} /> {locating ? "Finding your location…" : "Use my current location"}</button>
                {locErr && <div className="err">{locErr}</div>}
                <button className="btn sm" onClick={() => { if (draft.trim()) setAddress(draft.trim()); setOpen(false); }}>Save address</button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
