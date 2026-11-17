"use client";
import { useStore } from "@/context/StoreContext";
import ProjectCard from "./ProjectCard";

export default function FeaturedProjects() {
  const { projects, catalogReady } = useStore();
  if (!catalogReady) return null;
  const list = projects.filter((p) => p.featured).slice(0, 6);
  if (!list.length) return null;
  return <div className="prod-grid" style={{ gridTemplateColumns: undefined }}>{list.map((p) => <ProjectCard key={p.id} p={p} />)}</div>;
}
