'use client';

import React from 'react';
import { fileExplorerOpenAtom, repoDataAtom, selectedFileAtom } from './state';
import { useAtomValue, useSetAtom } from 'jotai';
import { codeToHtml } from 'shiki';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getLogo } from './getFileIcon';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface FileCodeProps {}

export const FileCode: React.FC<FileCodeProps> = ({}) => {
  const data = useAtomValue(repoDataAtom);
  const selectedFile = useAtomValue(selectedFileAtom);
  const file = selectedFile ? data[selectedFile as keyof typeof data] : null;
  const setOpen = useSetAtom(fileExplorerOpenAtom);

  if (!file || !selectedFile)
    return (
      <div className="p-4">
        <Button
          variant="outline"
          className="relative h-14 w-full justify-start rounded-[0.5rem] bg-muted/50 text-sm font-normal text-muted-foreground shadow-none w-full"
          onClick={() => setOpen(true)}
        >
          Open a file
          <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </div>
    );

  const fileExtension = selectedFile.split('.').pop() || 'js';

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
      <React.Suspense
        key={selectedFile}
        fallback={<Skeleton className="w-full h-80" />}
      >
        <CodeBlock source={file.source} fileExtension={fileExtension} />
      </React.Suspense>
    </div>
  );
};

const CodeBlock = async ({
  source,
  fileExtension,
}: {
  source: string;
  fileExtension: string;
}) => {
  const out = await codeToHtml(source, {
    lang: fileExtension,
    theme: 'vitesse-dark',
  });

  return (
    <div
      dangerouslySetInnerHTML={{ __html: out }}
      className="[&>pre]:overflow-x-auto [&>pre]:p-4 text-xs"
    />
  );
};
