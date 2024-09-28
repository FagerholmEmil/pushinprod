'use client';

import React from 'react';
import { repoDataAtom, selectedFileAtom } from './state';
import { useAtomValue } from 'jotai';
import { codeToHtml } from 'shiki';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getLogo } from './getFileIcon';
import { Skeleton } from '@/components/ui/skeleton';

interface FileCodeProps {}

export const FileCode: React.FC<FileCodeProps> = ({}) => {
  const data = useAtomValue(repoDataAtom);
  const selectedFile = useAtomValue(selectedFileAtom);
  const file = selectedFile ? data[selectedFile as keyof typeof data] : null;

  if (!file || !selectedFile) return <p>No file selected</p>;

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
