

"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Trash2,
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Truck,
  Tag,
  CheckCircle2,
  PackageCheck,
  LockKeyhole,
} from "lucide-react";

import { useStore } from "@/context/StoreContext";
import { inr } from "@/lib/data";
import { api } from "@/lib/client";
import { priceOrder } from "@/lib/pricing";
import ProductArt from "@/components/ProductArt";

export default function CartPage() {
  const {
    cart,
    setQty,
    placeOrder,
    rememberOrder,
    address,
    profile,
    setProfile,
    products,
    catalogReady,
  } = useStore();

  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState<{
    code: string;
    percent: number;
  } | null>(null);

  const [msg, setMsg] = useState("");
  const [pay, setPay] = useState("Cash on delivery");
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [addr, setAddr] = useState(address);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const lines = cart
    .map((l) => ({
      ...l,
      p: products.find((p) => p.id === l.id)!,
    }))
    .filter((l) => l.p);

  const subtotal = lines.reduce(
    (sum, l) => sum + l.p.price * l.qty,
    0
  );

  const itemCount = lines.reduce((sum, l) => sum + l.qty, 0);

  const { discount, delivery, total } = priceOrder(
    subtotal,
    coupon?.percent ?? 0
  );

  const apply = async () => {
    if (!code.trim()) {
      setMsg("Please enter a coupon code.");
      return;
    }

    try {
      setMsg("");

      const c = await api<{ code: string; percent: number }>(
        "/api/coupons/validate",
        {
          method: "POST",
          body: JSON.stringify({ code: code.trim() }),
        }
      );

      setCoupon(c);
      setCode(c.code);
      setMsg(`${c.code} applied successfully! ${c.percent}% discount.`);
    } catch (e: any) {
      setCoupon(null);
      setMsg(e.message || "Invalid coupon code.");
    }
  };

  const loadRazorpay = () =>
    new Promise<boolean>((resolve) => {
      if ((window as any).Razorpay) {
        return resolve(true);
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });

  const place = async (e: React.FormEvent) => {
    e.preventDefault();

    if (busy) return;

    setBusy(true);
    setMsg("");

    try {
      setProfile({ ...profile, name, phone });

      if (pay === "Cash on delivery") {
        const o = await placeOrder({
          name,
          phone,
          address: addr,
          payment: pay,
          coupon: coupon?.code,
        });

        setDone(
          `Order ${o.id} has been placed. Our team will call you shortly.`
        );

        return;
      }

      const loaded = await loadRazorpay();

      if (!loaded) {
        throw new Error(
          "Razorpay checkout could not load. Check your internet connection."
        );
      }

      const created = await api<{
        keyId: string;
        orderId: string;
        amount: number;
        currency: string;
        customer: { name: string; contact: string };
      }>("/api/payments/razorpay/create-order", {
        method: "POST",
        body: JSON.stringify({
          name,
          phone,
          address: addr,
          coupon: coupon?.code,
          items: cart,
        }),
      });

      const RazorpayConstructor = (window as any).Razorpay;

      const checkout = new RazorpayConstructor({
        key: created.keyId,
        amount: created.amount,
        currency: created.currency,
        name: "Ronak Wood Craft",
        description: "Furniture order payment",
        order_id: created.orderId,
        prefill: {
          name,
          contact: phone,
        },
        theme: {
          color: "#a45a35",
        },

        handler: async (response: any) => {
          try {
            const order = await api<{ id: string }>(
              "/api/payments/razorpay/verify",
              {
                method: "POST",
                body: JSON.stringify(response),
              }
            );

            rememberOrder(order.id, phone);

            setDone(
              `Payment successful. Your order ${order.id} has been confirmed.`
            );
          } catch (error: any) {
            setMsg(
              error.message ||
                "Payment verification failed. Contact support with your Razorpay payment ID."
            );
          } finally {
            setBusy(false);
          }
        },

        modal: {
          ondismiss: () => setBusy(false),
        },
      });

      checkout.on("payment.failed", (response: any) => {
        setMsg(
          response?.error?.description ||
            "Payment failed. Please try again."
        );

        setBusy(false);
      });

      checkout.open();
    } catch (err: any) {
      setMsg(err.message || "Unable to place order.");
      setBusy(false);
    }
  };

  // Loading screen
  if (!catalogReady) {
    return (
      <div className="wrap page cart-page">
        <div className="cart-loading">
          <div className="loader" />
          <p>Preparing your shopping experience...</p>
        </div>

        <style jsx>{`
          .cart-loading {
            min-height: 55vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
            color: #8b7668;
          }

          .loader {
            width: 38px;
            height: 38px;
            border: 3px solid #eadfd5;
            border-top-color: #a45a35;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  // Order success screen
  if (done) {
    return (
      <div className="wrap page cart-page">
        <div className="success-card">
          <div className="success-icon">
            <CheckCircle2 size={42} />
          </div>

          <span className="success-label">ORDER CONFIRMED</span>

          <h1>Thank you{name ? `, ${name}` : ""}!</h1>

          <p>{done}</p>

          <div className="success-actions">
            <Link href="/account" className="primary-btn">
              View my orders <ArrowRight size={17} />
            </Link>

            <Link href="/shop" className="secondary-btn">
              Continue shopping
            </Link>
          </div>
        </div>

        <style jsx>{`
          .success-card {
            max-width: 620px;
            margin: 70px auto;
            padding: 55px 30px;
            text-align: center;
            background: #fffdf9;
            border: 1px solid #eee3d9;
            border-radius: 24px;
            box-shadow: 0 15px 50px rgba(65, 43, 28, 0.06);
          }

          .success-icon {
            width: 82px;
            height: 82px;
            display: grid;
            place-items: center;
            margin: 0 auto 22px;
            border-radius: 50%;
            color: #43845d;
            background: #e9f5ec;
          }

          .success-label {
            color: #a45a35;
            font-size: 11px;
            letter-spacing: 2px;
            font-weight: 800;
          }

          h1 {
            margin: 13px 0;
            font-family: Georgia, serif;
            font-size: clamp(30px, 5vw, 43px);
            color: #38271d;
          }

          p {
            color: #806e62;
            line-height: 1.8;
          }

          .success-actions {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 12px;
            margin-top: 28px;
          }

          .primary-btn,
          .secondary-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 9px;
            padding: 14px 20px;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 700;
          }

          .primary-btn {
            color: white;
            background: #a45a35;
          }

          .secondary-btn {
            color: #70452e;
            border: 1px solid #e7d8cb;
          }
        `}</style>
      </div>
    );
  }

  // Empty cart screen
  if (!lines.length) {
    return (
      <div className="wrap page cart-page">
        <div className="empty-cart">
          <div className="empty-icon">
            <ShoppingBag size={38} />
          </div>

          <span className="eyebrow">YOUR SHOPPING BAG</span>

          <h1>Your cart is waiting</h1>

          <p>
            Discover beautifully crafted furniture and bring timeless
            elegance to your home.
          </p>

          <Link href="/shop" className="primary-btn">
            Explore collection <ArrowRight size={17} />
          </Link>

          <div className="empty-benefits">
            <span><Truck size={16} /> Reliable delivery</span>
            <span><ShieldCheck size={16} /> Secure checkout</span>
          </div>
        </div>

        <style jsx>{`
          .empty-cart {
            max-width: 600px;
            margin: 55px auto;
            padding: 60px 25px;
            text-align: center;
            background: #fffdf9;
            border: 1px solid #eee4da;
            border-radius: 24px;
          }

          .empty-icon {
            width: 85px;
            height: 85px;
            display: grid;
            place-items: center;
            margin: 0 auto 22px;
            border-radius: 25px;
            color: #a45a35;
            background: #f5e9dd;
          }

          .eyebrow {
            color: #a45a35;
            font-size: 11px;
            letter-spacing: 2px;
            font-weight: 800;
          }

          h1 {
            margin: 12px 0;
            color: #38271d;
            font-family: Georgia, serif;
            font-size: 38px;
          }

          p {
            max-width: 400px;
            margin: 0 auto 25px;
            color: #85766b;
            line-height: 1.8;
          }

          .primary-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 15px 23px;
            border-radius: 12px;
            color: white;
            background: #a45a35;
            text-decoration: none;
            font-weight: 700;
          }

          .empty-benefits {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 22px;
            margin-top: 35px;
            color: #8c796b;
            font-size: 12px;
          }

          .empty-benefits span {
            display: flex;
            align-items: center;
            gap: 7px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="wrap page cart-page">
      <div className="cart-heading">
        <div>
          <span className="eyebrow">YOUR SHOPPING BAG</span>
          <h1>Shopping Cart</h1>
          <p>
            {itemCount} {itemCount === 1 ? "item" : "items"} selected for
            your home
          </p>
        </div>

        <Link href="/shop" className="continue-link">
          <ArrowLeft size={16} /> Continue shopping
        </Link>
      </div>

      <div className="cart-layout">
        {/* LEFT SIDE */}
        <section className="cart-main">
          <div className="section-heading">
            <h2>Your items</h2>
            <span>{itemCount} items</span>
          </div>

          <div className="product-list">
            {lines.map(({ p, qty }) => (
              <article className="product-card" key={p.id}>
                <div className="product-image">
                  <ProductArt p={{ ...p, tag: undefined }} size={26} />
                </div>

                <div className="product-info">
                  <div className="product-top">
                    <div>
                      <span className="product-category">
                        {p.category}
                      </span>
                      <h3>{p.name}</h3>
                    </div>

                    <button
                      className="remove-btn"
                      type="button"
                      onClick={() => setQty(p.id, 0)}
                      aria-label={`Remove ${p.name}`}
                      title="Remove item"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  <div className="product-bottom">
                    <div className="quantity-control">
                      <button
                        type="button"
                        onClick={() => setQty(p.id, qty - 1)}
                        disabled={qty <= 1}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>

                      <span>{qty}</span>

                      <button
                        type="button"
                        onClick={() =>
                          setQty(
                            p.id,
                            Math.min(qty + 1, p.stock || 1)
                          )
                        }
                        disabled={qty >= (p.stock || 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <div className="price-block">
                      <strong>{inr(p.price * qty)}</strong>
                      <span>{inr(p.price)} / item</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Coupon */}
          <div className="coupon-card">
            <div className="coupon-heading">
              <div className="coupon-icon">
                <Tag size={19} />
              </div>

              <div>
                <h3>Have a coupon?</h3>
                <p>Apply your discount at checkout</p>
              </div>
            </div>

            <div className="coupon-input-row">
              <input
                placeholder="Enter coupon code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={!!coupon}
              />

              {coupon ? (
                <button
                  type="button"
                  className="remove-coupon"
                  onClick={() => {
                    setCoupon(null);
                    setCode("");
                    setMsg("");
                  }}
                >
                  Remove
                </button>
              ) : (
                <button
                  type="button"
                  className="apply-btn"
                  onClick={apply}
                >
                  Apply
                </button>
              )}
            </div>

            {msg && (
              <div className={`coupon-message ${coupon ? "success" : ""}`}>
                {coupon && <CheckCircle2 size={15} />}
                {msg}
              </div>
            )}
          </div>

          {/* Delivery details */}
          <form className="checkout-form" onSubmit={place}>
            <div className="section-heading">
              <h2>Delivery details</h2>
              <span>Almost there!</span>
            </div>

            <div className="form-grid">
              <label className="field">
                Full name
                <input
                  required
                  minLength={2}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </label>

              <label className="field">
                Mobile number
                <input
                  required
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98765 43210"
                />
              </label>

              <label className="field full-field">
                Delivery address
                <textarea
                  required
                  minLength={5}
                  rows={3}
                  value={addr}
                  onChange={(e) => setAddr(e.target.value)}
                  placeholder="House number, street, city, state and PIN code"
                />
              </label>
            </div>

            <div className="payment-section">
              <h3>Choose payment method</h3>

              <label
                className={`payment-option ${
                  pay === "Cash on delivery" ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="Cash on delivery"
                  checked={pay === "Cash on delivery"}
                  onChange={(e) => setPay(e.target.value)}
                />

                <div className="payment-icon">₹</div>

                <div className="payment-text">
                  <strong>Cash on delivery</strong>
                  <span>Pay when your order arrives</span>
                </div>

                <span className="radio-circle" />
              </label>

              <label
                className={`payment-option ${
                  pay === "Razorpay" ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="Razorpay"
                  checked={pay === "Razorpay"}
                  onChange={(e) => setPay(e.target.value)}
                />

                <div className="payment-icon online-icon">
                  <LockKeyhole size={19} />
                </div>

                <div className="payment-text">
                  <strong>Pay online securely</strong>
                  <span>UPI, Debit Card, Credit Card & Netbanking</span>
                </div>

                <span className="radio-circle" />
              </label>
            </div>

            {msg && !coupon && (
              <div className="error-message">{msg}</div>
            )}

            <button
              className="mobile-checkout-btn"
              type="submit"
              disabled={busy}
            >
              {busy
                ? "Processing..."
                : pay === "Razorpay"
                  ? "Pay securely"
                  : "Place your order"}
              <ArrowRight size={18} />
            </button>
          </form>
        </section>

        {/* RIGHT SIDE - ORDER SUMMARY */}
        <aside className="summary-card">
          <div className="summary-heading">
            <h2>Order Summary</h2>
            <span>{itemCount} items</span>
          </div>

          <div className="summary-items">
            {lines.map(({ p, qty }) => (
              <div className="summary-item" key={p.id}>
                <span>
                  {p.name} <small>× {qty}</small>
                </span>
                <strong>{inr(p.price * qty)}</strong>
              </div>
            ))}
          </div>

          <div className="summary-divider" />

          <div className="summary-row">
            <span>Subtotal</span>
            <strong>{inr(subtotal)}</strong>
          </div>

          {discount > 0 && (
            <div className="summary-row discount-row">
              <span>Discount</span>
              <strong>− {inr(discount)}</strong>
            </div>
          )}

          <div className="summary-row">
            <span>Delivery charges</span>
            <strong className={delivery === 0 ? "free-text" : ""}>
              {delivery ? inr(delivery) : "FREE"}
            </strong>
          </div>

          <div className="summary-divider" />

          <div className="grand-total">
            <div>
              <strong>Total amount</strong>
              <span>Inclusive of applicable charges</span>
            </div>

            <strong>{inr(total)}</strong>
          </div>

          <button
            className="checkout-btn"
            type="button"
            disabled={busy}
            onClick={() => {
              const form = document.querySelector<HTMLFormElement>(
                ".checkout-form"
              );
              form?.requestSubmit();
            }}
          >
            {busy
              ? "Processing..."
              : pay === "Razorpay"
                ? "Pay securely"
                : "Place your order"}
            <ArrowRight size={18} />
          </button>

          <div className="secure-note">
            <ShieldCheck size={17} />
            <span>Safe and secure checkout</span>
          </div>

          <div className="summary-benefits">
            <div>
              <Truck size={19} />
              <span>Reliable furniture delivery</span>
            </div>

            <div>
              <PackageCheck size={19} />
              <span>Carefully packed orders</span>
            </div>
          </div>

          <p className="summary-footer">
            Thank you for choosing Ronak Wood Craft.
          </p>
        </aside>
      </div>

      <style jsx>{`
        .cart-page {
          padding-top: 30px;
          padding-bottom: 70px;
          color: #39291f;
        }

        .cart-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          margin-bottom: 32px;
          padding-bottom: 25px;
          border-bottom: 1px solid #eee3d9;
        }

        .eyebrow {
          color: #a45a35;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .cart-heading h1 {
          margin: 8px 0 5px;
          font-family: Georgia, serif;
          font-size: clamp(34px, 5vw, 48px);
          font-weight: 500;
          letter-spacing: -1.5px;
        }

        .cart-heading p {
          margin: 0;
          color: #8b7b70;
          font-size: 14px;
        }

        .continue-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #895438;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          padding-bottom: 5px;
        }

        .cart-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.6fr) minmax(290px, 0.8fr);
          gap: 30px;
          align-items: start;
        }

        .cart-main {
          display: grid;
          gap: 22px;
          min-width: 0;
        }

        .section-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .section-heading h2,
        .summary-heading h2 {
          margin: 0;
          font-family: Georgia, serif;
          font-size: 23px;
          font-weight: 500;
        }

        .section-heading > span,
        .summary-heading > span {
          color: #a18c7d;
          font-size: 12px;
        }

        .product-list {
          display: grid;
          gap: 14px;
        }

        .product-card {
          display: flex;
          gap: 19px;
          padding: 17px;
          border: 1px solid #eee4da;
          border-radius: 18px;
          background: #fffdf9;
          transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
        }

        .product-card:hover {
          border-color: #d9b9a2;
          transform: translateY(-2px);
          box-shadow: 0 9px 25px rgba(65, 43, 28, 0.05);
        }

        .product-image {
          width: 132px;
          height: 132px;
          flex: 0 0 132px;
          overflow: hidden;
          border-radius: 13px;
          background: #f4ece3;
        }

        .product-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 15px;
        }

        .product-top,
        .product-bottom {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .product-category {
          color: #a45a35;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1.3px;
        }

        .product-top h3 {
          margin: 6px 0 0;
          font-size: 17px;
          line-height: 1.4;
          font-weight: 700;
          color: #39291f;
        }

        .remove-btn {
          width: 35px;
          height: 35px;
          flex: 0 0 35px;
          display: grid;
          place-items: center;
          border: 1px solid #eee1d7;
          border-radius: 10px;
          background: transparent;
          color: #a17b66;
          cursor: pointer;
          transition: 0.2s;
        }

        .remove-btn:hover {
          background: #fff0ed;
          color: #c44736;
          border-color: #f1c9c1;
        }

        .quantity-control {
          display: flex;
          align-items: center;
          border: 1px solid #e8ddd3;
          border-radius: 10px;
          overflow: hidden;
          height: 36px;
        }

        .quantity-control button {
          width: 34px;
          height: 34px;
          border: 0;
          color: #895438;
          background: #f8f1e9;
          cursor: pointer;
          font-size: 19px;
        }

        .quantity-control button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .quantity-control span {
          min-width: 32px;
          text-align: center;
          font-size: 13px;
          font-weight: 700;
        }

        .price-block {
          display: grid;
          gap: 4px;
          text-align: right;
        }

        .price-block strong {
          color: #513423;
          font-size: 17px;
        }

        .price-block span {
          color: #9a897d;
          font-size: 11px;
        }

        .coupon-card {
          padding: 20px;
          border: 1px solid #eadbcd;
          border-radius: 17px;
          background: #faf4ed;
        }

        .coupon-heading {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 15px;
        }

        .coupon-icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: #f0dfce;
          color: #a45a35;
        }

        .coupon-heading h3 {
          margin: 0 0 4px;
          font-size: 14px;
        }

        .coupon-heading p {
          margin: 0;
          font-size: 12px;
          color: #8d7b6e;
        }

        .coupon-input-row {
          display: flex;
          gap: 9px;
        }

        .coupon-input-row input {
          min-width: 0;
          flex: 1;
          padding: 13px 14px;
          border: 1px solid #e8d8ca;
          border-radius: 10px;
          outline: none;
          background: white;
          color: #39291f;
          font-size: 13px;
        }

        .coupon-input-row input:focus {
          border-color: #a45a35;
        }

        .apply-btn,
        .remove-coupon {
          padding: 0 20px;
          border: 0;
          border-radius: 10px;
          background: #493326;
          color: white;
          font-weight: 700;
          cursor: pointer;
        }

        .remove-coupon {
          background: #f0e3d8;
          color: #895438;
        }

        .coupon-message {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 11px;
          color: #b34d3f;
          font-size: 12px;
        }

        .coupon-message.success {
          color: #3d8255;
        }

        .checkout-form {
          display: grid;
          gap: 20px;
          padding: 24px;
          border: 1px solid #eee4da;
          border-radius: 18px;
          background: #fffdf9;
          scroll-margin-top: 30px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 17px;
        }

        .field {
          display: grid;
          gap: 8px;
          color: #574438;
          font-size: 12px;
          font-weight: 700;
        }

        .field input,
        .field textarea {
          width: 100%;
          box-sizing: border-box;
          padding: 13px 14px;
          border: 1px solid #e9ded4;
          border-radius: 10px;
          background: #fff;
          outline: none;
          color: #39291f;
          font: inherit;
          font-size: 13px;
          font-weight: 400;
          transition: border-color 0.2s;
        }

        .field input:focus,
        .field textarea:focus {
          border-color: #a45a35;
        }

        .field textarea {
          resize: vertical;
          min-height: 85px;
        }

        .full-field {
          grid-column: 1 / -1;
        }

        .payment-section {
          display: grid;
          gap: 12px;
        }

        .payment-section h3 {
          margin: 0 0 3px;
          font-size: 14px;
        }

        .payment-option {
          position: relative;
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 15px;
          border: 1px solid #e9ded4;
          border-radius: 12px;
          cursor: pointer;
          transition: 0.2s;
        }

        .payment-option.selected {
          border-color: #a45a35;
          background: #fbf5ee;
        }

        .payment-option input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .payment-icon {
          width: 39px;
          height: 39px;
          flex: 0 0 39px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: #f0e2d5;
          color: #99532f;
          font-size: 20px;
          font-weight: 800;
        }

        .online-icon {
          font-size: 16px;
        }

        .payment-text {
          display: grid;
          gap: 4px;
          flex: 1;
        }

        .payment-text strong {
          font-size: 13px;
        }

        .payment-text span {
          color: #927f71;
          font-size: 11px;
        }

        .radio-circle {
          width: 17px;
          height: 17px;
          border: 1.5px solid #c6b5a8;
          border-radius: 50%;
          flex: 0 0 17px;
        }

        .payment-option.selected .radio-circle {
          border: 5px solid #a45a35;
          background: white;
        }

        .error-message {
          padding: 12px;
          border-radius: 9px;
          background: #fff0ed;
          color: #b34d3f;
          font-size: 12px;
        }

        .mobile-checkout-btn {
          display: none;
        }

        /* ORDER SUMMARY */

        .summary-card {
          position: sticky;
          top: 25px;
          padding: 24px;
          border: 1px solid #e9d9ca;
          border-radius: 19px;
          background: #faf5ee;
          box-shadow: 0 10px 30px rgba(65, 43, 28, 0.045);
        }

        .summary-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          padding-bottom: 19px;
          border-bottom: 1px solid #e9dcd0;
        }

        .summary-heading h2 {
          font-size: 21px;
        }

        .summary-items {
          display: grid;
          gap: 13px;
          padding: 19px 0;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          color: #78685d;
          font-size: 12px;
        }

        .summary-item span {
          min-width: 0;
          line-height: 1.5;
        }

        .summary-item small {
          color: #a45a35;
          font-weight: 700;
        }

        .summary-item strong {
          flex: none;
          color: #493326;
          font-size: 12px;
        }

        .summary-divider {
          height: 1px;
          background: #e9dcd0;
          margin: 4px 0 17px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 15px;
          color: #78685d;
          font-size: 13px;
        }

        .summary-row strong {
          color: #493326;
          font-weight: 700;
        }

        .discount-row strong,
        .free-text {
          color: #3d8255 !important;
        }

        .grand-total {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 5px 0 20px;
        }

        .grand-total > div {
          display: grid;
          gap: 5px;
        }

        .grand-total > div strong {
          font-size: 15px;
        }

        .grand-total > div span {
          color: #98877a;
          font-size: 10px;
        }

        .grand-total > strong {
          color: #a45a35;
          font-size: 23px;
          font-family: Georgia, serif;
          white-space: nowrap;
        }

        .checkout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 16px;
          border: none;
          border-radius: 11px;
          background: #a45a35;
          color: white;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          transition: 0.2s;
        }

        .checkout-btn:hover {
          background: #844427;
          transform: translateY(-1px);
        }

        .checkout-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .secure-note {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 7px;
          padding: 17px 0;
          color: #63836b;
          font-size: 11px;
        }

        .summary-benefits {
          display: grid;
          gap: 12px;
          padding: 16px 0;
          border-top: 1px solid #e9dcd0;
        }

        .summary-benefits div {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #8b6d59;
          font-size: 11px;
        }

        .summary-footer {
          margin: 5px 0 0;
          padding-top: 15px;
          border-top: 1px solid #e9dcd0;
          text-align: center;
          color: #a18c7d;
          font-family: Georgia, serif;
          font-style: italic;
          font-size: 12px;
        }

        @media (max-width: 900px) {
          .cart-layout {
            grid-template-columns: minmax(0, 1fr);
          }

          .summary-card {
            position: static;
            grid-row: 1;
          }
        }

        @media (max-width: 600px) {
          .checkout-btn {
            display: none;
          }

          .cart-page {
            padding-top: 20px;
          }

          .cart-heading {
            align-items: flex-start;
            flex-direction: column;
            gap: 15px;
            margin-bottom: 22px;
          }

          .cart-heading h1 {
            font-size: 36px;
          }

          .cart-layout {
            gap: 20px;
          }

          .product-card {
            gap: 12px;
            padding: 12px;
          }

          .product-image {
            width: 100px;
            height: 110px;
            flex-basis: 100px;
          }

          .product-top h3 {
            font-size: 14px;
          }

          .price-block strong {
            font-size: 14px;
          }

          .product-bottom {
            align-items: flex-end;
          }

          .coupon-card,
          .checkout-form,
          .summary-card {
            padding: 17px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .full-field {
            grid-column: auto;
          }

          .summary-card {
            grid-row: auto;
          }

          .mobile-checkout-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            width: 100%;
            padding: 15px;
            border: none;
            border-radius: 11px;
            background: #a45a35;
            color: white;
            font-weight: 800;
            cursor: pointer;
          }

          .mobile-checkout-btn:disabled {
            opacity: 0.6;
          }

          .success-card {
            margin: 30px auto;
            padding: 38px 18px;
          }

          .empty-cart {
            margin: 25px auto;
            padding: 40px 18px;
          }

          .empty-cart h1 {
            font-size: 31px;
          }
        }
      `}</style>
    </div>
  );
}