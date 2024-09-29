'use server';

import { db } from '@/lib/supabase/db';
import { reposTable } from '@/lib/supabase/schema';
import { KnowledgeTree } from '@/types';
import { and, eq } from 'drizzle-orm';

export async function getFileData(githubUser: string, githubRepo: string) {
  const data = await db
    .select()
    .from(reposTable)
    .where(
      and(
        eq(reposTable.github_user, githubUser),
        eq(reposTable.github_repo, githubRepo)
      )
    )
    .limit(1);

  const firstRow = data[0];

  if (!firstRow) {
    return null;
  }

  return firstRow.knowledge_tree as KnowledgeTree;
}
