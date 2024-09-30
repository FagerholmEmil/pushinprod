import { createHighlighterCoreSync, createJavaScriptRegexEngine } from 'shiki';

import vitesseDark from 'shiki/themes/vitesse-dark.mjs';

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

const langs = [
  'javascript',
  'typescript',
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

const shiki = createHighlighterCoreSync({
  themes: [vitesseDark],
  langs: [js, ts, tsx, jsx, css, html, json, markdown, python, bash, sql],
  engine: createJavaScriptRegexEngine(),
});

export const highlightCode = (code: string, language: string) => {
  let highlightedCode = '';

  try {
    highlightedCode = shiki.codeToHtml(code, {
      lang: langs.some((lang) => lang === language) ? language : 'plain',
      theme: 'vitesse-dark',
    });
  } catch (error) {
    console.error(`Error highlighting code: ${error}`);
    highlightedCode = `<pre>${code}</pre>`;
  }

  return highlightedCode;
};
