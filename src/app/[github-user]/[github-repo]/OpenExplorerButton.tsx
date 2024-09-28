'use client';

import { useSetAtom } from 'jotai';
import React from 'react';
import { Button } from '@/components/ui/button';
import { fileExplorerOpenAtom } from './state';

interface OpenExplorerButtonProps {}

export const OpenExplorerButton: React.FC<OpenExplorerButtonProps> = ({}) => {
  const setOpen = useSetAtom(fileExplorerOpenAtom);

  return (
    <Button
      variant="outline"
      className="relative h-8 w-full justify-start rounded-[0.5rem] bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-52"
      onClick={() => setOpen(true)}
    >
      Search files
      <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  );
};
