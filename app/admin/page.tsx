"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import ProductManager from "@/components/admin/ProductManager";
import ProjectManager from "@/components/admin/ProjectManager";
import OrdersBookings from "@/components/admin/OrdersBookings";

const TABS = ["Products", "Projects", "Orders & Bookings"] as const;

export default function Admin() {
  const { isAdmin, authReady, adminLogout } = useStore();
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Products");

  // Not an admin? Send them to the separate admin login page.
  useEffect(() => { if (authReady && !isAdmin) router.replace("/admin/login"); }, [authReady, isAdmin, router]);

  if (!authReady || !isAdmin) return <div className="wrap page">Loading…</div>;

  return (
    <div className="wrap page">
      <div className="sec-head"><h1>Admin panel</h1><button className="btn ghost sm" onClick={async () => { await adminLogout(); router.push("/admin/login"); }}><LogOut size={16} /> Log out</button></div>
      <div className="filters">{TABS.map((t) => <button key={t} className={`pill ${tab === t ? "on" : ""}`} onClick={() => setTab(t)}>{t}</button>)}</div>
      {tab === "Products" && <ProductManager />}
      {tab === "Projects" && <ProjectManager />}
      {tab === "Orders & Bookings" && <OrdersBookings />}
    </div>
  );
}
