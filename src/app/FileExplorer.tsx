'use client';

import React from 'react';

import data from './data.json';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useSetAtom } from 'jotai';
import { selectedFileAtom } from './state';
import { getLogo } from './getFileIcon';

interface FileExplorerProps {}

export const FileExplorer: React.FC<FileExplorerProps> = ({}) => {
  const [open, setOpen] = React.useState(false);
  const setSelectedFile = useSetAtom(selectedFileAtom);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <>
      {/* <p className="text-sm text-muted-foreground">
        Press{' '}
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>J
        </kbd>
      </p> */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Files">
            {Object.keys(data).map((file) => (
              <CommandItem
                key={file}
                onSelect={() => {
                  setSelectedFile(file);
                  setOpen(false);
                }}
              >
                {getLogo(file)}
                <p className="mr-1 break-keep text-sm">
                  {file
                    .replace(
                      '/Users/matheus/Desktop/pushinprod/repos/vercel-ui',
                      ''
                    )
                    .split('/')
                    .pop()}
                </p>
                <span className="text-muted-foreground leading-3 text-[10px]">
                  {file.replace(
                    '/Users/matheus/Desktop/pushinprod/repos/vercel-ui',
                    ''
                  )}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
        </CommandList>
      </CommandDialog>
    </>
  );
};
