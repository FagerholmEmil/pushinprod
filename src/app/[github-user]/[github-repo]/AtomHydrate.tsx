'use client';

import React from 'react';
import { useHydrateAtoms } from 'jotai/utils';

import { repoDataAtom } from './state';
import { KnowledgeTree } from '@/types';

interface AtomHydrateProps {
  data: KnowledgeTree;
  children: React.ReactNode;
}

export const AtomHydrate: React.FC<AtomHydrateProps> = ({ data, children }) => {
  useHydrateAtoms([[repoDataAtom, data]]);

  return <>{children}</>;
};
