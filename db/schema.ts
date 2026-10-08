import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Key/value documents behind server/store.js (lessons, inbox threads,
// messages, sessions, classroom settings, upload metadata).
export const documents = pgTable("documents", {
  key: text().primaryKey(),
  value: jsonb().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
