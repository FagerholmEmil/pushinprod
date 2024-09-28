import { Sidebar } from './Sidebar'
import { KnowledgeTree } from './KnowledgeTree'

export default async function Home() {
  return (
    <div className="h-screen flex flex-col">
      <header className="border-b p-4 shrink-0">
        <h1 className="font-medium font-serif text-lg italic">
          Pushin-P<span className="font-black">(rod)</span>
        </h1>
      </header>
      <main className="flex h-full min-h-0 overflow-hidden">
        <Sidebar />
        <div className="w-full min-w-0">
          <KnowledgeTree />
        </div>
      </main>
    </div>
  )
}
