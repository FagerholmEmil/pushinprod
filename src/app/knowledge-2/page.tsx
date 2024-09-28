// @ts-nocheck

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';

const execAsync = promisify(exec);
const readFileAsync = promisify(fs.readFile);

export default async function Home() {
  const repoUrl = 'https://github.com/imMatheus/vercel-ui.git';
  const localPath = './repos/vercel-ui';

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

  return (
    <div className="">
      <pre>{JSON.stringify(knowledgeTree, null, 2)}</pre>
    </div>
  );
}
