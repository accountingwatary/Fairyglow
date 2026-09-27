import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { Fireflies } from "@/components/fireflies";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Reveal } from "@/components/reveal";
import { isAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/catalog";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const sans = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Fairy Glow Bottles",
    template: "%s · Fairy Glow Bottles",
  },
  description: "Handmade glow bottles from a night apothecary. Choose a bottle and place the order on WhatsApp.",
};

export const viewport: Viewport = {
  themeColor: "#070a08",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: ReactNode }) {
  const settings = await getSettings();
  const admin = await isAdmin();

  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: 'document.documentElement.classList.add("motion")' }} />
        <div className="atmosphere" aria-hidden="true">
          <Fireflies />
        </div>
        <Reveal />
        <a className="skip" href="#content">
          Skip to content
        </a>
        <Header settings={settings} admin={admin} />
        <div id="content">{children}</div>
        <Footer settings={settings} />
      </body>
    </html>
  );
}
