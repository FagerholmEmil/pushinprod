'use server';

import { Octokit } from '@octokit/rest';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { db } from '@/lib/supabase/db';
import { reposTable } from '@/lib/supabase/schema';
import { and, eq } from 'drizzle-orm';

const octokit = new Octokit({
  auth: process.env.GITHUB_AUTH_TOKEN, // Add your auth token here
});

export const cloneRepo = async (repo: string) => {
  console.log('Fetching repo');

  let [owner, repoName] = repo.split('/');
  if (!owner || !repoName) {
    return {
      success: false,
      is404: false,
      message: 'Invalid repository format. Use owner/repo',
    };
  }

  try {
    await octokit.rest.repos.get({
      owner,
      repo: repoName,
    });
  } catch (error) {
    return {
      success: false,
      is404: true,
      message: 'Repository not found on GitHub.',
    };
  }

  const existingRepo = await db
    .select()
    .from(reposTable)
    .where(
      and(
        eq(reposTable.github_user, owner),
        eq(reposTable.github_repo, repoName)
      )
    )
    .limit(1);

  if (existingRepo && existingRepo.length > 0) {
    console.log('Repository already exists in the database.');
    return {
      success: true,
      message: 'Repository already exists in the database.',
    };
  }

  console.log('Owner:', owner, 'Repo:', repoName);

  const knowledgeTree: Record<
    string,
    { source: string; dependencies: string[] }
  > = {};

  const { data: rootContent } = await octokit.rest.repos.getContent({
    owner,
    repo: repoName,
    path: '',
  });

  async function processContent(item: any) {
    if (item.type === 'file') {
      const { data: fileContent } = await octokit.rest.repos.getContent({
        owner,
        repo: repoName,
        path: item.path,
      });

      let content = '';

      if ('content' in fileContent) {
        content = Buffer.from(fileContent.content, 'base64').toString('utf-8');
      }

      let dependencies: string[] = [];

      if (
        ['.js', '.ts', '.tsx', '.jsx'].some((ext) => item.path.endsWith(ext))
      ) {
        const ast = parse(content, {
          sourceType: 'module',
          plugins: ['jsx', 'typescript'],
        });

        traverse(ast, {
          ImportDeclaration({ node }) {
            dependencies.push(node.source.value);
          },
        });
      }

      knowledgeTree[item.path] = {
        source: content,
        dependencies: dependencies,
      };
    } else if (item.type === 'dir') {
      const { data: dirContent } = await octokit.rest.repos.getContent({
        owner,
        repo: repoName,
        path: item.path,
      });

      if (Array.isArray(dirContent)) {
        for (const subItem of dirContent) {
          await processContent(subItem);
        }
      }
    }
  }

  if (Array.isArray(rootContent)) {
    for (const item of rootContent) {
      await processContent(item);
    }
  }

  console.log('saving to db', { owner, repoName });

  await db.insert(reposTable).values({
    github_user: owner,
    github_repo: repoName,
    knowledge_tree: JSON.stringify(knowledgeTree),
  });

  console.log('Added to db');

  return { success: true };
};
