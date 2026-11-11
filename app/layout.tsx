import type { Metadata, Viewport } from "next";
import { Fraunces, Figtree } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/context/StoreContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import { BRAND } from "@/lib/data";
import { MessageCircle } from "lucide-react";

const head = Fraunces({ subsets: ["latin"], variable: "--font-head" });
const body = Figtree({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Ronak Wood Craft — Furniture, carpenter & custom woodwork",
  description: "Solid wood furniture, doorstep carpenter services, modular kitchens and custom woodwork by Ronak Wood Craft.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#b4551f" };

const themeScript = `try{var t=localStorage.getItem('rwc-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${head.variable} ${body.variable}`} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>
        <StoreProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <a className="wa" href={`https://wa.me/${BRAND.whatsapp}`} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp">
            <MessageCircle />
          </a>
          <BottomNav />
        </StoreProvider>
      </body>
    </html>
  );
}
