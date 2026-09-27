"use client";

import { upload } from "@vercel/blob/client";
import { useEffect, useRef, useState } from "react";

type Item = {
  key: string;
  name: string;
  kind: "image" | "video";
  preview: string;
  status: "ready" | "uploading" | "done" | "error";
  url?: string;
};

const ACCEPT = "image/png,image/jpeg,image/webp,image/gif,image/avif,video/mp4,video/webm,video/quicktime";
const LIMIT = 8;

function safeName(name: string) {
  const clean = name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return clean || "file";
}

export function MediaPicker({ direct }: { direct: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    return () => itemsRef.current.forEach((item) => URL.revokeObjectURL(item.preview));
  }, []);

  useEffect(() => {
    const form = inputRef.current?.form;
    if (!form) return;
    const onSubmit = (event: Event) => {
      if (itemsRef.current.some((item) => item.status === "uploading")) {
        event.preventDefault();
        event.stopPropagation();
        window.alert("Wait for the uploads to finish.");
      }
    };
    const onReset = () => {
      itemsRef.current.forEach((item) => URL.revokeObjectURL(item.preview));
      setItems([]);
    };
    form.addEventListener("submit", onSubmit);
    form.addEventListener("reset", onReset);
    return () => {
      form.removeEventListener("submit", onSubmit);
      form.removeEventListener("reset", onReset);
    };
  }, []);

  function update(key: string, patch: Partial<Item>) {
    setItems((current) => current.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  }

  function remove(key: string) {
    setItems((current) => {
      const item = current.find((entry) => entry.key === key);
      if (item) URL.revokeObjectURL(item.preview);
      return current.filter((entry) => entry.key !== key);
    });
  }

  function take(files: File[]) {
    if (!direct) {
      itemsRef.current.forEach((item) => URL.revokeObjectURL(item.preview));
      setItems(
        files.slice(0, LIMIT).map((file, index) => ({
          key: `${Date.now()}-${index}`,
          name: file.name,
          kind: file.type.startsWith("video/") ? "video" : "image",
          preview: URL.createObjectURL(file),
          status: "ready",
        })),
      );
      return;
    }

    const room = Math.max(0, LIMIT - itemsRef.current.length);
    const picked = files.slice(0, room).map((file, index) => ({
      file,
      item: {
        key: `${Date.now()}-${index}-${file.name}`,
        name: file.name,
        kind: file.type.startsWith("video/") ? "video" : "image",
        preview: URL.createObjectURL(file),
        status: "uploading",
      } satisfies Item,
    }));
    setItems((current) => [...current, ...picked.map((entry) => entry.item)]);
    for (const { file, item } of picked) {
      upload(`products/${safeName(file.name)}`, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
        contentType: file.type || undefined,
        multipart: file.size > 8 * 1024 * 1024,
      })
        .then((blob) => update(item.key, { status: "done", url: blob.url }))
        .catch(() => update(item.key, { status: "error" }));
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  function onDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setOver(false);
    const files = Array.from(event.dataTransfer.files);
    if (!direct && inputRef.current) {
      const transfer = new DataTransfer();
      files.slice(0, LIMIT).forEach((file) => transfer.items.add(file));
      inputRef.current.files = transfer.files;
    }
    take(files);
  }

  return (
    <div>
      <div
        className={over ? "drop over" : "drop"}
        onDragOver={(event) => {
          event.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          type="file"
          name={direct ? undefined : "media"}
          accept={ACCEPT}
          multiple
          onChange={(event) => take(Array.from(event.target.files ?? []))}
        />
        <span>Drop photos or videos here, or tap to choose</span>
      </div>
      {items.length > 0 ? (
        <ul className="picks">
          {items.map((item) => (
            <li key={item.key}>
              {item.kind === "video" ? <video src={item.preview} muted playsInline /> : <img src={item.preview} alt="" />}
              <span>
                {item.status === "uploading" ? "Uploading…" : item.status === "error" ? "Failed, remove and retry" : item.name}
              </span>
              {direct && item.status !== "uploading" ? (
                <button type="button" className="text-btn" onClick={() => remove(item.key)}>
                  Remove
                </button>
              ) : null}
              {item.url ? <input type="hidden" name="mediaUrl" value={item.url} /> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
