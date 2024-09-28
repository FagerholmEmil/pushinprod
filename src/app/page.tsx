import { Sidebar } from './Sidebar';
import { KnowledgeTree } from './KnowledgeTree';
import { Button } from "@/components/ui/button";

export default async function Home() {
  return (
    <div className="h-screen flex flex-col">
      <header className="border-b p-4 shrink-0 flex justify-between items-center">
        <h1 className="font-medium font-serif text-lg italic">
          Pushin-P<span className="font-black">(rod)</span>
        </h1>
        <Button variant="default">Scan Codebase</Button>
      </header>
      <main className="flex h-full min-h-0 overflow-hidden">
        <Sidebar />
        <div className="w-full min-w-0">
          <KnowledgeTree />
        </div>
      </main>
    </div>
  );
}
