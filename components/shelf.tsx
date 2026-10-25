import Link from "next/link";
import type { CSSProperties } from "react";
import { BottleArt } from "@/components/bottle-art";
import { DriftRow } from "@/components/drift-row";
import { OrderButton, SoldOut } from "@/components/order-button";
import { excerpt, formatPrice, productMessage, whatsappLink } from "@/lib/format";
import type { Product, Settings } from "@/lib/types";

export function ProductCard({
  product,
  settings,
  origin,
  index = 0,
}: {
  product: Product;
  settings: Settings;
  origin: string;
  index?: number;
}) {
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
    <article
      className={product.soldOut ? "card is-sold" : "card"}
      data-reveal
      style={{ "--i": Math.min(index, 4) } as CSSProperties}
    >
      <Link href={`/product/${product.id}`} className="card-media" draggable={false}>
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
        {product.soldOut ? (
          <span className="badge badge-sold">Sold out</span>
        ) : cover?.kind === "video" ? (
          <span className="badge">Video</span>
        ) : null}
      </Link>
      <div className="card-body">
        <div className="card-copy">
          <Link href={`/product/${product.id}`} className="card-title" draggable={false}>
            {product.name}
          </Link>
          {blurb ? <p className="excerpt">{blurb}</p> : null}
        </div>
        <p className="price">{price}</p>
        {product.soldOut ? <SoldOut /> : <OrderButton href={href} label="Order" />}
      </div>
    </article>
  );
}

export function Shelf({ products, settings, origin }: { products: Product[]; settings: Settings; origin: string }) {
  if (products.length === 0) {
    return (
      <div className="empty-shelf" data-reveal>
        <BottleArt small />
        <div>
          <h3>The shelf is still dark</h3>
          <p>New bottles are being made. Come back soon.</p>
        </div>
      </div>
    );
  }

  const rows = products.length > 1 ? [products.filter((_, index) => index % 2 === 0), products.filter((_, index) => index % 2 === 1)] : [products];

  return (
    <div className="shelf-rows">
      {rows.map((row, rowIndex) => (
        <DriftRow key={rowIndex} direction={rowIndex === 0 ? "left" : "right"} label={`Bottles, row ${rowIndex + 1}`}>
          {row.map((product, index) => (
            <ProductCard key={product.id} product={product} settings={settings} origin={origin} index={index} />
          ))}
        </DriftRow>
      ))}
    </div>
  );
}
