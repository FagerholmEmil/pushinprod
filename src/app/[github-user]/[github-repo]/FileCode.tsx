'use client';

import React from 'react';
import { fileExplorerOpenAtom, repoDataAtom, selectedFileAtom } from './state';
import { useAtomValue, useSetAtom } from 'jotai';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getLogo } from './getFileIcon';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from 'react-error-boundary';
import { CodeBlock } from './CodeBlock';

export const FileCode: React.FC = () => {
  const data = useAtomValue(repoDataAtom);
  const selectedFile = useAtomValue(selectedFileAtom);
  const file = selectedFile ? data[selectedFile as keyof typeof data] : null;
  const setOpen = useSetAtom(fileExplorerOpenAtom);

  if (!file || !selectedFile)
    return (
      <Button
        variant="outline"
        className="relative h-14 justify-start rounded-[0.5rem] bg-muted/50 text-sm font-normal text-muted-foreground shadow-none w-full"
        onClick={() => setOpen(true)}
      >
        Open file
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 sm:flex sm:items-center">
          <span className="mr-0.5">⌘</span>K
        </kbd>
      </Button>
    );

  const fileExtension = selectedFile?.split('.').pop() || 'javascript';

  return (
    <div>
      <Alert className="mb-2">
        {getLogo('.' + fileExtension, 'lg')}
        {/* <Termin.al className="h-4 w-4" /> */}
        <AlertTitle>{selectedFile?.split('/').pop()}</AlertTitle>
        <AlertDescription className="text-muted-foreground text-[10px]">
          {selectedFile}
        </AlertDescription>
      </Alert>

      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <React.Suspense
          key={selectedFile}
          fallback={<Skeleton className="w-full h-80" />}
        >
          <CodeBlock source={file.source} fileExtension={fileExtension} />
        </React.Suspense>
      </ErrorBoundary>
    </div>
  );
};
