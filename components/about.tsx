import { WaIcon } from "@/components/wa-icon";
import { generalMessage, whatsappLink } from "@/lib/format";
import { CONTACT_EMAIL } from "@/lib/site";
import "./about.css";

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="m4 7 8 6 8-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function About({ whatsapp }: { whatsapp: string }) {
  const href = whatsappLink(whatsapp, generalMessage());
  return (
    <div className="about" data-reveal>
      <div className="about-copy">
        <p className="eyebrow">About us</p>
        <h2>
          Made by hand, <em>after dark</em>
        </h2>
        <p className="lede">
          Every bottle is made by hand, one at a time: moss pressed into glass, a cork sealed tight, and a small light tucked
          inside to keep the night company. We work slowly in our little apothecary, so no two bottles are ever quite the
          same.
        </p>
      </div>
      <div className="about-contact">
        <p className="eyebrow">Say hello</p>
        <a className="contact-link" href={`mailto:${CONTACT_EMAIL}`}>
          <span className="contact-icon">
            <MailIcon />
          </span>
          <span className="contact-text">
            <small>Email</small>
            {CONTACT_EMAIL}
          </span>
        </a>
        {href ? (
          <a className="contact-link" href={href} target="_blank" rel="noopener noreferrer">
            <span className="contact-icon">
              <WaIcon />
            </span>
            <span className="contact-text">
              <small>WhatsApp</small>
              Message us
            </span>
          </a>
        ) : null}
      </div>
    </div>
  );
}
