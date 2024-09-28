import { atom } from 'jotai';

export const selectedFileAtom = atom<string | null>(null);

export const fileExplorerOpenAtom = atom(false);

export const allowedFileExtensionsAtom = atom<string[]>([]);

export const repoDataAtom = atom<
  Record<string, { source: string; dependencies: string[] }>
>({});
