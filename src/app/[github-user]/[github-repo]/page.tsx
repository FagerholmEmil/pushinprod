import { Sidebar } from './Sidebar';
import { KnowledgeTree } from './KnowledgeTree';
import { Button, buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { OpenExplorerButton } from './OpenExplorerButton';
import { FileSettings } from './FileSettings';
import { useParams, notFound } from 'next/navigation';
import { getFileData } from './actions';
import { AtomHydrate } from './AtomHydrate';
import { cn } from '@/lib/utils';

export default async function Home({
  params,
}: {
  params: { 'github-user': string; 'github-repo': string };
}) {
  console.log(params);

  const { 'github-user': githubUser, 'github-repo': githubRepo } = params;

  const fileData = await getFileData(githubUser, githubRepo);

  if (!fileData) {
    console.log('Not found', params);

    notFound();
  }

  return (
    <AtomHydrate data={fileData}>
      <div className="h-screen flex flex-col">
        <header className="border-b p-4 shrink-0 flex justify-between items-center">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-lg font-black text-center font-serif italic"
            >
              Pushin-p<span className="text-theme">(rod)</span>
            </Link>

            <span className="text-sm ml-4 tracking-wider italic text-muted-foreground">
              {githubUser}/{githubRepo}
            </span>
          </div>
          <div className="flex gap-2 items-center">
            <OpenExplorerButton />
            <FileSettings />
            <Link
              href="/animated"
              className={cn(
                buttonVariants({
                  variant: 'default',
                  size: 'sm',
                }),
                'h-8'
              )}
            >
              Scan Codebase
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
            <div className="min-w-0 h-full">
              <KnowledgeTree />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </AtomHydrate>
  );
}
