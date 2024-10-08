'use client';

import React from 'react';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { fileExplorerOpenAtom, repoDataAtom, selectedFileAtom } from './state';
import { getLogo } from './getFileIcon';

interface FileExplorerProps {}

export const FileExplorer: React.FC<FileExplorerProps> = ({}) => {
  const [open, setOpen] = useAtom(fileExplorerOpenAtom);
  const setSelectedFile = useSetAtom(selectedFileAtom);
  const data = useAtomValue(repoDataAtom);

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
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        commandProps={{
          filter: (value, search) => {
            if (value.includes(search)) return 1;
            return 0;
          },
        }}
      >
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
                  {file?.split('/').pop()}
                </p>
                <span className="text-muted-foreground leading-3 text-[10px]">
                  {file}
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
