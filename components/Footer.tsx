import Link from "next/link";
import { Phone, Mail, MapPin, TreePine } from "lucide-react";
import { BRAND, SERVICES } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap foot-grid">
        <div>
          <div className="brand" style={{ marginBottom: 14 }}>
            <span className="brand-mark"><TreePine size={24} /></span>
            <span><b>{BRAND.name}</b></span>
          </div>
          <p className="muted" style={{ maxWidth: "36ch" }}>Solid wood furniture and custom woodwork — from design to installation, all in one place.</p>
        </div>
        <div>
          <h3>Shop</h3>
          <ul>
            <li><Link href="/shop?cat=Beds">Beds</Link></li>
            <li><Link href="/shop?cat=Sofas">Sofas</Link></li>
            <li><Link href="/shop?cat=Dining">Dining</Link></li>
            <li><Link href="/shop?cat=Storage">Storage</Link></li>
            <li><Link href="/projects">Our projects</Link></li>
          </ul>
        </div>
        <div>
          <h3>Services</h3>
          <ul>
            {SERVICES.slice(0, 4).map((s) => <li key={s.id}><Link href={`/bookings?service=${s.id}`}>{s.name}</Link></li>)}
          </ul>
        </div>
        <div>
          <h3>Contact</h3>
          <ul>
            <li><a href={`tel:${BRAND.phone.replace(/\s/g, "")}`}><Phone size={14} style={{ verticalAlign: -2 }} /> {BRAND.phone}</a></li>
            <li><a href={`mailto:${BRAND.email}`}><Mail size={14} style={{ verticalAlign: -2 }} /> {BRAND.email}</a></li>
            <li><MapPin size={14} style={{ verticalAlign: -2 }} /> {BRAND.address}</li>
          </ul>
        </div>
      </div>
      <div className="wrap copy muted" style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <span>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</span>
        <span><Link href="/login">Customer login</Link> · <Link href="/admin/login">Admin login</Link></span>
      </div>
    </footer>
  );
}
