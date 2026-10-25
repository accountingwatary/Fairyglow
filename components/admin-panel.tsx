import { ConfirmSubmit } from "@/components/confirm-button";
import { MediaPicker } from "@/components/media-picker";
import {
  createProduct,
  deleteMedia,
  deleteProduct,
  editProduct,
  logout,
  saveShopSettings,
  toggleSoldOut,
} from "@/app/admin/actions";
import { formatPrice } from "@/lib/format";
import type { Product, Settings } from "@/lib/types";

function centsToInput(cents: number) {
  return (cents / 100).toFixed(2);
}

export function AdminPanel({
  products,
  settings,
  direct,
}: {
  products: Product[];
  settings: Settings;
  direct: boolean;
}) {
  const categories = [...new Set(products.map((product) => product.category).filter(Boolean))].sort();
  return (
    <div className="stack">
      <datalist id="category-options">
        {categories.map((category) => (
          <option key={category} value={category} />
        ))}
      </datalist>
      <form action={logout}>
        <button className="btn btn-ghost" type="submit">
          Lock the workroom
        </button>
      </form>

      <section className="panel">
        <div>
          <h2>Shop line</h2>
          <p className="fine">Customers never pay on this site. Each bottle opens WhatsApp with the name and price already written.</p>
        </div>
        {settings.whatsapp ? (
          <p className="note">Orders open in WhatsApp at +{settings.whatsapp}.</p>
        ) : (
          <p className="note">Add a WhatsApp number before you share the site. Order buttons stay quiet until then.</p>
        )}
        <form action={saveShopSettings} className="stack tight">
          <div className="split">
            <label className="field">
              <span>WhatsApp number</span>
              <input
                name="whatsapp"
                inputMode="tel"
                autoComplete="tel"
                placeholder="15551234567"
                defaultValue={settings.whatsapp}
                maxLength={20}
              />
            </label>
            <label className="field">
              <span>Currency</span>
              <input name="currency" defaultValue={settings.currency} maxLength={8} placeholder="$" />
            </label>
          </div>
          <p className="fine">Digits with country code, no plus sign. Example: 96170123456.</p>
          <button className="btn btn-glow" type="submit">
            Save shop line
          </button>
        </form>
      </section>

      <section className="panel">
        <div>
          <h2>New bottle</h2>
          <p className="fine">Write the story the way you would caption it, then import the photos or a short video.</p>
        </div>
        <form action={createProduct} className="stack tight">
          <label className="field">
            <span>Name</span>
            <input name="name" required maxLength={120} placeholder="Moss lantern" />
          </label>
          <label className="field">
            <span>Price</span>
            <input name="price" required inputMode="decimal" placeholder="25.00" maxLength={12} />
          </label>
          <label className="field">
            <span>Category</span>
            <input name="category" list="category-options" maxLength={40} placeholder="Night lights, Gifts, Mini bottles…" />
          </label>
          <label className="field">
            <span>Description</span>
            <textarea name="description" maxLength={8000} placeholder="What is sealed inside, the size, and how it glows." />
          </label>
          <label className="check">
            <input type="checkbox" name="soldOut" />
            <span>Sold out</span>
          </label>
          <div className="field">
            <span>Photos and videos</span>
            <MediaPicker direct={direct} />
            <p className="fine">
              Up to 8 files, {direct ? "200MB" : "40MB"} each. Photos: jpg, png, webp, gif. Video: mp4, webm, mov.
            </p>
          </div>
          <button className="btn btn-glow" type="submit">
            Add bottle
          </button>
        </form>
      </section>

      <section className="stack tight">
        <h2>On the shelf</h2>
        {products.length === 0 ? <p className="fine">No bottles yet. The first one you add will show on the landing page.</p> : null}
        {products.map((product) => {
          const price = formatPrice(product.priceCents, settings.currency);
          const cover = product.media.find((item) => item.kind === "image") ?? product.media[0];
          return (
            <details key={product.id} className="editor">
              <summary>
                <span className="summary-main">
                  {cover?.kind === "image" ? (
                    <img src={cover.url} alt="" />
                  ) : (
                    <span className="mini-ph">{cover ? "Video" : "Empty"}</span>
                  )}
                  <span>
                    <strong>{product.name}</strong>
                    <em>
                      {price}
                      {product.category ? <span className="tag-cat">{product.category}</span> : null}
                      {product.soldOut ? <span className="tag-sold">Sold out</span> : null}
                    </em>
                  </span>
                </span>
                <time dateTime={product.createdAt}>{new Date(product.createdAt).toLocaleDateString("en-GB")}</time>
              </summary>
              <div className="editor-body">
                <form action={toggleSoldOut}>
                  <input type="hidden" name="id" value={product.id} />
                  <input type="hidden" name="soldOut" value={product.soldOut ? "0" : "1"} />
                  <button className={product.soldOut ? "btn btn-glow" : "btn btn-ghost"} type="submit">
                    {product.soldOut ? "Back in stock" : "Mark as sold out"}
                  </button>
                </form>
                {product.media.length > 0 ? (
                  <div className="media-grid">
                    {product.media.map((item) => (
                      <figure key={item.id}>
                        {item.kind === "video" ? (
                          <video src={item.url} muted playsInline preload="metadata" />
                        ) : (
                          <img src={item.url} alt="" />
                        )}
                        <figcaption>{item.kind === "video" ? "Video" : "Photo"}</figcaption>
                        <form action={deleteMedia}>
                          <input type="hidden" name="id" value={item.id} />
                          <button className="text-btn" type="submit">
                            Remove
                          </button>
                        </form>
                      </figure>
                    ))}
                  </div>
                ) : (
                  <p className="fine">No photo or video on this bottle yet.</p>
                )}
                <form action={editProduct} className="stack tight">
                  <input type="hidden" name="id" value={product.id} />
                  <label className="field">
                    <span>Name</span>
                    <input name="name" required maxLength={120} defaultValue={product.name} />
                  </label>
                  <label className="field">
                    <span>Price</span>
                    <input name="price" required inputMode="decimal" defaultValue={centsToInput(product.priceCents)} maxLength={12} />
                  </label>
                  <label className="field">
                    <span>Category</span>
                    <input name="category" list="category-options" maxLength={40} defaultValue={product.category} />
                  </label>
                  <label className="field">
                    <span>Description</span>
                    <textarea name="description" maxLength={8000} defaultValue={product.description} />
                  </label>
                  <label className="check">
                    <input type="checkbox" name="soldOut" defaultChecked={product.soldOut} />
                    <span>Sold out</span>
                  </label>
                  <div className="field">
                    <span>Add more photos or videos</span>
                    <MediaPicker direct={direct} />
                  </div>
                  <button className="btn btn-glow" type="submit">
                    Save changes
                  </button>
                </form>
                <form action={deleteProduct}>
                  <input type="hidden" name="id" value={product.id} />
                  <ConfirmSubmit label="Delete this bottle" message="Remove this bottle from the shelf?" />
                </form>
              </div>
            </details>
          );
        })}
      </section>
    </div>
  );
}
