const path = require("path");

const dbPath =
  process.platform === "win32" && process.env.APPDATA
    ? path.join(
        process.env.APPDATA,
        "com.jvanz.idea-leaderboard",
        "idea-leaderboard.db",
      )
    : path.join(__dirname, "idea-leaderboard.db");

module.exports = {
  schema: "./src/lib/db/schema.ts",
  out: "./src/lib/db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: dbPath,
  },
};
