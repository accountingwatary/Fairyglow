import { WaIcon } from "@/components/wa-icon";

export function OrderButton({ href, label = "Order on WhatsApp" }: { href: string | null; label?: string }) {
  if (!href) return null;
  return (
    <a className="btn btn-glow btn-wide" href={href} target="_blank" rel="noopener noreferrer">
      <WaIcon />
      {label}
    </a>
  );
}
