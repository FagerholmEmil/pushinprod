'use server';

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';

const execAsync = promisify(exec);
const readFileAsync = promisify(fs.readFile);

export const cloneRepo = async (repo: string) => {
  console.log('Clone repo');

  let repoUrl = repo;
  if (!repo.startsWith('https://github.com/')) {
    repoUrl = `https://github.com/${repo}`;
  }
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

    knowledgeTree[path] = {
      source: content,
      dependencies: dependencies,
    };
  });

  const writeFileAsync = promisify(fs.writeFile);

  const repoName = repoUrl?.split('/')?.pop()?.replace('.git', '');
  const userName = repoUrl?.split('/')?.slice(-2, -1)[0];
  const fileName = `${userName}-${repoName}.json`;
  const outputPath = path.join('knowledge-tree', fileName);

  console.log('writing json response');

  await fs.promises.mkdir('knowledge-tree', { recursive: true });
  await writeFileAsync(outputPath, JSON.stringify(knowledgeTree, null, 2));

  console.log(`Knowledge tree written to ${outputPath}`);

  return { success: true };
};
