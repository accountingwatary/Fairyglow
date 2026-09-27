import Link from "next/link";
import type { Settings } from "@/lib/types";
import { generalMessage, whatsappLink } from "@/lib/format";

export function Footer({ settings }: { settings: Settings }) {
  const href = whatsappLink(settings.whatsapp, generalMessage());
  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <div>
          <strong>Fairy Glow Bottles</strong>
          <p>Glass, moss, and a light that stays on after the room goes dark.</p>
        </div>
        <div className="footer-links">
          <Link href="/shop">Shelf</Link>
          {href ? (
            <a href={href} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
