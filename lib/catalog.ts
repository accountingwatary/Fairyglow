import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { getDb } from "./db";
import { blobEnabled, classifyFile, isBlobUrl, MAX_BYTES, MAX_FILES } from "./media";
import type { IncomingFile, IncomingMedia, Media, MediaKind, Product, Settings } from "./types";

export class CatalogError extends Error {
  code: "name" | "price" | "whatsapp" | "missing";

  constructor(code: CatalogError["code"]) {
    super(code);
    this.code = code;
  }
}

type ProductRow = {
  id: number;
  name: string;
  description: string;
  price_cents: number;
  sold_out: number | boolean | null;
  created_at: string;
  updated_at: string;
};

type MediaRow = {
  id: number;
  product_id: number;
  kind: string;
  url: string;
  sort_order: number;
};

type ProductInput = {
  name: string;
  description: string;
  priceCents: number;
  soldOut: boolean;
  media: IncomingMedia;
};

function localDir(productId: number) {
  return path.join(process.cwd(), "public", "uploads", String(productId));
}

function mapMedia(row: MediaRow): Media {
  return {
    id: Number(row.id),
    productId: Number(row.product_id),
    kind: row.kind === "video" ? "video" : "image",
    url: String(row.url),
    sortOrder: Number(row.sort_order),
  };
}

async function attachMedia(rows: ProductRow[]): Promise<Product[]> {
  if (rows.length === 0) return [];
  const db = await getDb();
  const ids = rows.map((row) => Number(row.id));
  const mediaRows = await db.query<MediaRow>(
    `SELECT * FROM media WHERE product_id IN (${ids.map(() => "?").join(", ")}) ORDER BY sort_order ASC, id ASC`,
    ids,
  );
  const grouped = new Map<number, Media[]>();
  for (const row of mediaRows) {
    const media = mapMedia(row);
    const list = grouped.get(media.productId) ?? [];
    list.push(media);
    grouped.set(media.productId, list);
  }
  return rows.map((row) => ({
    id: Number(row.id),
    name: String(row.name),
    description: String(row.description),
    priceCents: Number(row.price_cents),
    soldOut: Number(row.sold_out ?? 0) === 1,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    media: grouped.get(Number(row.id)) ?? [],
  }));
}

function cleanName(name: string) {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 120) throw new CatalogError("name");
  return trimmed;
}

function cleanDescription(description: string) {
  return description.trim().slice(0, 8000);
}

function assertPrice(cents: number) {
  if (!Number.isInteger(cents) || cents < 0 || cents > 100_000_000) throw new CatalogError("price");
}

export async function listProducts() {
  const db = await getDb();
  const rows = await db.query<ProductRow>("SELECT * FROM products ORDER BY sold_out ASC, created_at DESC, id DESC");
  return attachMedia(rows);
}

export async function getProduct(id: number) {
  if (!Number.isInteger(id) || id <= 0) return null;
  const db = await getDb();
  const [row] = await db.query<ProductRow>("SELECT * FROM products WHERE id = ?", [id]);
  if (!row) return null;
  return (await attachMedia([row]))[0] ?? null;
}

export async function getSettings(): Promise<Settings> {
  const db = await getDb();
  const rows = await db.query<{ key: string; value: string }>("SELECT key, value FROM settings");
  const map = new Map(rows.map((row) => [String(row.key), String(row.value)]));
  return {
    whatsapp: map.get("whatsapp") ?? "",
    currency: map.get("currency") || "$",
  };
}

export async function saveSettings(input: { whatsapp: string; currency: string }) {
  const currency = input.currency.trim().slice(0, 8) || "$";
  const db = await getDb();
  const upsert = "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value";
  await db.query(upsert, ["whatsapp", input.whatsapp]);
  await db.query(upsert, ["currency", currency]);
}

async function storeFile(productId: number, file: IncomingFile, ext: string) {
  const filename = `${randomUUID()}.${ext}`;
  if (blobEnabled()) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`products/${productId}/${filename}`, file.bytes, {
      access: "public",
      contentType: file.mime || undefined,
    });
    return blob.url;
  }
  const dir = localDir(productId);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, filename), file.bytes);
  return `/uploads/${productId}/${filename}`;
}

