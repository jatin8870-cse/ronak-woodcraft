import { Suspense } from "react";
import ProjectDetail from "./ProjectDetail";
export default function Page() { return <Suspense fallback={<div className="wrap page">Loading…</div>}><ProjectDetail /></Suspense>; }
