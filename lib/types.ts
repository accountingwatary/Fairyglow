export type MediaKind = "image" | "video";

export type Media = {
  id: number;
  productId: number;
  kind: MediaKind;
  url: string;
  sortOrder: number;
};

export type Product = {
  id: number;
  name: string;
  description: string;
  priceCents: number;
  soldOut: boolean;
  createdAt: string;
  updatedAt: string;
  media: Media[];
};

export type Settings = {
  whatsapp: string;
  currency: string;
};

export type IncomingFile = {
  bytes: Buffer;
  originalName: string;
  mime: string;
};

export type IncomingMedia = {
  files: IncomingFile[];
  urls: string[];
};
