import { Suspense } from "react";
import BookingsClient from "./BookingsClient";
export const metadata = { title: "Bookings — Ronak Wood Craft" };
export default function Bookings() {
  return <Suspense fallback={<div className="wrap page">Loading…</div>}><BookingsClient /></Suspense>;
}
