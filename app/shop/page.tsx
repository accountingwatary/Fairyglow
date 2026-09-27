import type { Metadata } from "next";
import { Shelf } from "@/components/shelf";
import { getSettings, listProducts } from "@/lib/catalog";
import { requestOrigin } from "@/lib/origin";

export const metadata: Metadata = {
  title: "The shelf",
  description: "Every glow bottle currently on the Fairy Glow Bottles shelf.",
};

export default async function ShopPage() {
  const products = await listProducts();
  const settings = await getSettings();
  const origin = await requestOrigin();

  return (
    <main className="page">
      <div className="wrap">
        <header className="page-intro rise">
          <p className="eyebrow">The shelf</p>
          <h1>Every bottle on the table</h1>
        </header>
        <Shelf products={products} settings={settings} origin={origin} />
      </div>
    </main>
  );
}
