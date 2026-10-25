import type { Metadata } from "next";
import { AdminPanel } from "@/components/admin-panel";
import { login } from "@/app/admin/actions";
import { isAdmin } from "@/lib/auth";
import { getSettings, listProducts } from "@/lib/catalog";
import { blobEnabled } from "@/lib/media";

export const metadata: Metadata = {
  title: "Workroom",
  robots: { index: false, follow: false },
};

const errors: Record<string, string> = {
  login: "That password does not open the workroom.",
  name: "Give the bottle a name.",
  price: "Enter a price like 25 or 25.00.",
  auth: "Sign in again to change the shelf.",
  whatsapp: "Use a WhatsApp number with country code, digits only.",
  missing: "That bottle is no longer on the shelf.",
};

const saved: Record<string, string> = {
  "1": "Bottle added to the shelf.",
  updated: "Bottle updated.",
  deleted: "Bottle removed.",
  settings: "Shop settings saved.",
  media: "Photo or video removed.",
  soldout: "Marked as sold out. It stays on the shelf.",
  instock: "Back in stock.",
};

type Props = {
  searchParams: Promise<{ error?: string; saved?: string; skipped?: string; n?: string }>;
};

export default async function AdminPage({ searchParams }: Props) {
  const query = await searchParams;
  const authed = await isAdmin();
  const error = query.error ? errors[query.error] : "";
  let message = query.saved ? (saved[query.saved] ?? "") : "";
  const skipped = Number(query.skipped || 0);
  if (message && skipped > 0) {
    message += " Some files were left out. Use photos or videos, up to 8 files per save.";
  }

  return (
    <main className="page">
      <div className="wrap workroom">
        <header className="page-intro">
          <p className="eyebrow">Admin</p>
          <h1>Workroom</h1>
          <p className="lede">Add bottles, prices, photos, and videos. Visitors can look, then they order on WhatsApp.</p>
        </header>
        {message ? (
          <p className="note banner-good" role="status">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="note banner-bad" role="alert">
            {error}
          </p>
        ) : null}
        {authed ? (
          <AdminPanel
            key={query.n ?? "admin"}
            products={await listProducts()}
            settings={await getSettings()}
            direct={blobEnabled()}
          />
        ) : (
          <form action={login} className="panel login-panel">
            <h2>Enter</h2>
            <label className="field">
              <span>Password</span>
              <input type="password" name="password" required autoComplete="current-password" />
            </label>
            <button className="btn btn-glow" type="submit">
              Open the workroom
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
