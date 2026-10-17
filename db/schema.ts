// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const networks = sqliteTable('networks', {
  id: text('id').primaryKey(), owner: text('owner').notNull(), ssid: text('ssid').notNull(),
  place: text('place').notNull(), security: text('security').notNull(), hidden: integer('hidden').notNull(),
  secret: text('secret').notNull(), created: text('created').notNull(), updated: text('updated').notNull(),
});
