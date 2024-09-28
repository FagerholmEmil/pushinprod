import { atom } from 'jotai';

export const selectedFileAtom = atom<string | null>(null);

export const fileExplorerOpenAtom = atom(false);
