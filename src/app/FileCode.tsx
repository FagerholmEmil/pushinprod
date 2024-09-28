'use client';

import React from 'react';
import { selectedFileAtom } from './state';
import { useAtomValue } from 'jotai';
import { Label } from '@/components/ui/label';

interface FileCodeProps {}

export const FileCode: React.FC<FileCodeProps> = ({}) => {
  const selectedFile = useAtomValue(selectedFileAtom);

  //   const [code, setCode] = React.useState('')

  //   React.useEffect(() => {
  //     fetch(`/code/${selectedFile}`)
  //       .then((res) => res.text())
  //       .then(setCode)
  //   }, [selectedFile])

  //   console.log(code)

  return (
    <div>
      <Label className="text-secondary-foreground">{selectedFile}</Label>
      <div className="rounded bg-secondary p-2">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Similique,
        harum.
      </div>
    </div>
  );
};
