import { WaIcon } from "@/components/wa-icon";

export function OrderButton({ href, label = "Order on WhatsApp" }: { href: string | null; label?: string }) {
  if (!href) return null;
  return (
    <a className="btn btn-glow btn-wide btn-order" href={href} target="_blank" rel="noopener noreferrer">
      <WaIcon />
      {label}
    </a>
  );
}

export function SoldOut() {
  return (
    <span className="btn btn-wide btn-sold" aria-disabled="true">
      Sold out
    </span>
  );
}
