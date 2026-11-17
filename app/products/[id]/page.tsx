import type { Metadata } from "next";
import ProductDetails from "./ProductDetails";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Product details | Ronak Wood Craft" };
}

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductDetails id={id} />;
}
