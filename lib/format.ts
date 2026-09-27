export function formatPrice(cents: number, currency: string) {
  const amount = (cents / 100).toFixed(2);
  const symbol = currency.trim() || "$";
  if ([...symbol].length === 1) return `${symbol}${amount}`;
  return `${symbol} ${amount}`;
}

export function parsePrice(input: string) {
  const cleaned = input.trim().replace(/\s/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value > 1_000_000) return null;
  return Math.round(value * 100);
}

export function excerpt(text: string, limit = 140) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= limit) return clean;
  return `${clean.slice(0, limit).trimEnd()}…`;
}

export function normalizeWhatsapp(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  let digits = trimmed.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length < 8 || digits.length > 15) return null;
  return digits;
}

export function whatsappLink(number: string, text: string) {
  const digits = normalizeWhatsapp(number);
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function generalMessage() {
  return "Hello Fairy Glow Bottles, I would like to ask about your glow bottles.";
}

export function productMessage(input: { name: string; price: string; url?: string }) {
  const lines = [
    "Hello Fairy Glow Bottles,",
    "I would like to order:",
    `• ${input.name}`,
    `• ${input.price}`,
    "• Quantity: 1",
    "",
    "Please tell me how to pay and how delivery works.",
  ];
  if (input.url) lines.push("", input.url);
  return lines.join("\n");
}
