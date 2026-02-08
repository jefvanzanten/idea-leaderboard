// import { drizzle } from "drizzle-orm/bun-sqlite";
// import { Database } from "bun:sqlite";
// import * as path from "path";
// import * as schema from "./schema";
// import { categories } from "./schema";

// const dbPath =
//   process.platform === "win32" && process.env.APPDATA
//     ? path.join(
//         process.env.APPDATA,
//         "com.jvanz.idea-leaderboard",
//         "idea-leaderboard.db",
//       )
//     : path.join(import.meta.dir, "..", "idea-leaderboard.db");

// console.log(`📂 Verbinding maken met database op: ${dbPath}`);

// const sqlite = new Database(dbPath);
// const db = drizzle(sqlite, { schema });

// export const seed = async () => {
//   console.log("🌱 Seeding gestart...");

//   try {
//     await db
//       .insert(categories)
//       .values([{ name: "Programming" }, { name: "Writing" }])
//       .onConflictDoNothing();

//     console.log("✅ Seeding succesvol afgerond!");
//   } catch (error) {
//     console.error("❌ Fout tijdens het seeden:", error);
//   } finally {
//     sqlite.close();
//   }
// };

// seed();
