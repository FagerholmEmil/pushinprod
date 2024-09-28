import { Sidebar } from './Sidebar';
import { KnowledgeTree } from './KnowledgeTree';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { OpenExplorerButton } from './OpenExplorerButton';

export default async function Home() {
  return (
    <div className="h-screen flex flex-col">
      <header className="border-b p-4 shrink-0 flex justify-between items-center">
        <h1 className="font-medium font-serif text-lg italic">
          Pushin-P<span className="font-black">(rod)</span>
        </h1>
        <div className="flex gap-2 items-center">
          <OpenExplorerButton />
          <Link href="/animated">
            <Button variant="default">Scan Codebase</Button>
          </Link>
        </div>
      </header>
      <ResizablePanelGroup
        direction="horizontal"
        className="flex h-full min-h-0 overflow-hidden"
      >
        <ResizablePanel defaultSize={50}>
          <Sidebar />
        </ResizablePanel>
        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={50}>
          <div className="min-w-0">
            <KnowledgeTree />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
