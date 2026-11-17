
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  CalendarDays,
} from "lucide-react";

import { SERVICES, inr } from "@/lib/data";
import { api } from "@/lib/client";

const PAGE_SIZE = 20;

type AOrder = {
  id: string;
  code: string;
  name: string;
  phone: string;
  address: string;
  payment: string;
  status: string;
  total: number;
  coupon?: string | null;
  createdAt: string;
  items: {
    id: string;
    name: string;
    qty: number;
  }[];
};

type ABooking = {
  id: string;
  code: string;
  service: string;
  date: string;
  slot: string;
  name: string;
  phone: string;
  address: string;
  notes: string;
  status: string;
};

type PageResponse<T> = {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
};

type ApiResponse<T> = PageResponse<T> | T[];

type PageState<T> = {
  items: T[];
  loading: boolean;
  error: string;
  hasMore: boolean;
  nextCursor: string | null;
  localItems: T[] | null;
};

type Searchable = {
  id: string;
  name: string;
  phone: string;
  status: string;
};

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Pending: "#dc2626",
    Placed: "#dc2626",
    Cancelled: "#dc2626",

    Confirmed: "#2563eb",

    Packed: "#7c3aed",
    Shipped: "#2563eb",

    Delivered: "#16a34a",
    Completed: "#16a34a",
  };

  const color = colors[status] ?? "#6b7280";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "5px 11px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 700,
        color,
        background: `${color}15`,
        border: `1px solid ${color}35`,
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}

