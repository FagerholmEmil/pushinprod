'use client';

import { cn } from '@/lib/utils';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import React, { useState } from 'react';
import { FileExplorer } from './FileExplorer';
import { FileCode } from './FileCode';
import { FileChat } from './(chat)/FileChat';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';

interface SidebarProps {}
export const Sidebar: React.FC<SidebarProps> = ({}) => {
  return (
    <aside className={cn('flex flex-col overflow-hidden h-full')}>
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel minSize={10} className="!overflow-y-auto">
          <div className="p-4">
            <FileExplorer />

            <FileCode />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel className="!overflow-y-auto" minSize={10}>
          <FileChat />
        </ResizablePanel>
      </ResizablePanelGroup>
    </aside>
  );
};
