import {
  type BundledLanguage,
  type BundledTheme,
  createHighlighter,
  type HighlighterGeneric,
} from 'shiki';

import js from 'shiki/langs/javascript.mjs';
import ts from 'shiki/langs/typescript.mjs';
import tsx from 'shiki/langs/tsx.mjs';
import jsx from 'shiki/langs/jsx.mjs';
import css from 'shiki/langs/css.mjs';
import html from 'shiki/langs/html.mjs';
import json from 'shiki/langs/json.mjs';
import markdown from 'shiki/langs/markdown.mjs';
import python from 'shiki/langs/python.mjs';
import bash from 'shiki/langs/bash.mjs';
import sql from 'shiki/langs/sql.mjs';

let highlighterPromise: Promise<
  HighlighterGeneric<BundledLanguage, BundledTheme>
> | null = null;

const langs = [
  'js',
  'ts',
  'tsx',
  'jsx',
  'css',
  'html',
  'json',
  'markdown',
  'python',
  'bash',
  'sql',
];

const getHighlighter = async () => {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['vitesse-dark'],
      langs: [js, ts, tsx, jsx, css, html, json, markdown, python, bash, sql],
    });
  }
  return highlighterPromise;
};

export const CodeBlock = async ({
  source,
  fileExtension,
}: {
  source: string;
  fileExtension: string;
}) => {
  const highlighter = await getHighlighter();

  let out;
  try {
    out = highlighter.codeToHtml(source, {
      lang: langs.some((lang) => lang === fileExtension)
        ? fileExtension
        : 'plain',
      theme: 'vitesse-dark',
    });
  } catch (error) {
    console.error(`Error highlighting code: ${error}`);
    out = `<pre>${source}</pre>`;
  }

  return (
    <div
      dangerouslySetInnerHTML={{ __html: out }}
      className="[&>pre]:overflow-x-auto [&>pre]:p-4 text-xs"
    />
  );
};
