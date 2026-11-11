import { Suspense } from "react";
import ShopClient from "./ShopClient";
export const metadata = { title: "Shop — Ronak Wood Craft" };
export default function Shop() {
  return <Suspense fallback={<div className="wrap page">Loading…</div>}><ShopClient /></Suspense>;
}
