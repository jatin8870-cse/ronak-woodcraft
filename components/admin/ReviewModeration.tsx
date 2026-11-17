"use client";
import { useEffect,useState } from "react";
import { api } from "@/lib/client";
type Review={id:string;rating:number;title:string;comment:string;images:string[];videos:string[];user:{name:string;email:string};product:{name:string};createdAt:string};
export default function ReviewModeration(){
 const [items,setItems]=useState<Review[]>([]); const [busy,setBusy]=useState("");
 const load=()=>api<Review[]>("/api/admin/reviews").then(setItems).catch(()=>{});
 useEffect(()=>{load()},[]);
 const act=async(id:string,approved:boolean)=>{setBusy(id);try{await api(`/api/admin/reviews/${id}`,{method:"PATCH",body:JSON.stringify({approved})});await load()}finally{setBusy("")}};
 return <section className="reviews-admin"><h2>Pending customer reviews ({items.length})</h2>{items.length===0?<p className="muted">No pending reviews.</p>:items.map(r=><article className="review" key={r.id}><b>{r.product.name} · {r.user.name}</b><p>{r.user.email} · {"★".repeat(r.rating)}</p>{r.title&&<h3>{r.title}</h3>}<p>{r.comment}</p><div className="pd-review-media">{r.images.map(x=><img key={x} src={x} alt="Review upload"/>)}{r.videos.map(x=><video key={x} src={x} controls preload="metadata"/>)}</div><div className="row"><button className="btn sm" disabled={busy===r.id} onClick={()=>act(r.id,true)}>Approve</button><button className="btn ghost sm" disabled={busy===r.id} onClick={()=>act(r.id,false)}>Reject</button></div></article>)}</section>
}