async function saveMedia(productId: number, incoming: IncomingMedia) {
  const db = await getDb();
  const [current] = await db.query<{ m: number | null }>(
    "SELECT MAX(sort_order) AS m FROM media WHERE product_id = ?",
    [productId],
  );
  let order = current?.m == null ? 0 : Number(current.m) + 1;
  let saved = 0;
  let skipped = 0;

  const record = async (kind: MediaKind, url: string) => {
    await db.query("INSERT INTO media (product_id, kind, url, sort_order) VALUES (?, ?, ?, ?)", [
      productId,
      kind,
      url,
      order,
    ]);
    order += 1;
    saved += 1;
  };

  for (const url of incoming.urls) {
    const classified = isBlobUrl(url) ? classifyFile("", new URL(url).pathname) : null;
    if (saved >= MAX_FILES || !classified) {
      skipped += 1;
      continue;
    }
    await record(classified.kind, url);
  }

  for (const file of incoming.files) {
    const classified = classifyFile(file.mime, file.originalName);
    if (saved >= MAX_FILES || !classified || file.bytes.length === 0 || file.bytes.length > MAX_BYTES) {
      skipped += 1;
      continue;
    }
    await record(classified.kind, await storeFile(productId, file, classified.ext));
  }

  return skipped;
}

async function discard(urls: string[]) {
  const remote = urls.filter(isBlobUrl);
  if (remote.length > 0 && blobEnabled()) {
    const { del } = await import("@vercel/blob");
    await del(remote).catch(() => undefined);
  }
  for (const url of urls) {
    const match = url.match(/^\/uploads\/(\d+)\/([a-zA-Z0-9-]+\.[a-z0-9]+)$/);
    if (match) fs.rmSync(path.join(localDir(Number(match[1])), match[2]), { force: true });
  }
}

export async function addProduct(input: ProductInput) {
  const name = cleanName(input.name);
  const description = cleanDescription(input.description);
  assertPrice(input.priceCents);
  const db = await getDb();
  const now = new Date().toISOString();
  const [row] = await db.query<{ id: number }>(
    "INSERT INTO products (name, description, price_cents, sold_out, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?) RETURNING id",
    [name, description, input.priceCents, input.soldOut ? 1 : 0, now, now],
  );
  const id = Number(row.id);
  const skipped = await saveMedia(id, input.media);
  return { id, skipped };
}

export async function updateProduct(id: number, input: ProductInput) {
  if (!(await getProduct(id))) return null;
  const name = cleanName(input.name);
  const description = cleanDescription(input.description);
  assertPrice(input.priceCents);
  const db = await getDb();
  await db.query(
    "UPDATE products SET name = ?, description = ?, price_cents = ?, sold_out = ?, updated_at = ? WHERE id = ?",
    [name, description, input.priceCents, input.soldOut ? 1 : 0, new Date().toISOString(), id],
  );
  const skipped = await saveMedia(id, input.media);
  return { skipped };
}

export async function setSoldOut(id: number, soldOut: boolean) {
  if (!Number.isInteger(id) || id <= 0) return false;
  const db = await getDb();
  const updated = await db.query<{ id: number }>(
    "UPDATE products SET sold_out = ?, updated_at = ? WHERE id = ? RETURNING id",
    [soldOut ? 1 : 0, new Date().toISOString(), id],
  );
  return updated.length > 0;
}

export async function removeProduct(id: number) {
  if (!Number.isInteger(id) || id <= 0) return false;
  const db = await getDb();
  const media = await db.query<{ url: string }>("SELECT url FROM media WHERE product_id = ?", [id]);
  const deleted = await db.query<{ id: number }>("DELETE FROM products WHERE id = ? RETURNING id", [id]);
  if (deleted.length === 0) return false;
  await discard(media.map((item) => String(item.url)));
  fs.rmSync(localDir(id), { recursive: true, force: true });
  return true;
}

export async function removeMedia(mediaId: number) {
  if (!Number.isInteger(mediaId) || mediaId <= 0) return null;
  const db = await getDb();
  const [row] = await db.query<{ product_id: number; url: string }>(
    "DELETE FROM media WHERE id = ? RETURNING product_id, url",
    [mediaId],
  );
  if (!row) return null;
  await discard([String(row.url)]);
  return Number(row.product_id);
}
