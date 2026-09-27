import Link from "next/link";
import { BottleArt } from "@/components/bottle-art";
import { OrderButton } from "@/components/order-button";
import { excerpt, formatPrice, productMessage, whatsappLink } from "@/lib/format";
import type { Product, Settings } from "@/lib/types";

export function ProductCard({ product, settings, origin }: { product: Product; settings: Settings; origin: string }) {
  const price = formatPrice(product.priceCents, settings.currency);
  const blurb = excerpt(product.description);
  const cover = product.media[0];
  const href = whatsappLink(
    settings.whatsapp,
    productMessage({
      name: product.name,
      price,
      url: origin ? `${origin}/product/${product.id}` : undefined,
    }),
  );

  return (
    <article className="card">
      <Link href={`/product/${product.id}`} className="card-media">
        {cover ? (
          cover.kind === "video" ? (
            <video src={cover.url} muted playsInline preload="metadata" />
          ) : (
            <img src={cover.url} alt={product.name} />
          )
        ) : (
          <span className="placeholder">
            <BottleArt small />
          </span>
        )}
        {cover?.kind === "video" ? <span className="badge">Video</span> : null}
      </Link>
      <div className="card-body">
        <div className="card-copy">
          <Link href={`/product/${product.id}`} className="card-title">
            {product.name}
          </Link>
          {blurb ? <p className="excerpt">{blurb}</p> : null}
        </div>
        <p className="price">{price}</p>
        <OrderButton href={href} label="Order" />
      </div>
    </article>
  );
}

export function Shelf({ products, settings, origin }: { products: Product[]; settings: Settings; origin: string }) {
  if (products.length === 0) {
    return (
      <div className="empty-shelf">
        <BottleArt small />
        <div>
          <h3>The shelf is still dark</h3>
          <p>New bottles are being made. Come back soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} settings={settings} origin={origin} />
      ))}
    </div>
  );
}
