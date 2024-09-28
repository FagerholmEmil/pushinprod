'use server';

import fs from 'fs';
import path from 'path';

export async function getFileData(githubUser: string, githubRepo: string) {
  const fileName = `${githubUser}-${githubRepo}.json`;
  const filePath = path.join(process.cwd(), 'knowledge-tree', fileName);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContent);
}
