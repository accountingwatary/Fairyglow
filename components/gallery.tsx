"use client";

import { useState } from "react";
import type { MediaKind } from "@/lib/types";

export function Gallery({ items, name }: { items: { src: string; kind: MediaKind }[]; name: string }) {
  const [active, setActive] = useState(0);
  if (items.length === 0) {
    return <div className="frame empty-frame">No photo yet</div>;
  }
  const item = items[active] ?? items[0];
  return (
    <div>
      <div className="frame">
        {item.kind === "video" ? (
          <video key={item.src} className="frame-fade" src={item.src} controls playsInline preload="metadata" />
        ) : (
          <img key={item.src} className="frame-fade" src={item.src} alt={name} />
        )}
      </div>
      {items.length > 1 ? (
        <div className="thumbs">
          {items.map((media, index) => (
            <button
              key={media.src}
              type="button"
              className={index === active ? "on" : ""}
              onClick={() => setActive(index)}
              aria-label={`Show ${media.kind} ${index + 1}`}
            >
              {media.kind === "video" ? <video src={media.src} muted playsInline preload="metadata" /> : <img src={media.src} alt="" />}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
