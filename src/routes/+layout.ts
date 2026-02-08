// Tauri doesn't have a Node.js server to do proper SSR
// so we use adapter-static with a fallback to index.html to put the site in SPA mode
// See: https://svelte.dev/docs/kit/single-page-apps
// See: https://v2.tauri.app/start/frontend/sveltekit/ for more info
export const ssr = false;

import { getTableNames } from "$lib/db";
import {
  runMigrations,
  getAppliedMigrations,
  getExpectedMigrationFiles,
} from "$lib/db/migrate";

let migrated = false;

export async function load() {
  const expected = getExpectedMigrationFiles();
  try {
    if (!migrated) {
      await runMigrations();
      migrated = true;
    }
    const applied = await getAppliedMigrations();
    const tables = await getTableNames();
    const allApplied =
      expected.length === applied.length &&
      expected.every((f, i) => applied[i] === f);

    // seed();
    return {
      db: {
        migrationsApplied: applied,
        migrationsExpected: expected,
        migrationsOk: allApplied,
        tables,
      },
    };
  } catch (err) {
    console.error("Database migratie faalde:", err);
    return {
      db: {
        migrationsApplied: [],
        migrationsExpected: expected,
        migrationsOk: false,
        error: "Database niet beschikbaar (run via Tauri)",
        tables: undefined,
      },
    };
  }
}
