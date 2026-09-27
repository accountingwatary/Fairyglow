import Link from "next/link";
import { BottleArt } from "@/components/bottle-art";
import { Fireflies } from "@/components/fireflies";
import { Shelf } from "@/components/shelf";
import { WaIcon } from "@/components/wa-icon";
import { listProducts, getSettings } from "@/lib/catalog";
import { generalMessage, whatsappLink } from "@/lib/format";
import { requestOrigin } from "@/lib/origin";

export default async function HomePage() {
  const products = await listProducts();
  const settings = await getSettings();
  const origin = await requestOrigin();
  const featured = products.slice(0, 12);
  const href = whatsappLink(settings.whatsapp, generalMessage());

  return (
    <main className="page">
      <div className="wrap">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Night apothecary</p>
            <h1>
              Bottled light for the <em>witching hour</em>
            </h1>
            <p className="lede">Handmade glow bottles. Moss, glass, and a small light sealed inside.</p>
            <div className="hero-actions">
              <a className="btn btn-glow" href="#shelf">
                View the shelf
              </a>
              {href ? (
                <a className="btn btn-ghost" href={href} target="_blank" rel="noopener noreferrer">
                  <WaIcon />
                  WhatsApp
                </a>
              ) : null}
            </div>
            <p className="charms">moss · glass · cork · moonlight · charm · glow</p>
          </div>
          <div className="hero-art">
            <BottleArt />
            <Fireflies className="hero-flies" count={9} />
          </div>
        </section>

        <section id="shelf" className="shelf-block">
          <div className="section-head" data-reveal>
            <p className="eyebrow">The shelf</p>
            <h2>On the table now</h2>
          </div>
          <Shelf products={featured} settings={settings} origin={origin} />
          {products.length > featured.length ? (
            <p className="more" data-reveal>
              <Link className="btn btn-ghost" href="/shop">
                See the whole shelf
              </Link>
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
