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

  let owner = '';
  let repoName = '';

  // Check if the repo is a full GitHub URL
  if (repo.startsWith('https://github.com/')) {
    const urlParts = repo.split('/');
    if (urlParts.length >= 5) {
      owner = urlParts[urlParts.length - 2];
      repoName = urlParts[urlParts.length - 1];
    } else {
      return {
        success: false,
        is404: false,
        message: 'Invalid GitHub URL format. Use https://github.com/owner/repo',
      };
    }
  } else {
    [owner, repoName] = repo.split('/');
  }

  if (!owner || !repoName) {
    return {
      success: false,
      is404: false,
      message: 'Invalid repository format. Use owner/repo or full GitHub URL',
    };
  }

  const existingRepo = await db
    .select({
      id: reposTable.id,
      github_user: reposTable.github_user,
      github_repo: reposTable.github_repo,
    })
    .from(reposTable)
    .where(
      and(
        eq(reposTable.github_user, owner),
        eq(reposTable.github_repo, repoName)
      )
    )
    .limit(1);

  if (existingRepo && existingRepo.length > 0) {
    console.log('Repository already exists in the database.', {
      owner,
      repoName,
    });
    return {
      success: true,
      message: 'Repository already exists in the database!',
      owner,
      repoName,
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

  console.log('Found found on github', { owner, repoName });

  const knowledgeTree: Record<
    string,
    { source: string; dependencies: string[] }
  > = {};

  console.log('Fetching repo content...');

  const { data: rootContent } = await octokit.rest.repos.getContent({
    owner,
    repo: repoName,
    path: '',
  });

  console.log('Repo content fetched', { owner, repoName });

  async function processContent(item: any) {
    if (item.type === 'file') {
      if (item.path.endsWith('.DS_Store')) {
        return;
      }

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
        for (let i = 0; i < dirContent.length; i += 10) {
          const batch = dirContent.slice(i, i + 10);
          console.log('Processing batch', { i, file: batch[0].path });

          await Promise.all(batch.map((subItem) => processContent(subItem)));
        }
      }
    }
  }

  if (Array.isArray(rootContent)) {
    for (let i = 0; i < rootContent.length; i += 10) {
      const batch = rootContent.slice(i, i + 10);
      console.log('Processing batch', { i, file: batch[0].path });

      await Promise.all(batch.map((item) => processContent(item)));
    }
  }

  console.log('Saving to db', { owner, repoName });

  await db.insert(reposTable).values({
    github_user: owner,
    github_repo: repoName,
    knowledge_tree: JSON.stringify(knowledgeTree),
  });

  console.log('Added to db');

  return { success: true, owner, repoName };
};
