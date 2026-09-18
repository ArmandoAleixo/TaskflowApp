module.exports = {
  schema: "./src/schema.ts",
  out: "./drizzle",
  driver: "better-sqlite3",
  dbCredentials: {
    url: "file:./data.db",
  },
};
