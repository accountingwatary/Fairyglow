import Link from "next/link";
import { WaIcon } from "@/components/wa-icon";
import type { Settings } from "@/lib/types";
import { generalMessage, whatsappLink } from "@/lib/format";

export function Header({ settings, admin }: { settings: Settings; admin: boolean }) {
  const href = whatsappLink(settings.whatsapp, generalMessage());
  return (
    <header className="header">
      <div className="wrap header-inner">
        <Link href="/" className="brand">
          <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
            <circle cx="16" cy="16" r="14.5" fill="none" stroke="#d8ff57" strokeOpacity="0.45" />
            <path d="M18.5 6.5a9.5 9.5 0 1 0 .2 19 7.4 7.4 0 1 1-.2-19z" fill="#d8ff57" />
          </svg>
          <span>
            <strong>Fairy Glow Bottles</strong>
            <small>Night apothecary</small>
          </span>
        </Link>
        <nav>
          <Link href="/shop">Shelf</Link>
          {admin ? <Link href="/admin">Workroom</Link> : null}
          {href ? (
            <a className="nav-wa" href={href} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <WaIcon />
              <span className="nav-wa-text">WhatsApp</span>
            </a>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
