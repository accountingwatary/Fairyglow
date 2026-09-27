"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { matchSecret, sessionToken, isAdmin } from "@/lib/auth";
import { addProduct, CatalogError, removeMedia, removeProduct, saveSettings, updateProduct } from "@/lib/catalog";
import { normalizeWhatsapp, parsePrice } from "@/lib/format";
import type { IncomingFile, IncomingMedia } from "@/lib/types";

function refresh(productId?: number) {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin");
  if (productId) revalidatePath(`/product/${productId}`);
}

function done(saved: string, skipped = 0): never {
  redirect(`/admin?saved=${saved}&skipped=${skipped}&n=${Date.now()}`);
}

async function mediaFrom(formData: FormData): Promise<IncomingMedia> {
  const files: IncomingFile[] = [];
  for (const entry of formData.getAll("media")) {
    if (!(entry instanceof File) || entry.size === 0) continue;
    files.push({
      bytes: Buffer.from(await entry.arrayBuffer()),
      originalName: entry.name,
      mime: entry.type,
    });
  }
  const urls = formData
    .getAll("mediaUrl")
    .filter((entry): entry is string => typeof entry === "string" && entry.length > 0);
  return { files, urls };
}

function failureCode(error: unknown) {
  if (error instanceof CatalogError) return error.code;
  throw error;
}

async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin?error=auth");
}

export async function login(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!matchSecret(password, expected)) redirect("/admin?error=login");
  const jar = await cookies();
  jar.set("fg_session", sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
    secure: process.env.NODE_ENV === "production",
  });
  redirect("/admin");
}

export async function logout() {
  const jar = await cookies();
  jar.set("fg_session", "", { httpOnly: true, path: "/", maxAge: 0 });
  redirect("/");
}

export async function saveShopSettings(formData: FormData) {
  await requireAdmin();
  const whatsapp = normalizeWhatsapp(String(formData.get("whatsapp") ?? ""));
  if (whatsapp == null) redirect("/admin?error=whatsapp");
  const currency = String(formData.get("currency") ?? "");
  await saveSettings({ whatsapp, currency });
  refresh();
  done("settings");
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const priceCents = parsePrice(String(formData.get("price") ?? ""));
  if (priceCents == null) redirect("/admin?error=price");
  const media = await mediaFrom(formData);
  let skipped = 0;
  let code: string | null = null;
  try {
    skipped = (
      await addProduct({
        name: String(formData.get("name") ?? ""),
        description: String(formData.get("description") ?? ""),
        priceCents,
        media,
      })
    ).skipped;
  } catch (error) {
    code = failureCode(error);
  }
  if (code) redirect(`/admin?error=${code}`);
  refresh();
  done("1", skipped);
}

export async function editProduct(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const priceCents = parsePrice(String(formData.get("price") ?? ""));
  if (!Number.isInteger(id) || id <= 0) redirect("/admin?error=missing");
  if (priceCents == null) redirect("/admin?error=price");
  const media = await mediaFrom(formData);
  let skipped = 0;
  let code: string | null = null;
  let missing = false;
  try {
    const updated = await updateProduct(id, {
      name: String(formData.get("name") ?? ""),
      description: String(formData.get("description") ?? ""),
      priceCents,
      media,
    });
    if (!updated) missing = true;
    else skipped = updated.skipped;
  } catch (error) {
    code = failureCode(error);
  }
  if (code) redirect(`/admin?error=${code}`);
  if (missing) redirect("/admin?error=missing");
  refresh(id);
  done("updated", skipped);
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0 || !(await removeProduct(id))) redirect("/admin?error=missing");
  refresh(id);
  done("deleted");
}

export async function deleteMedia(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const productId = await removeMedia(id);
  if (productId == null) redirect("/admin?error=missing");
  refresh(productId);
  done("media");
}
