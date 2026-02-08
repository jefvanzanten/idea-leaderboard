import { getSqlite } from "./index";

// Zorg dat het pad exact klopt vanaf dit bestand gezien
const migrationFiles = import.meta.glob("./migrations/*.sql", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>; // Forceer type cast voor duidelijkheid

async function ensureMigrationsTable(): Promise<void> {
  const sqlite = await getSqlite();
  await sqlite.execute(`
    CREATE TABLE IF NOT EXISTS __drizzle_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hash TEXT NOT NULL UNIQUE,
      created_at INTEGER NOT NULL
    )
  `);
}

export async function getAppliedMigrations(): Promise<string[]> {
  await ensureMigrationsTable();
  const sqlite = await getSqlite();
  const rows = await sqlite
    .select<
      Array<{ hash: string }>
    >("SELECT hash FROM __drizzle_migrations ORDER BY id")
    .catch(() => []);
  return rows.map((row) => row.hash);
}

async function recordMigration(hash: string): Promise<void> {
  const sqlite = await getSqlite();
  await sqlite.execute(
    "INSERT INTO __drizzle_migrations (hash, created_at) VALUES ($1, $2)",
    [hash, Date.now()],
  );
}

async function executeSqlFile(sqlContent: string): Promise<void> {
  const sqlite = await getSqlite();
  const statements = sqlContent
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    await sqlite.execute(statement);
  }
}

export async function runMigrations(): Promise<void> {
  console.log("[db] Running migrations...");

  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();

  const paths = Object.keys(migrationFiles).sort();
  const pending = paths.filter((path) => {
    const filename = path.split("/").pop() ?? path;
    return !applied.includes(filename);
  });

  if (pending.length === 0) {
    console.log("[db] All migrations already applied.");
    return;
  }

  for (const path of pending) {
    const filename = path.split("/").pop() ?? path;
    const content = migrationFiles[path];

    console.log(`[db] Applying migration: ${filename}`);
    await executeSqlFile(content);
    await recordMigration(filename);
    console.log(`[db] Applied: ${filename}`);
  }

  console.log(`[db] Completed ${pending.length} migration(s).`);
}

/** Voor validatie: lijst van alle migratiebestanden die verwacht worden (gesorteerd). */
export function getExpectedMigrationFiles(): string[] {
  return Object.keys(migrationFiles)
    .sort()
    .map((path) => path.split("/").pop() ?? path);
}
