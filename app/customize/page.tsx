import type { Metadata } from "next";
import Link from "next/link";
import { CustomWizard } from "@/components/custom-wizard";
import { getSettings } from "@/lib/catalog";
import "./customize.css";

export const metadata: Metadata = {
  title: "Customize your bottle",
  description: "Choose the colors, size, and mood of your own glow bottle and ask for a quotation on WhatsApp.",
};

export default async function CustomizePage() {
  const settings = await getSettings();

  return (
    <main className="page customize-page">
      <div className="wrap customize-wrap">
        <div className="page-intro rise">
          <Link className="back" href="/">
            Back home
          </Link>
          <p className="eyebrow">Made for you</p>
          <h1>Customize your bottle</h1>
          <p className="lede">Four small choices, then send them on WhatsApp for a quotation.</p>
        </div>
        <CustomWizard whatsapp={settings.whatsapp} />
      </div>
    </main>
  );
}