function useServerPage<T extends Searchable>(
  endpoint: string,
  search: string,
  status: string
) {
  const [state, setState] = useState<PageState<T>>({
    items: [],
    loading: true,
    error: "",
    hasMore: false,
    nextCursor: null,
    localItems: null,
  });

  const [cursorStack, setCursorStack] = useState<(string | null)[]>([null]);
  const [pageIndex, setPageIndex] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const requestId = useRef(0);
  const cursor = cursorStack[cursorStack.length - 1];

  const refresh = useCallback(() => {
    setRefreshKey((value) => value + 1);
  }, []);

  // Reset pagination when search or status changes.
  useEffect(() => {
    setCursorStack([null]);
    setPageIndex(0);
  }, [search, status]);

  useEffect(() => {
    const currentRequest = ++requestId.current;
    let active = true;

    async function load() {
      setState((previous) => ({
        ...previous,
        loading: true,
        error: "",
      }));

      try {
        const params = new URLSearchParams({
          limit: String(PAGE_SIZE),
        });

        if (search) params.set("q", search);
        if (status !== "All") params.set("status", status);
        if (cursor) params.set("cursor", cursor);

        const response = await api<ApiResponse<T>>(
          `${endpoint}?${params.toString()}`
        );

        if (!active || currentRequest !== requestId.current) return;

        // Backward compatibility: old API returns a plain array.
        if (Array.isArray(response)) {
          setState({
            items: [],
            loading: false,
            error: "",
            hasMore: false,
            nextCursor: null,
            localItems: response,
          });
        } else {
          setState({
            items: response.items ?? [],
            loading: false,
            error: "",
            hasMore: response.hasMore ?? false,
            nextCursor: response.nextCursor ?? null,
            localItems: null,
          });
        }
      } catch (error) {
        if (!active || currentRequest !== requestId.current) return;

        setState((previous) => ({
          ...previous,
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Something went wrong",
        }));
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [endpoint, search, status, cursor, refreshKey]);

  const filteredLocalItems = useMemo(() => {
    if (!state.localItems) return [];

    return state.localItems.filter((item) => {
      const matchesSearch =
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.phone.includes(search) ||
        item.id.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        status === "All" || item.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [state.localItems, search, status]);

  const isLocal = state.localItems !== null;

  const visibleItems = isLocal
    ? filteredLocalItems.slice(
        pageIndex * PAGE_SIZE,
        (pageIndex + 1) * PAGE_SIZE
      )
    : state.items;

  const canGoNext = isLocal
    ? (pageIndex + 1) * PAGE_SIZE < filteredLocalItems.length
    : state.hasMore;

  const canGoPrevious = pageIndex > 0;

  const nextPage = () => {
    if (isLocal) {
      if (canGoNext) setPageIndex((value) => value + 1);
      return;
    }

    if (state.nextCursor) {
      setCursorStack((previous) => [
        ...previous,
        state.nextCursor,
      ]);
      setPageIndex((value) => value + 1);
    }
  };

  const previousPage = () => {
    if (!canGoPrevious) return;

    if (isLocal) {
      setPageIndex((value) => value - 1);
      return;
    }

    setCursorStack((previous) => previous.slice(0, -1));
    setPageIndex((value) => value - 1);
  };

  return {
    items: visibleItems,
    loading: state.loading,
    error: state.error,
    pageIndex,
    canGoNext,
    canGoPrevious,
    nextPage,
    previousPage,
    refresh,
  };
}

function formatDate(date: string) {
  if (!date) return "-";

  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}


function SearchFilter({
  search,
  setSearch,
  status,
  setStatus,
  statuses,
}: {
  search: string;
  setSearch: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  statuses: string[];
}) {
  return (
    <div className="ob-filters">
      <div className="ob-search">
        <Search className="ob-search-icon" size={19} />

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, phone or order ID..."
          aria-label="Search records"
        />

        {search && (
          <button
            type="button"
            className="ob-search-clear"
            onClick={() => setSearch("")}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      <select
        value={status}
        onChange={(event) => setStatus(event.target.value)}
        className="ob-select"
        aria-label="Filter by status"
      >
        <option value="All">All Status</option>
        {statuses.map((item) => (
          <option value={item} key={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
}


function Pagination({
  pageIndex,
  canGoNext,
  canGoPrevious,
  nextPage,
  previousPage,
}: {
  pageIndex: number;
  canGoNext: boolean;
  canGoPrevious: boolean;
  nextPage: () => void;
  previousPage: () => void;
}) {
  return (
    <div className="ob-pagination">
      <span>Page {pageIndex + 1}</span>

      <div>
        <button
          type="button"
          onClick={previousPage}
          disabled={!canGoPrevious}
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        <button
          type="button"
          onClick={nextPage}
          disabled={!canGoNext}
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default function OrdersBookings() {
  const [orderSearchInput, setOrderSearchInput] = useState("");
  const [bookingSearchInput, setBookingSearchInput] = useState("");

  const [orderSearch, setOrderSearch] = useState("");
  const [bookingSearch, setBookingSearch] = useState("");

  const [orderStatus, setOrderStatus] = useState("All");
  const [bookingStatus, setBookingStatus] = useState("All");

  const [updating, setUpdating] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  // Debounce search input.
  useEffect(() => {
    const timer = setTimeout(() => {
      setOrderSearch(orderSearchInput.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [orderSearchInput]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setBookingSearch(bookingSearchInput.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [bookingSearchInput]);

  const orders = useServerPage<AOrder>(
    "/api/admin/orders",
    orderSearch,
    orderStatus
  );

  const bookings = useServerPage<ABooking>(
    "/api/admin/bookings",
    bookingSearch,
    bookingStatus
  );

  const svc = (id: string) =>
    SERVICES.find((service) => service.id === id)?.name ?? id;

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      setUpdating(id);
      setMessage("");

      await api(`/api/admin/orders/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      setMessage("Order status updated successfully.");
      orders.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not update order status"
      );
    } finally {
      setUpdating(null);
    }
  };

  const updateBookingStatus = async (
    id: string,
    status: string
  ) => {
    try {
      setUpdating(id);
      setMessage("");

      await api(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      setMessage("Booking status updated successfully.");
      bookings.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not update booking status"
      );
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="ob-wrap">
      {message && (
        <div className="ob-message">
          {message}
          <button type="button" onClick={() => setMessage("")}>
            ×
          </button>
        </div>
      )}

      {/* ORDERS */}
      <section className="ob-section">
        <div className="ob-heading">
          <div>
            <h2>
              <ShoppingBag size={20} />
              Orders
            </h2>
            <p>Manage customer orders and their status.</p>
          </div>

          <button
            type="button"
            className="ob-refresh"
            onClick={orders.refresh}
            disabled={orders.loading}
          >
            <RefreshCw
              size={16}
              className={orders.loading ? "ob-spin" : ""}
            />
            Refresh
          </button>
        </div>

        <SearchFilter
          search={orderSearchInput}
          setSearch={setOrderSearchInput}
          status={orderStatus}
          setStatus={setOrderStatus}
          statuses={["Placed", "Pending", "Packed", "Shipped", "Delivered", "Cancelled"]}
        />

        {orders.error && (
          <div className="ob-error">{orders.error}</div>
        )}

        {orders.loading ? (
          <div className="ob-empty">Loading orders...</div>
        ) : orders.items.length === 0 ? (
          <div className="ob-empty">No orders found.</div>
        ) : (
          <div className="ob-list">
            {orders.items.map((order) => (
              <article className="ob-card" key={order.id}>
                <div className="ob-card-top">
                  <div>
                    <strong>{order.code}</strong>
                    <span>{formatDate(order.createdAt)}</span>
                  </div>

                  <StatusBadge status={order.status} />
                </div>

                <div className="ob-info-grid">
                  <div>
                    <small>Customer</small>
                    <strong>{order.name}</strong>
                  </div>

                  <div>
                    <small>Phone</small>
                    <strong>{order.phone}</strong>
                  </div>

                  <div>
                    <small>Payment</small>
                    <strong>{order.payment}</strong>
                  </div>

                  <div>
                    <small>Total</small>
                    <strong>{inr(order.total)}</strong>
                  </div>
                </div>

                <div className="ob-address">
                  <small>Delivery Address</small>
                  <p>{order.address || "-"}</p>
                </div>

                <div className="ob-items">
                  <small>Order Items</small>
                  {order.items?.map((item) => (
                    <span key={item.id}>
                      {item.name} × {item.qty}
                    </span>
                  ))}
                </div>

                {order.coupon && (
                  <div className="ob-coupon">
                    Coupon: {order.coupon}
                  </div>
                )}

                <div className="ob-status-control">
                  <StatusBadge status={order.status} />

                  <select
                    value={order.status}
                    disabled={updating === order.id}
                    onChange={(event) =>
                      updateOrderStatus(order.id, event.target.value)
                    }
                  >
                    {["Placed", "Packed", "Shipped", "Delivered", "Cancelled"].map(
                      (status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      )
                    )}
                  </select>

                  {updating === order.id && (
                    <small>Updating...</small>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        <Pagination
          pageIndex={orders.pageIndex}
          canGoNext={orders.canGoNext}
          canGoPrevious={orders.canGoPrevious}
          nextPage={orders.nextPage}
          previousPage={orders.previousPage}
        />
      </section>

      {/* BOOKINGS */}
      <section className="ob-section">
        <div className="ob-heading">
          <div>
            <h2>
              <CalendarDays size={20} />
              Bookings
            </h2>
            <p>Manage customer service bookings.</p>
          </div>

          <button
            type="button"
            className="ob-refresh"
            onClick={bookings.refresh}
            disabled={bookings.loading}
          >
            <RefreshCw
              size={16}
              className={bookings.loading ? "ob-spin" : ""}
            />
            Refresh
          </button>
        </div>

        <SearchFilter
          search={bookingSearchInput}
          setSearch={setBookingSearchInput}
          status={bookingStatus}
          setStatus={setBookingStatus}
          statuses={["Pending", "Confirmed", "Completed", "Cancelled"]}
        />

        {bookings.error && (
          <div className="ob-error">{bookings.error}</div>
        )}

        {bookings.loading ? (
          <div className="ob-empty">Loading bookings...</div>
        ) : bookings.items.length === 0 ? (
          <div className="ob-empty">No bookings found.</div>
        ) : (
          <div className="ob-list">
            {bookings.items.map((booking) => (
              <article className="ob-card" key={booking.id}>
                <div className="ob-card-top">
                  <div>
                    <strong>{booking.code}</strong>
                    <span>
                      {booking.date} · {booking.slot}
                    </span>
                  </div>

                  <StatusBadge status={booking.status} />
                </div>

                <div className="ob-info-grid">
                  <div>
                    <small>Customer</small>
                    <strong>{booking.name}</strong>
                  </div>

                  <div>
                    <small>Phone</small>
                    <strong>{booking.phone}</strong>
                  </div>

                  <div>
                    <small>Service</small>
                    <strong>{svc(booking.service)}</strong>
                  </div>
                </div>

                <div className="ob-address">
                  <small>Address</small>
                  <p>{booking.address || "-"}</p>
                </div>

                {booking.notes && (
                  <div className="ob-address">
                    <small>Notes</small>
                    <p>{booking.notes}</p>
                  </div>
                )}

                <div className="ob-status-control">
                  <StatusBadge status={booking.status} />

                  <select
                    value={booking.status}
                    disabled={updating === booking.id}
                    onChange={(event) =>
                      updateBookingStatus(
                        booking.id,
                        event.target.value
                      )
                    }
                  >
                    {["Pending", "Confirmed", "Completed", "Cancelled"].map(
                      (status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      )
                    )}
                  </select>

                  {updating === booking.id && (
                    <small>Updating...</small>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        <Pagination
          pageIndex={bookings.pageIndex}
          canGoNext={bookings.canGoNext}
          canGoPrevious={bookings.canGoPrevious}
          nextPage={bookings.nextPage}
          previousPage={bookings.previousPage}
        />
      </section>

      <style jsx>{`
        .ob-wrap {
          display: flex;
          flex-direction: column;
          gap: 28px;
          min-width: 0;
        }

        .ob-section {
          min-width: 0;
          background: var(--surface, #fff);
          border: 1px solid var(--line, #e5e7eb);
          border-radius: 14px;
          padding: 20px;
        }

        .ob-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 18px;
        }

        .ob-heading h2 {
          display: flex;
          align-items: center;
          gap: 9px;
          margin: 0;
          font-size: 19px;
          color: var(--ink, #2a1a0f);
        }

        .ob-heading p {
          margin: 5px 0 0;
          color: var(--muted, #7b6858);
          font-size: 13px;
        }

        .ob-refresh {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          border: 1px solid var(--line, #e5e7eb);
          background: var(--surface, white);
          color: var(--ink, #333);
          border-radius: 8px;
          padding: 9px 12px;
          cursor: pointer;
        }

        .ob-refresh:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .ob-filters {
          display: flex;
          gap: 10px;
          margin-bottom: 16px;
        }

        .ob-search {
          display: flex;
          align-items: center;
          gap: 9px;
          flex: 1;
          min-width: 0;
          padding: 0 12px;
          height: 42px;
          border: 1px solid var(--line, #e5e7eb);
          border-radius: 9px;
          color: var(--muted, #777);
        }

        .ob-search input {
          width: 100%;
          min-width: 0;
          border: 0;
          outline: 0;
          background: transparent;
          color: var(--ink, #222);
          font: inherit;
        }

        .ob-select,
        .ob-status-control select {
          min-height: 40px;
          border: 1px solid var(--line, #e5e7eb);
          border-radius: 8px;
          padding: 0 10px;
          background: var(--surface, white);
          color: var(--ink, #333);
          font: inherit;
          max-width: 100%;
        }

        .ob-list {
          display: grid;
          gap: 12px;
        }

        .ob-card {
          min-width: 0;
          padding: 16px;
          border: 1px solid var(--line, #e5e7eb);
          border-radius: 11px;
          background: var(--surface, white);
        }

        .ob-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 16px;
        }

        .ob-card-top > div {
          display: flex;
          flex-direction: column;
          gap: 5px;
          min-width: 0;
        }

        .ob-card-top strong {
          overflow-wrap: anywhere;
          color: var(--ink, #222);
        }

        .ob-card-top span {
          font-size: 12px;
          color: var(--muted, #777);
        }

        .ob-info-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .ob-info-grid > div {
          display: flex;
          flex-direction: column;
          gap: 5px;
          min-width: 0;
        }

        .ob-info-grid small,
        .ob-address small,
        .ob-items small {
          color: var(--muted, #777);
          font-size: 11px;
        }

        .ob-info-grid strong {
          font-size: 13px;
          color: var(--ink, #222);
          overflow-wrap: anywhere;
        }

        .ob-address,
        .ob-items {
          margin-top: 14px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .ob-address p {
          margin: 0;
          font-size: 13px;
          color: var(--ink, #333);
          overflow-wrap: anywhere;
        }

        .ob-items > span {
          font-size: 13px;
          color: var(--ink, #333);
        }

        .ob-coupon {
          margin-top: 10px;
          font-size: 12px;
          color: var(--muted, #777);
        }

        .ob-status-control {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 16px;
          padding-top: 13px;
          border-top: 1px solid var(--line, #eee);
        }

        .ob-status-control small {
          color: var(--muted, #777);
        }

        .ob-empty {
          padding: 30px 12px;
          text-align: center;
          color: var(--muted, #777);
          font-size: 14px;
        }

        .ob-error {
          padding: 12px;
          margin-bottom: 12px;
          border-radius: 8px;
          color: #b91c1c;
          background: #fee2e2;
          font-size: 13px;
        }

        .ob-message {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          padding: 11px 14px;
          border-radius: 9px;
          background: #ecfdf5;
          color: #166534;
          font-size: 13px;
        }

        .ob-message button {
          border: 0;
          background: transparent;
          color: inherit;
          font-size: 20px;
          cursor: pointer;
        }

        .ob-pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-top: 18px;
          color: var(--muted, #777);
          font-size: 13px;
        }

        .ob-pagination > div {
          display: flex;
          gap: 8px;
        }

        .ob-pagination button {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 8px 11px;
          border: 1px solid var(--line, #e5e7eb);
          border-radius: 8px;
          background: var(--surface, white);
          color: var(--ink, #333);
          cursor: pointer;
        }

        .ob-pagination button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .ob-spin {
          animation: ob-spin 1s linear infinite;
        }

        @keyframes ob-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 650px) {
          .ob-section {
            padding: 13px;
          }

          .ob-filters {
            flex-direction: column;
          }

          .ob-info-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .ob-card {
            padding: 12px;
          }

          .ob-heading h2 {
            font-size: 17px;
          }

          .ob-pagination button {
            padding: 8px;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
}

