"use client";
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import type { Product, Project } from "@/lib/data";
import { api } from "@/lib/client";

export type CartLine = { id: string; qty: number };
export type Booking = { id: string; service: string; date: string; slot: string; address: string; phone: string; notes: string; status: "Confirmed" | "Completed" | "Cancelled" };
export type OrderLine = { name: string; qty: number; price: number };
export type Order = { id: string; date: string; total: number; items: number; lines: OrderLine[]; subtotal: number; discount: number; delivery: number; coupon?: string | null; payment: string; address: string; status: "Placed" | "Packed" | "Delivered" | "Cancelled" };
export type Profile = { name: string; phone: string; email: string };
export type AuthUser = { id: string; name: string; email: string; phone: string };
export type SignupInput = { name: string; email: string; phone: string; password: string };
type Ref = { id: string; phone: string };
export type NewOrder = { name: string; phone: string; address: string; payment: string; coupon?: string };
export type NewBooking = { service: string; date: string; slot: string; name: string; phone: string; address: string; notes: string };
export type ProductInput = Omit<Product, "id">;
export type ProjectInput = Omit<Project, "id">;

type Store = {
  ready: boolean; catalogReady: boolean;
  cart: CartLine[]; addToCart: (id: string) => void; setQty: (id: string, qty: number) => void; clearCart: () => void; cartCount: number;
  products: Product[]; saveProduct: (p: ProductInput, id?: string) => Promise<void>; deleteProduct: (id: string) => Promise<void>;
  projects: Project[]; saveProject: (p: ProjectInput, id?: string) => Promise<void>; deleteProject: (id: string) => Promise<void>;
  orders: Order[]; placeOrder: (d: NewOrder) => Promise<Order>;
  bookings: Booking[]; createBooking: (d: NewBooking) => Promise<Booking>; cancelBooking: (id: string) => Promise<void>;
  address: string; setAddress: (a: string) => void;
  profile: Profile; setProfile: (p: Profile) => void;
  authReady: boolean;
  user: AuthUser | null; userLogin: (email: string, password: string) => Promise<string | null>; signup: (d: SignupInput) => Promise<string | null>; userLogout: () => Promise<void>;
  isAdmin: boolean; adminLogin: (pw: string) => Promise<string | null>; adminLogout: () => Promise<void>;
};

