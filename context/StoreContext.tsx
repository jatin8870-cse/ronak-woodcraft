
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

import type { Product, Project } from "@/lib/data";
import { api } from "@/lib/client";

export type CartLine = {
  id: string;
  qty: number;
};

export type Booking = {
  id: string;
  service: string;
  date: string;
  slot: string;
  address: string;
  phone: string;
  notes: string;
  status: "Confirmed" | "Completed" | "Cancelled";
};

export type OrderLine = {
  name: string;
  qty: number;
  price: number;
};

export type Order = {
  id: string;
  date: string;
  total: number;
  items: number;
  lines: OrderLine[];
  subtotal: number;
  discount: number;
  delivery: number;
  coupon?: string | null;
  payment: string;
  address: string;
  status: "Placed" | "Packed" | "Delivered" | "Cancelled";
};

export type Profile = {
  name: string;
  phone: string;
  email: string;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

export type SignupInput = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

type Ref = {
  id: string;
  phone: string;
};

export type NewOrder = {
  name: string;
  phone: string;
  address: string;
  payment: string;
  coupon?: string;
};

export type NewBooking = {
  service: string;
  date: string;
  slot: string;
  name: string;
  phone: string;
  address: string;
  notes: string;
};

export type ProductInput = Omit<Product, "id">;
export type ProjectInput = Omit<Project, "id">;

export type Advertisement = {
  id: string;
  title: string;
  tag: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  couponCode: string | null;
  discount: number;
  active: boolean;
  sortOrder: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdvertisementInput = Omit<
  Advertisement,
  "id" | "createdAt" | "updatedAt"
>;

type Store = {
  ready: boolean;
  catalogReady: boolean;

  cart: CartLine[];
  addToCart: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clearCart: () => void;
  cartCount: number;

  products: Product[];
  saveProduct: (p: ProductInput, id?: string) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  projects: Project[];
  saveProject: (p: ProjectInput, id?: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  advertisements: Advertisement[];
  saveAdvertisement: (
    a: AdvertisementInput,
    id?: string
  ) => Promise<void>;
  deleteAdvertisement: (id: string) => Promise<void>;

  orders: Order[];
  placeOrder: (d: NewOrder) => Promise<Order>;

  bookings: Booking[];
  createBooking: (d: NewBooking) => Promise<Booking>;
  cancelBooking: (id: string) => Promise<void>;

  address: string;
  setAddress: (a: string) => void;

  profile: Profile;
  setProfile: (p: Profile) => void;

  authReady: boolean;

  user: AuthUser | null;
  userLogin: (
    email: string,
    password: string
  ) => Promise<string | null>;
  signup: (d: SignupInput) => Promise<string | null>;
  userLogout: () => Promise<void>;

  isAdmin: boolean;
  adminLogin: (pw: string) => Promise<string | null>;
  adminLogout: () => Promise<void>;
};

const Ctx = createContext<Store | null>(null);

const KEY = "rwc-store-v3";

const swap = <T extends { id: string }>(
  list: T[],
  item: T
) =>
  list.some((x) => x.id === item.id)
    ? list.map((x) => (x.id === item.id ? item : x))
    : [item, ...list];

export function StoreProvider({
  children,
}: {
  children: ReactNode;
}) {
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

  const [profile, setProfile] = useState<Profile>({
    name: "",
    phone: "",
    email: "",
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  const [authReady, setAuthReady] = useState(false);

  const [advertisements, setAdvertisements] = useState<
    Advertisement[]
  >([]);

  // Load saved browser data
  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(KEY) ?? "null"
      );

      if (saved) {
        setCart(saved.cart ?? []);
        setOrderRefs(saved.orderRefs ?? []);
        setBookingRefs(saved.bookingRefs ?? []);

        if (saved.address) {
          setAddress(saved.address);
        }

        if (saved.profile) {
          setProfile(saved.profile);
        }
      }
    } catch (error) {
      console.error("Local storage loading error:", error);
    } finally {
      setReady(true);
      setAuthReady(true);
    }
  }, []);

  // Save browser data
  useEffect(() => {
    if (!ready) return;

    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({
          cart,
          orderRefs,
          bookingRefs,
          address,
          profile,
        })
      );
    } catch (error) {
      console.error("Local storage saving error:", error);
    }
  }, [
    ready,
    cart,
    orderRefs,
    bookingRefs,
    address,
    profile,
  ]);

  // Load products, projects and advertisements
  useEffect(() => {
    Promise.all([
      api<Product[]>("/api/products"),
      api<Project[]>("/api/projects"),
      api<Advertisement[]>("/api/advertisements"),
    ])
      .then(([productData, projectData, advertisementData]) => {
        setProducts(productData);
        setProjects(projectData);
        setAdvertisements(advertisementData);
      })
      .catch((error) => {
        console.error("Catalog loading error:", error);
      })
      .finally(() => {
        setCatalogReady(true);
      });
  }, []);

  // Sync profile with logged-in user
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name,
        phone: user.phone,
        email: user.email,
      });
    }
  }, [user]);

  // Load customer orders
  useEffect(() => {
    if (!ready) return;

    api<Order[]>("/api/orders/lookup", {
      method: "POST",
      body: JSON.stringify({ refs: orderRefs }),
    })
      .then(setOrders)
      .catch(() => {});
  }, [ready, orderRefs, user?.id]);

  // Load customer bookings
  useEffect(() => {
    if (!ready) return;

    api<Booking[]>("/api/bookings/lookup", {
      method: "POST",
      body: JSON.stringify({ refs: bookingRefs }),
    })
      .then(setBookings)
      .catch(() => {});
  }, [ready, bookingRefs, user?.id]);

  // Cart functions
  const addToCart = useCallback((id: string) => {
    setCart((current) =>
      current.some((item) => item.id === id)
        ? current.map((item) =>
            item.id === id
              ? { ...item, qty: item.qty + 1 }
              : item
          )
        : [...current, { id, qty: 1 }]
    );
  }, []);

  const setQty = useCallback(
    (id: string, qty: number) => {
      setCart((current) =>
        qty <= 0
          ? current.filter((item) => item.id !== id)
          : current.map((item) =>
              item.id === id ? { ...item, qty } : item
            )
      );
    },
    []
  );

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Place order
  const placeOrder = useCallback(
    async (data: NewOrder) => {
      const order = await api<Order>("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          items: cart,
        }),
      });

      setOrderRefs((current) => [
        { id: order.id, phone: data.phone },
        ...current,
      ]);

      setCart([]);

      api<Product[]>("/api/products")
        .then(setProducts)
        .catch(() => {});

      return order;
    },
    [cart]
  );

  // Create booking
  const createBooking = useCallback(
    async (data: NewBooking) => {
      const booking = await api<Booking>("/api/bookings", {
        method: "POST",
        body: JSON.stringify(data),
      });

      setBookingRefs((current) => [
        { id: booking.id, phone: data.phone },
        ...current,
      ]);

      return booking;
    },
    []
  );

  // Cancel booking
  const cancelBooking = useCallback(
    async (id: string) => {
      const ref = bookingRefs.find((item) => item.id === id);

      if (!ref && !user) return;

      await api("/api/bookings/cancel", {
        method: "POST",
        body: JSON.stringify(ref ?? { id }),
      });

      setBookings((current) =>
        current.map((booking) =>
          booking.id === id
            ? { ...booking, status: "Cancelled" }
            : booking
        )
      );
    },
    [bookingRefs, user]
  );

  // Save product
  const saveProduct = useCallback(
    async (product: ProductInput, id?: string) => {
      const saved = await api<Product>(
        id
          ? `/api/admin/products/${id}`
          : "/api/admin/products",
        {
          method: id ? "PUT" : "POST",
          body: JSON.stringify(product),
        }
      );

      setProducts((current) => swap(current, saved));
    },
    []
  );

  // Delete product
  const deleteProduct = useCallback(async (id: string) => {
    await api(`/api/admin/products/${id}`, {
      method: "DELETE",
    });

    setProducts((current) =>
      current.filter((item) => item.id !== id)
    );

    setCart((current) =>
      current.filter((item) => item.id !== id)
    );
  }, []);

  // Save project
  const saveProject = useCallback(
    async (project: ProjectInput, id?: string) => {
      const saved = await api<Project>(
        id
          ? `/api/admin/projects/${id}`
          : "/api/admin/projects",
        {
          method: id ? "PUT" : "POST",
          body: JSON.stringify(project),
        }
      );

      setProjects((current) => swap(current, saved));
    },
    []
  );

  // Delete project
  const deleteProject = useCallback(async (id: string) => {
    await api(`/api/admin/projects/${id}`, {
      method: "DELETE",
    });

    setProjects((current) =>
      current.filter((item) => item.id !== id)
    );
  }, []);

  // Save advertisement
  const saveAdvertisement = useCallback(
    async (advertisement: AdvertisementInput, id?: string) => {
      const saved = await api<Advertisement>(
        id
          ? `/api/admin/advertisements/${id}`
          : "/api/admin/advertisements",
        {
          method: id ? "PUT" : "POST",
          body: JSON.stringify(advertisement),
        }
      );

      setAdvertisements((current) =>
        swap(current, saved)
      );
    },
    []
  );

  // Delete advertisement
  const deleteAdvertisement = useCallback(
    async (id: string) => {
      await api(`/api/admin/advertisements/${id}`, {
        method: "DELETE",
      });

      setAdvertisements((current) =>
        current.filter((item) => item.id !== id)
      );
    },
    []
  );

  // Admin login
  const adminLogin = useCallback(async (password: string) => {
    try {
      await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ password }),
      });

      setIsAdmin(true);
      return null;
    } catch (error) {
      return error instanceof Error
        ? error.message
        : "Admin login failed";
    }
  }, []);

  // Admin logout
  const adminLogout = useCallback(async () => {
    await api("/api/auth/logout", {
      method: "POST",
    }).catch(() => {});

    setIsAdmin(false);
  }, []);

  // Customer login
  const userLogin = useCallback(
    async (email: string, password: string) => {
      try {
        const loggedInUser = await api<AuthUser>(
          "/api/auth/user-login",
          {
            method: "POST",
            body: JSON.stringify({ email, password }),
          }
        );

        setUser(loggedInUser);
        return null;
      } catch (error) {
        return error instanceof Error
          ? error.message
          : "Login failed";
      }
    },
    []
  );

  // Customer signup
  const signup = useCallback(async (data: SignupInput) => {
    try {
      const newUser = await api<AuthUser>(
        "/api/auth/signup",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      setUser(newUser);
      return null;
    } catch (error) {
      return error instanceof Error
        ? error.message
        : "Signup failed";
    }
  }, []);

  // Customer logout
  const userLogout = useCallback(async () => {
    await api("/api/auth/user-logout", {
      method: "POST",
    }).catch(() => {});

    setUser(null);
  }, []);

  const cartCount = cart.reduce(
    (total, item) => total + item.qty,
    0
  );

  return (
    <Ctx.Provider
      value={{
        ready,
        catalogReady,

        cart,
        addToCart,
        setQty,
        clearCart,
        cartCount,

        products,
        saveProduct,
        deleteProduct,

        projects,
        saveProject,
        deleteProject,

        advertisements,
        saveAdvertisement,
        deleteAdvertisement,

        orders,
        placeOrder,

        bookings,
        createBooking,
        cancelBooking,

        address,
        setAddress,

        profile,
        setProfile,

        authReady,
        user,
        userLogin,
        signup,
        userLogout,

        isAdmin,
        adminLogin,
        adminLogout,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useStore = () => {
  const context = useContext(Ctx);

  if (!context) {
    throw new Error(
      "useStore must be inside StoreProvider"
    );
  }

  return context;
};
