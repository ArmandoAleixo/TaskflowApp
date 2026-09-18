// artifacts/taskflow-backend/drizzle.config.ts
export default {
  schema: "./src/schema.ts",
  out: "./drizzle",
  driver: "better-sqlite",
  dbCredentials: {
    url: "file:./data.db",
  },
};
