'use client';

import React, { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAtom, useAtomValue } from 'jotai';
import { allowedFileExtensionsAtom, repoDataAtom } from './state';

interface FileSettingsProps {}

export const FileSettings: React.FC<FileSettingsProps> = ({}) => {
  const data = useAtomValue(repoDataAtom);

  const allFileExtensions = useMemo<string[]>(
    () =>
      (
        Array.from(
          new Set(Object.keys(data).map((file) => file.split('.').pop()))
        ) ?? []
      ).filter((ext) => ext !== undefined),
    [data]
  );

  const [allowedFileExtensions, setAllowedFileExtensions] = useAtom(
    allowedFileExtensionsAtom
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-8">
          Filter
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filter which file extensions to show</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {allFileExtensions.map((fileExtension) => (
            <div key={fileExtension} className="flex items-center space-x-2">
              <Label htmlFor="airplane-mode" className="min-w-32">
                {fileExtension}
              </Label>
              <Switch
                id="airplane-mode"
                checked={allowedFileExtensions.includes(fileExtension)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setAllowedFileExtensions([
                      ...allowedFileExtensions,
                      fileExtension,
                    ]);
                  } else {
                    setAllowedFileExtensions(
                      allowedFileExtensions.filter(
                        (ext) => ext !== fileExtension
                      )
                    );
                  }
                }}
              />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
