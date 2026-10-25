import Link from "next/link";
import type { Settings } from "@/lib/types";
import { generalMessage, whatsappLink } from "@/lib/format";
import { CONTACT_EMAIL } from "@/lib/site";

export function Footer({ settings }: { settings: Settings }) {
  const href = whatsappLink(settings.whatsapp, generalMessage());
  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <div>
          <strong>Fairy Glow Bottles</strong>
          <p>Glass, moss, and a light that stays on after the room goes dark.</p>
          <a className="footer-mail" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
        </div>
        <div className="footer-links">
          <Link href="/shop">Shelf</Link>
          <Link href="/customize">Customize</Link>
          <Link href="/#about">About</Link>
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
