"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { User, ChevronDown, LogIn, UserPlus, ShieldCheck, LogOut, Package, LayoutDashboard, CalendarCheck } from "lucide-react";
import { useStore } from "@/context/StoreContext";

// Navbar "Account" dropdown. Customers and the admin sign in through different pages.
export default function AccountMenu({ compact = false }: { compact?: boolean }) {
  const { user, isAdmin, userLogout, adminLogout, authReady } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const path = usePathname();
  const router = useRouter();

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", down); document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", down); document.removeEventListener("keydown", key); };
  }, [open]);

  const first = user?.name.split(" ")[0];
  const initial = (user?.name || "A").charAt(0).toUpperCase();
  const logoutUser = async () => { setOpen(false); await userLogout(); router.push("/"); };
  const logoutAdmin = async () => { setOpen(false); await adminLogout(); router.push("/"); };

  return (
    <div className="acct" ref={ref}>
      <button className={`acct-btn ${compact ? "icon-only" : ""}`} onClick={() => setOpen(!open)} aria-expanded={open} aria-haspopup="menu" aria-label="Account menu">
        {user && !compact ? <span className="avatar">{initial}</span> : <User size={18} style={compact ? undefined : { marginLeft: 6 }} />}
        {!compact && <span className="lbl">{user ? first : isAdmin ? "Admin" : "Account"}</span>}
        {!compact && <ChevronDown size={15} />}
      </button>

      {open && (
        <div className="acct-menu" role="menu">
          {!authReady ? <div className="head">Loading…</div> : (
            <>
              {user && (
                <>
                  <div className="who"><span className="avatar">{initial}</span><div><b>{user.name}</b><span>{user.email}</span></div></div>
                  <hr />
                  <Link className="mi" href="/account" role="menuitem"><i><User size={17} /></i><div>My account<small>Profile & orders</small></div></Link>
                  <Link className="mi" href="/orders" role="menuitem"><i><Package size={17} /></i><div>My orders<small>Track all your orders</small></div></Link>
                  <Link className="mi" href="/bookings" role="menuitem"><i><CalendarCheck size={17} /></i><div>My bookings<small>Site visits & services</small></div></Link>
                  <button className="mi" onClick={logoutUser} role="menuitem"><i><LogOut size={17} /></i><div>Log out</div></button>
                </>
              )}

              {!user && (
                <>
                  <div className="head">Customer</div>
                  <Link className="mi" href="/login" role="menuitem"><i><LogIn size={17} /></i><div>Log in<small>Track orders & bookings</small></div></Link>
                  <Link className="mi" href="/signup" role="menuitem"><i><UserPlus size={17} /></i><div>Sign up<small>Create a free account</small></div></Link>
                </>
              )}

              <hr />
              <div className="head">Admin</div>
              {isAdmin ? (
                <>
                  <Link className="mi" href="/admin" role="menuitem"><i><LayoutDashboard size={17} /></i><div>Admin panel<small>Manage the store</small></div></Link>
                  <button className="mi" onClick={logoutAdmin} role="menuitem"><i><LogOut size={17} /></i><div>Admin log out</div></button>
                </>
              ) : (
                <Link className="mi" href="/admin/login" role="menuitem"><i><ShieldCheck size={17} /></i><div>Admin login<small>For store owners only</small></div></Link>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
