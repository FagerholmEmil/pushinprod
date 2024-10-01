//@ts-nocheck
'use server';

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { db } from '@/lib/supabase/db';
import { reposTable } from '@/lib/supabase/schema';

const execAsync = promisify(exec);
const readFileAsync = promisify(fs.readFile);

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

  let repoUrl = `https://github.com/${owner}/${repoName}`;

  if (!repoUrl.endsWith('.git')) {
    repoUrl += '.git';
  }

  console.log('repoUrl', repoUrl);

  const localPath = `./repos/${repo.split('/').pop()}`;

  if (!fs.existsSync(localPath)) {
    // Clone the repository
    await execAsync(`git clone ${repoUrl} ${localPath}`);
  }
  // Read the files from the cloned repository
  const getFiles = async (dir: string): Promise<string[]> => {
    const subdirs = await fs.promises.readdir(dir);
    const files = await Promise.all(
      subdirs.map(async (subdir) => {
        const res = path.resolve(dir, subdir);
        if ((await fs.promises.stat(res)).isDirectory()) {
          return getFiles(res);
        } else {
          const ext = path.extname(res);
          return [
            '.js',
            '.ts',
            '.tsx',
            '.jsx',
            '.css',
            '.scss',
            '.sass',
            '.html',
            '.graphql',
            '.gql',
            '.mjs',
            '.cjs',
          ].includes(ext)
            ? res
            : [];
        }
      })
    );

    return files.reduce((a, f) => a.concat(f), []);
  };
  const files = await getFiles(localPath);

  const fileContents = await Promise.all(
    files.map(async (file) => {
      const content = await readFileAsync(file, 'utf8');
      return { path: file, content };
    })
  );

  // Create a knowledge tree of file dependencies
  const knowledgeTree = {};
  fileContents.forEach(({ path, content }) => {
    let dependencies = [];

    if (
      path.endsWith('.js') ||
      path.endsWith('.ts') ||
      path.endsWith('.tsx') ||
      path.endsWith('.jsx')
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

    knowledgeTree[
      path.replace('/Users/matheus/Desktop/pushinprod/repos/ui/', '')
    ] = {
      source: content,
      dependencies: dependencies,
    };
  });

  console.log('writing json response');

  console.log('Saving to db', { owner, repoName });

  await db.insert(reposTable).values({
    github_user: owner,
    github_repo: repoName,
    knowledge_tree: JSON.stringify(knowledgeTree),
  });

  console.log('Added to db');

  return { success: true, owner, repoName };
};

export const saveRepo = async (repo: string) => {
  const res = await db
    .insert(reposTable)
    .values({ github_repo: 'abc', github_user: 'def' });

  console.log(res);

  return res;
};
