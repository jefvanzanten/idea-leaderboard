import { drizzle } from "drizzle-orm/sqlite-proxy";
import Database from "@tauri-apps/plugin-sql";
import * as schema from "./schema";

let dbInstance: Database | null = null;

export async function getSqlite(): Promise<Database> {
  if (!dbInstance) {
    dbInstance = await Database.load("sqlite:idea-leaderboard.db");
  }
  return dbInstance;
}

function isSelectQuery(sql: string): boolean {
  const trimmed = sql.trimStart().toLowerCase();
  return trimmed.startsWith("select") || trimmed.startsWith("pragma");
}

export const db = drizzle<typeof schema>(
  async (sql, params, method) => {
    const sqlite = await getSqlite();

    if (isSelectQuery(sql)) {
      const rows = await sqlite
        .select<Record<string, unknown>[]>(sql, params)
        .catch((e: unknown) => {
          console.error("SQL Select Error:", e);
          return [];
        });

      const mapped = rows.map((row) => Object.values(row));
      return { rows: method === "all" ? mapped : mapped[0] };
    }

    await sqlite.execute(sql, params).catch((e: unknown) => {
      console.error("SQL Execute Error:", e);
    });

    return { rows: [] };
  },
  { schema },
);

export async function getTableNames(): Promise<string[]> {
  const sqlite = await getSqlite();
  const rows = await sqlite
    .select<
      Array<{ name: string }>
    >("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
    .catch(() => []);
  return rows.map((r) => r.name);
}
