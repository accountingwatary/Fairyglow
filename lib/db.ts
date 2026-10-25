import fs from "fs";
import path from "path";

type Row = Record<string, unknown>;

export type Db = {
  query<T = Row>(text: string, params?: unknown[]): Promise<T[]>;
};

const globalForDb = globalThis as unknown as { fairyDb?: Promise<Db> };

function postgresUrl() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
}

const POSTGRES_SCHEMA = [
  `CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    price_cents INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS media (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    kind TEXT NOT NULL,
    url TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
  )`,
  "CREATE INDEX IF NOT EXISTS idx_media_product ON media(product_id, sort_order)",
  "CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)",
  "INSERT INTO settings (key, value) VALUES ('currency', '$'), ('whatsapp', '') ON CONFLICT (key) DO NOTHING",
  "ALTER TABLE products ADD COLUMN IF NOT EXISTS sold_out INTEGER NOT NULL DEFAULT 0",
];

const SQLITE_SCHEMA = `
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    price_cents INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    kind TEXT NOT NULL,
    url TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
  );
  CREATE INDEX IF NOT EXISTS idx_media_product ON media(product_id, sort_order);
  CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  INSERT INTO settings (key, value) VALUES ('currency', '$'), ('whatsapp', '') ON CONFLICT (key) DO NOTHING;
`;

function toPostgresParams(text: string) {
  let index = 0;
  return text.replace(/\?/g, () => `$${++index}`);
}

async function connectPostgres(url: string): Promise<Db> {
  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(url);
  for (const statement of POSTGRES_SCHEMA) {
    await sql.query(statement);
  }
  return {
    async query<T>(text: string, params: unknown[] = []) {
      return (await sql.query(toPostgresParams(text), params)) as T[];
    },
  };
}

async function connectSqlite(): Promise<Db> {
  const { DatabaseSync } = await import("node:sqlite");
  const dir = path.join(process.cwd(), "data");
  fs.mkdirSync(dir, { recursive: true });
  const db = new DatabaseSync(path.join(dir, "shop.db"));
  db.exec("PRAGMA foreign_keys = ON");
  db.exec("PRAGMA journal_mode = WAL");
  db.exec("PRAGMA busy_timeout = 5000");
  db.exec(SQLITE_SCHEMA);
  const columns = db.prepare("PRAGMA table_info(products)").all() as { name: string }[];
  if (!columns.some((column) => column.name === "sold_out")) {
    db.exec("ALTER TABLE products ADD COLUMN sold_out INTEGER NOT NULL DEFAULT 0");
  }
  return {
    async query<T>(text: string, params: unknown[] = []) {
      const values = params.map((value) => (typeof value === "boolean" ? Number(value) : value)) as (
        | string
        | number
        | null
      )[];
      return db.prepare(text).all(...values) as T[];
    },
  };
}

export function getDb() {
  if (!globalForDb.fairyDb) {
    const url = postgresUrl();
    if (!url && process.env.VERCEL) {
      throw new Error("DATABASE_URL is not set. Connect a Neon Postgres database to this Vercel project and redeploy.");
    }
    const connecting = url ? connectPostgres(url) : connectSqlite();
    globalForDb.fairyDb = connecting.catch((error) => {
      globalForDb.fairyDb = undefined;
      throw error;
    });
  }
  return globalForDb.fairyDb;
}
