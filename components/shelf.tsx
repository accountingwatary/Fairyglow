import Link from "next/link";
import type { CSSProperties } from "react";
import { BottleArt } from "@/components/bottle-art";
import { CategoryBar } from "@/components/category-bar";
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

  const groups = groupByCategory(products);
  const grid = (items: Product[]) => (
    <div className="shelf-grid">
      {items.map((product, index) => (
        <ProductCard key={product.id} product={product} settings={settings} origin={origin} index={index % 4} />
      ))}
    </div>
  );

  if (groups.length === 1 && !groups[0].named) return grid(products);

  return (
    <div className="shelf-sections">
      <CategoryBar
        categories={[
          { id: "cat-all", label: "All", count: products.length },
          ...groups.map((group) => ({ id: group.id, label: group.label, count: group.items.length })),
        ]}
      />
      {groups.map((group) => (
        <section key={group.id} id={group.id} className="cat-section">
          <h3 className="cat-title">
            {group.label}
            <span>{group.items.length}</span>
          </h3>
          {grid(group.items)}
        </section>
      ))}
    </div>
  );
}

type Group = { id: string; label: string; named: boolean; items: Product[] };

function groupByCategory(products: Product[]): Group[] {
  const map = new Map<string, Group>();
  let other: Group | null = null;
  for (const product of products) {
    if (!product.category) {
      other ??= { id: "cat-more", label: "More bottles", named: false, items: [] };
      other.items.push(product);
      continue;
    }
    const key = product.category.toLowerCase();
    let group = map.get(key);
    if (!group) {
      group = { id: `cat-${map.size + 1}`, label: product.category, named: true, items: [] };
      map.set(key, group);
    }
    group.items.push(product);
  }
  const groups = [...map.values()];
  if (other) groups.push(other);
  return groups;
}
