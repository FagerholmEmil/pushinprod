import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/supabase/schema.ts',
  out: './supabase/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.SUPABASE_DATABASE_URL!,
  },
});
