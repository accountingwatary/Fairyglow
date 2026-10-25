import assert from "node:assert/strict";
import { addProduct, getSettings, listProducts, removeProduct, saveSettings, setSoldOut } from "../lib/catalog";
import { classifyFile } from "../lib/media";

const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

async function main() {
  const before = await getSettings();
  await saveSettings({ whatsapp: "15551234567", currency: "USD" });
  assert.equal((await getSettings()).whatsapp, "15551234567");
  assert.equal((await getSettings()).currency, "USD");
  await saveSettings(before);

  const created = await addProduct({
    name: "Smoke Moss Bottle",
    description: "A tiny test bottle with moss and light.",
    priceCents: 2500,
    soldOut: false,
    media: { files: [{ bytes: png, originalName: "dot.png", mime: "image/png" }], urls: [] },
  });
  const found = (await listProducts()).find((product) => product.id === created.id);
  assert.ok(found);
  assert.equal(found.priceCents, 2500);
  assert.equal(found.soldOut, false);
  assert.equal(await setSoldOut(created.id, true), true);
  assert.equal((await listProducts()).find((product) => product.id === created.id)?.soldOut, true);
  assert.equal(await setSoldOut(created.id, false), true);
  assert.equal(found.media.length, 1);
  assert.equal(found.media[0]?.kind, "image");

  const remote = await addProduct({
    name: "Smoke Remote Bottle",
    description: "",
    priceCents: 1000,
    soldOut: true,
    media: {
      files: [],
      urls: ["https://abc.public.blob.vercel-storage.com/products/clip-x1.mp4", "https://evil.example.com/x.png"],
    },
  });
  const remoteRow = (await listProducts()).find((product) => product.id === remote.id);
  assert.equal(remote.skipped, 1);
  assert.equal(remoteRow?.media.length, 1);
  assert.equal(remoteRow?.media[0]?.kind, "video");

  const rejected = await addProduct({
    name: "Smoke Rejected",
    description: "",
    priceCents: 100,
    soldOut: false,
    media: { files: [{ bytes: Buffer.from("<svg></svg>"), originalName: "x.svg", mime: "image/svg+xml" }], urls: [] },
  });
  assert.equal(rejected.skipped, 1);
  assert.equal(classifyFile("image/svg+xml", "x.svg"), null);

  assert.equal(await removeProduct(created.id), true);
  assert.equal(await removeProduct(remote.id), true);
  assert.equal(await removeProduct(rejected.id), true);
  assert.equal((await listProducts()).some((product) => product.name.startsWith("Smoke ")), false);

  console.log("smoke-ok");
}

main();
