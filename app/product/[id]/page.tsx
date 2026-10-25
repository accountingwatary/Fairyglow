import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gallery } from "@/components/gallery";
import { OrderButton, SoldOut } from "@/components/order-button";
import { getProduct, getSettings } from "@/lib/catalog";
import { excerpt, formatPrice, productMessage, whatsappLink } from "@/lib/format";
import { requestOrigin } from "@/lib/origin";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(Number(id));
  if (!product) return { title: "Bottle" };
  return {
    title: product.name,
    description: excerpt(product.description, 160) || "A handmade glow bottle from Fairy Glow Bottles.",
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(Number(id));
  if (!product) notFound();
  const settings = await getSettings();
  const origin = await requestOrigin();
  const price = formatPrice(product.priceCents, settings.currency);
  const href = whatsappLink(
    settings.whatsapp,
    productMessage({
      name: product.name,
      price,
      url: origin ? `${origin}/product/${product.id}` : undefined,
    }),
  );

  return (
    <main className={product.soldOut ? "page" : "page product-page"}>
      <div className="wrap product-layout">
        <Gallery
          name={product.name}
          items={product.media.map((item) => ({
            src: item.url,
            kind: item.kind,
          }))}
        />
        <div className="product-copy rise">
          <Link className="back" href="/shop">
            Back to the shelf
          </Link>
          <p className="eyebrow">Bottle</p>
          <h1>{product.name}</h1>
          <p className="price-lg">
            {price}
            {product.soldOut ? <span className="tag-sold">Sold out</span> : null}
          </p>
          {product.description ? (
            <p className="story">{product.description}</p>
          ) : (
            <p className="fine">No story has been written for this bottle yet.</p>
          )}
          {product.soldOut ? (
            <>
              <SoldOut />
              <Link className="btn btn-ghost btn-wide" href="/customize">
                Customize your own
              </Link>
            </>
          ) : (
            <OrderButton href={href} />
          )}
        </div>
      </div>
      {href && !product.soldOut ? (
        <div className="mobile-bar">
          <span className="mobile-bar-price">{price}</span>
          <OrderButton href={href} label="Order" />
        </div>
      ) : null}
    </main>
  );
}
