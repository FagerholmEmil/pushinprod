import { pgTable, jsonb, text, timestamp, serial } from 'drizzle-orm/pg-core';

export const reposTable = pgTable('repos', {
  id: serial('id').primaryKey(),
  knowledge_tree: jsonb('knowledge_tree').default('{}'),
  github_user: text('github_user').notNull(),
  github_repo: text('github_repo').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
