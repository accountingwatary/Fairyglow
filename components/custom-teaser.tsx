import Link from "next/link";
import type { CSSProperties } from "react";
import { BottleArt } from "@/components/bottle-art";
import { PALETTE, STEPS } from "@/components/custom-options";
import "./custom-teaser.css";

export function CustomTeaser() {
  return (
    <div className="teaser" data-reveal>
      <div className="teaser-art">
        <BottleArt small />
      </div>
      <div className="teaser-copy">
        <p className="eyebrow">Made for you</p>
        <h2>Customize your bottle</h2>
        <p className="lede">Pick the colors, size, and mood. We will send you a quotation on WhatsApp.</p>
        <ul className="teaser-dots" aria-hidden="true">
          {PALETTE.slice(0, 8).map((color) => (
            <li key={color.name} style={{ "--swatch": color.hex } as CSSProperties} />
          ))}
        </ul>
        <ol className="teaser-steps">
          {STEPS.map((step, index) => (
            <li key={step}>
              <span>0{index + 1}</span>
              {step}
            </li>
          ))}
        </ol>
        <Link className="btn btn-glow btn-order" href="/customize">
          Customize your bottle
        </Link>
      </div>
    </div>
  );
}
