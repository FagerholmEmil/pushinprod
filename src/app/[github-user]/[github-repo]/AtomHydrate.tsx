'use client';

import React from 'react';
import { useHydrateAtoms } from 'jotai/utils';

import { repoDataAtom } from './state';
import { Provider } from 'jotai';

interface AtomHydrateProps {
  data: Record<string, { source: string; dependencies: string[] }>;
  children: React.ReactNode;
}

export const AtomHydrate: React.FC<AtomHydrateProps> = ({ data, children }) => {
  useHydrateAtoms([[repoDataAtom, data]]);

  return <>{children}</>;
};
