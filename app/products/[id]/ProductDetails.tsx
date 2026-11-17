"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, ChevronLeft, ChevronRight, ShoppingBag, UploadCloud } from "lucide-react";
import { api } from "@/lib/client";
import { inr, type Product } from "@/lib/data";
import { useStore } from "@/context/StoreContext";

type Review = { id: string; rating: number; title: string; comment: string; images: string[]; videos: string[]; createdAt: string; user: { name: string } };
type Summary = { average: number; counts: Record<number, number>; total: number };
type ReviewResponse = { items: Review[]; total: number; summary: Summary; canReview: boolean; alreadyReviewed: boolean; user: { name: string } | null };

function StarRating({ value, size = 22 }: { value: number; size?: number }) {
  return (
    <span className="rv-stars" aria-label={`${value.toFixed(1)} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span className="rv-star" key={i} style={{ width: size, height: size }}>
            <span className="rv-star-bg"><Star size={size} fill="currentColor" strokeWidth={0} /></span>
            <span className="rv-star-fg" style={{ width: `${fill * 100}%` }}>
              <Star size={size} fill="currentColor" strokeWidth={0} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

export default function ProductDetails({ id }: { id: string }) {
  const [product, setProduct] = useState<Product & { videos?: string[] } | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [canReview, setCanReview] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [userName, setUserName] = useState("");
  const [active, setActive] = useState(0);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [media, setMedia] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [summary, setSummary] = useState<Summary>({ average: 0, counts: {}, total: 0 });
  const [showForm, setShowForm] = useState(false);
  const { addToCart, user, authReady } = useStore();
  const router = useRouter();

  const loadReviews = async (nextOffset = 0) => {
    const data = await api<ReviewResponse>(`/api/products/${id}/reviews?limit=8&offset=${nextOffset}`);
    setReviews(data.items); setTotal(data.total); setSummary(data.summary); setCanReview(data.canReview);
    setAlreadyReviewed(data.alreadyReviewed); setUserName(data.user?.name ?? ""); setOffset(nextOffset);
  };

  useEffect(() => {
    let live = true;
    api<Product & { videos?: string[] }>(`/api/products/${id}/details`)
      .then((p) => { if (live) setProduct(p); })
      .catch((e) => { if (live) setMessage(e.message); });
    loadReviews().catch(() => {});
    return () => { live = false; };
  }, [id]);

  if (!product) return <div className="wrap page">{message || "Loading product…"}</div>;

  const gallery = [...(product.images ?? []), ...(product.videos ?? [])];
  const selected = gallery[active];
  const isVideo = selected && (product.videos ?? []).includes(selected);

  const uploadFile = async (file: File) => {
    if (file.size > 20 * 1024 * 1024) throw new Error("Each review media file must be under 20 MB.");
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error("Could not read file")); reader.readAsDataURL(file);
    });
    const resourceType = file.type.startsWith("video/") ? "video" : "image";
    const result = await api<{url:string}>("/api/reviews/upload", { method:"POST", body:JSON.stringify({dataUrl, resourceType}) });
    return { url: result.url, resourceType };
  };

  const submitReview = async () => {
    setBusy(true); setMessage("");
    try {
      const uploaded = await Promise.all(media.map(uploadFile));
      await api(`/api/products/${id}/reviews`, { method:"POST", body:JSON.stringify({
        rating, title, comment, images: uploaded.filter(x => x.resourceType === "image").map(x => x.url),
        videos: uploaded.filter(x => x.resourceType === "video").map(x => x.url)
      })});
      setMessage("Review submitted. It will appear after admin approval.");
      setTitle(""); setComment(""); setMedia([]); setShowForm(false);
      await loadReviews();
    } catch (e) { setMessage(e instanceof Error ? e.message : "Review could not be submitted."); }
    finally { setBusy(false); }
  };

  const openForm = () => {
    setMessage("");
    if (!authReady) return;
    if (!user) { router.push(`/login?next=${encodeURIComponent(`/products/${id}#reviews`)}`); return; }
    if (alreadyReviewed) { setMessage("You have already reviewed this product."); return; }
    if (!canReview) { setMessage("Only customers who purchased this product can review it."); return; }
    setShowForm(true);
    window.setTimeout(() => document.getElementById("rv-form")?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  };

  const addCart = () => {
    if (!authReady) return;
    if (!user) { router.push(`/login?next=${encodeURIComponent(`/products/${id}`)}`); return; }
    addToCart(product.id);
  };

  return <div className="wrap page product-detail">
    <Link href="/shop" className="muted">← Back to shop</Link>
    <div className="pd-main">
      <section className="pd-gallery">
        <div className="pd-stage">
          {selected ? isVideo ? <video key={selected} src={selected} controls preload="metadata" /> : <img src={selected} alt={product.name} fetchPriority="high" /> :
            <div className="pd-placeholder">No product photos yet</div>}
          {gallery.length > 1 && <>
            <button className="pd-arrow left" onClick={() => setActive((active - 1 + gallery.length) % gallery.length)} aria-label="Previous"><ChevronLeft /></button>
            <button className="pd-arrow right" onClick={() => setActive((active + 1) % gallery.length)} aria-label="Next"><ChevronRight /></button>
          </>}
        </div>
        <div className="pd-thumbs">{gallery.map((src,i) => <button key={src} className={active===i?"on":""} onClick={()=>setActive(i)}>{(product.videos??[]).includes(src) ? "▶ Video" : <img src={src} alt={`${product.name} ${i+1}`} loading="lazy"/>}</button>)}</div>
      </section>
      <section className="pd-info">
        {product.tag && <span className="tag">{product.tag}</span>}
        <h1>{product.name}</h1><p className="rating"><Star fill="currentColor" size={16}/>{product.rating.toFixed(1)} / 5</p>
        <p className="price"><b>{inr(product.price)}</b> <s>{inr(product.mrp)}</s></p>
        <p>{product.desc}</p><p><b>Category:</b> {product.category}</p>
        <p>
  <b>Availability:</b>{" "}
  {(product.stock ?? 0) > 0
    ? `${product.stock} in stock`
    : "Out of stock"}
</p>
        <button className="btn block" disabled={!product.stock || !authReady} onClick={addCart}><ShoppingBag size={17}/> Add to cart</button>
      </section>
    </div>

    <section className="pd-reviews" id="reviews">
      <h2>Ratings &amp; Reviews</h2>
      <div className="rv-layout">
        <aside className="rv-summary">
          <div className="rv-top">
            <div>
              <div className="rv-score">
                <span>{total ? summary.average.toFixed(1) : "–"}</span>
                <StarRating value={summary.average} />
              </div>
              <p className="rv-based">{total ? `Based on ${total} Verified Review${total > 1 ? "s" : ""}` : "No reviews yet"}</p>
            </div>
            <button type="button" className="rv-btn rv-btn-sm" onClick={openForm}>Rate</button>
          </div>

          <div className="rv-bars">
            {[5, 4, 3, 2, 1].map((n) => {
              const c = summary.counts[n] ?? 0;
              return (
                <div className="rv-row" key={n}>
                  <span className="rv-n">{n}</span>
                  <Star size={18} fill="currentColor" strokeWidth={0} className="rv-row-star" />
                  <div className="rv-track"><div className="rv-fill" style={{ width: total ? `${(c / total) * 100}%` : "0%" }} /></div>
                  <span className="rv-count">({c})</span>
                </div>
              );
            })}
          </div>

          <button type="button" className="rv-btn rv-btn-block" onClick={openForm}>Write A Review</button>
        </aside>

        <div className="rv-content">
          {showForm && canReview && !alreadyReviewed && <div className="pd-review-form" id="rv-form">
            <h3>Write a review{userName ? `, ${userName}` : ""}</h3>
            <label>Rating <select value={rating} onChange={e=>setRating(Number(e.target.value))}>{[5,4,3,2,1].map(n=><option key={n} value={n}>{n} stars</option>)}</select></label>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Review title (optional)" maxLength={100}/>
            <textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="Share your experience" maxLength={1500} rows={4}/>
            <label className="pd-upload"><UploadCloud size={18}/> Add photos/videos (max 4, 20 MB each)<input type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime" multiple onChange={e=>setMedia(Array.from(e.target.files??[]).slice(0,4))}/></label>
            {media.length>0 && <p className="muted">{media.map(f=>f.name).join(", ")}</p>}
            <div className="row">
              <button className="btn" disabled={busy || !comment.trim()} onClick={submitReview}>{busy?"Uploading…":"Submit review"}</button>
              <button className="btn ghost" type="button" onClick={()=>setShowForm(false)}>Cancel</button>
            </div>
          </div>}
          {message && <p className="muted">{message}</p>}
          <div className="pd-review-list">{reviews.map(r=><article key={r.id} className="pd-review">
            <div><b>{r.user.name}</b> · <span className="rv-inline-stars">{"★".repeat(r.rating)}</span><span className="muted"> · {new Date(r.createdAt).toLocaleDateString()}</span></div>
            {r.title && <b>{r.title}</b>}<p>{r.comment}</p>
            <div className="pd-review-media">{r.images.map(src=><img key={src} src={src} loading="lazy" alt="Customer review"/>)}{r.videos.map(src=><video key={src} src={src} controls preload="none"/>)}</div>
          </article>)}</div>
          {total > 8 && <div className="row"><button className="pill" disabled={!offset} onClick={()=>loadReviews(Math.max(0,offset-8))}>Previous</button><button className="pill" disabled={offset+8>=total} onClick={()=>loadReviews(offset+8)}>More reviews</button></div>}
        </div>
      </div>
    </section>
  </div>;
}