import { Suspense } from "react";
import LoginClient from "./LoginClient";
export const metadata = { title: "Log in — Ronak Wood Craft" };
export default function Page() { return <Suspense fallback={<div className="wrap page">Loading…</div>}><LoginClient /></Suspense>; }
