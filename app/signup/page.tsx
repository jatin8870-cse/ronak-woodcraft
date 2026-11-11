import { Suspense } from "react";
import SignupClient from "./SignupClient";
export const metadata = { title: "Sign up — Ronak Wood Craft" };
export default function Page() { return <Suspense fallback={<div className="wrap page">Loading…</div>}><SignupClient /></Suspense>; }