const Ctx = createContext<Store | null>(null);
const KEY = "rwc-store-v3"; // only the cart, address, profile and this browser's order/booking IDs are kept here
const swap = <T extends { id: string }>(l: T[], x: T) => l.some((y) => y.id === x.id) ? l.map((y) => y.id === x.id ? x : y) : [x, ...l];

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [catalogReady, setCatalogReady] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orderRefs, setOrderRefs] = useState<Ref[]>([]);
  const [bookingRefs, setBookingRefs] = useState<Ref[]>([]);
  const [address, setAddress] = useState("Ambala, Haryana");
  const [profile, setProfile] = useState<Profile>({ name: "", phone: "", email: "" });
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // local state load
  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem(KEY) ?? "null");
      if (d) {
        setCart(d.cart ?? []); setOrderRefs(d.orderRefs ?? []); setBookingRefs(d.bookingRefs ?? []);
        if (d.address) setAddress(d.address);
        if (d.profile) setProfile(d.profile);
      }
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify({ cart, orderRefs, bookingRefs, address, profile })); } catch {}
  }, [ready, cart, orderRefs, bookingRefs, address, profile]);

  // catalog + login status from the server
  useEffect(() => {
    Promise.all([api<Product[]>("/api/products"), api<Project[]>("/api/projects")])
      .then(([a, b]) => { setProducts(a); setProjects(b); })
      .catch(() => {})
      .finally(() => setCatalogReady(true));
    api<{ admin: boolean; user: AuthUser | null }>("/api/auth/me")
      .then((r) => { setIsAdmin(r.admin); setUser(r.user); })
      .catch(() => {})
      .finally(() => setAuthReady(true));
  }, []);

  // keep the profile in sync with the logged-in customer
  useEffect(() => { if (user) setProfile({ name: user.name, phone: user.phone, email: user.email }); }, [user]);

  // own orders / bookings
  useEffect(() => { if (ready) api<Order[]>("/api/orders/lookup", { method: "POST", body: JSON.stringify({ refs: orderRefs }) }).then(setOrders).catch(() => {}); }, [ready, orderRefs, user?.id]);
  useEffect(() => { if (ready) api<Booking[]>("/api/bookings/lookup", { method: "POST", body: JSON.stringify({ refs: bookingRefs }) }).then(setBookings).catch(() => {}); }, [ready, bookingRefs, user?.id]);

  const addToCart = useCallback((id: string) => setCart((c) => c.some((l) => l.id === id) ? c.map((l) => l.id === id ? { ...l, qty: l.qty + 1 } : l) : [...c, { id, qty: 1 }]), []);
  const setQty = useCallback((id: string, qty: number) => setCart((c) => qty <= 0 ? c.filter((l) => l.id !== id) : c.map((l) => l.id === id ? { ...l, qty } : l)), []);
  const clearCart = useCallback(() => setCart([]), []);

  const placeOrder = useCallback(async (d: NewOrder) => {
    const o = await api<Order>("/api/orders", { method: "POST", body: JSON.stringify({ ...d, items: cart }) });
    setOrderRefs((r) => [{ id: o.id, phone: d.phone }, ...r]);
    setCart([]);
    api<Product[]>("/api/products").then(setProducts).catch(() => {}); // stock refresh
    return o;
  }, [cart]);

  const createBooking = useCallback(async (d: NewBooking) => {
    const b = await api<Booking>("/api/bookings", { method: "POST", body: JSON.stringify(d) });
    setBookingRefs((r) => [{ id: b.id, phone: d.phone }, ...r]);
    return b;
  }, []);
  const cancelBooking = useCallback(async (id: string) => {
    const ref = bookingRefs.find((r) => r.id === id);
    if (!ref && !user) return;
    await api("/api/bookings/cancel", { method: "POST", body: JSON.stringify(ref ?? { id }) });
    setBookings((l) => l.map((b) => b.id === id ? { ...b, status: "Cancelled" } : b));
  }, [bookingRefs, user]);

  const saveProduct = useCallback(async (p: ProductInput, id?: string) => {
    const saved = await api<Product>(id ? `/api/admin/products/${id}` : "/api/admin/products", { method: id ? "PUT" : "POST", body: JSON.stringify(p) });
    setProducts((l) => swap(l, saved));
  }, []);
  const deleteProduct = useCallback(async (id: string) => {
    await api(`/api/admin/products/${id}`, { method: "DELETE" });
    setProducts((l) => l.filter((x) => x.id !== id)); setCart((c) => c.filter((l) => l.id !== id));
  }, []);
  const saveProject = useCallback(async (p: ProjectInput, id?: string) => {
    const saved = await api<Project>(id ? `/api/admin/projects/${id}` : "/api/admin/projects", { method: id ? "PUT" : "POST", body: JSON.stringify(p) });
    setProjects((l) => swap(l, saved));
  }, []);
  const deleteProject = useCallback(async (id: string) => {
    await api(`/api/admin/projects/${id}`, { method: "DELETE" });
    setProjects((l) => l.filter((x) => x.id !== id));
  }, []);

  // Each returns an error message (or null on success) so the form can show it inline.
  const adminLogin = useCallback(async (password: string) => {
    try { await api("/api/auth/login", { method: "POST", body: JSON.stringify({ password }) }); setIsAdmin(true); return null; }
    catch (e: any) { return e.message as string; }
  }, []);
  const adminLogout = useCallback(async () => { await api("/api/auth/logout", { method: "POST" }).catch(() => {}); setIsAdmin(false); }, []);

  const userLogin = useCallback(async (email: string, password: string) => {
    try { setUser(await api<AuthUser>("/api/auth/user-login", { method: "POST", body: JSON.stringify({ email, password }) })); return null; }
    catch (e: any) { return e.message as string; }
  }, []);
  const signup = useCallback(async (d: SignupInput) => {
    try { setUser(await api<AuthUser>("/api/auth/signup", { method: "POST", body: JSON.stringify(d) })); return null; }
    catch (e: any) { return e.message as string; }
  }, []);
  const userLogout = useCallback(async () => { await api("/api/auth/user-logout", { method: "POST" }).catch(() => {}); setUser(null); }, []);

  const cartCount = cart.reduce((s, l) => s + l.qty, 0);
  return (
    <Ctx.Provider value={{ ready, catalogReady, cart, addToCart, setQty, clearCart, cartCount, products, saveProduct, deleteProduct, projects, saveProject, deleteProject,
      orders, placeOrder, bookings, createBooking, cancelBooking, address, setAddress, profile, setProfile, authReady, user, userLogin, signup, userLogout, isAdmin, adminLogin, adminLogout }}>
      {children}
    </Ctx.Provider>
  );
}

export const useStore = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore must be inside StoreProvider");
  return c;
};
