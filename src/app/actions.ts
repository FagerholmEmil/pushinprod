'use server';
// @ts-nocheck
import { Octokit } from '@octokit/rest';
import fs from 'fs/promises';
import path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';

const octokit = new Octokit({
  auth: process.env.GITHUB_AUTH_TOKEN, // Add your auth token here
});

export const cloneRepo = async (repo: string) => {
  console.log('Fetching repo');

  let [owner, repoName] = repo.split('/');
  if (!owner || !repoName) {
    throw new Error('Invalid repository format. Use owner/repo');
  }

  console.log('Owner:', owner, 'Repo:', repoName);

  const knowledgeTree = {};

  async function processContent(item) {
    if (item.type === 'file') {
      const { data: fileContent } = await octokit.rest.repos.getContent({
        owner,
        repo: repoName,
        path: item.path,
      });

      const content = Buffer.from(fileContent.content, 'base64').toString(
        'utf-8'
      );
      let dependencies = [];

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

      for (const subItem of dirContent) {
        await processContent(subItem);
      }
    }
  }

  const { data: rootContent } = await octokit.rest.repos.getContent({
    owner,
    repo: repoName,
    path: '',
  });

  for (const item of rootContent) {
    await processContent(item);
  }

  const fileName = `${owner}-${repoName}.json`;
  const outputPath = path.join('knowledge-tree', fileName);

  console.log('writing json response');

  await fs.mkdir('knowledge-tree', { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(knowledgeTree, null, 2));

  console.log(`Knowledge tree written to ${outputPath}`);

  return { success: true };
};
