import { FileBrowser } from "@/app/components/FileBrowser";
import { SyncedTextarea } from "@/app/components/SyncedTextarea";

export default async function Home() {

  return (
      <main className="flex-1 flex flex-col lg:flex-row lg:space-x-8 space-y-12 lg:space-y-0">
        <section className="lg:flex-1">
          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-2">File Exchange</h2>
            <p className="text-sm text-muted-foreground">
              Web interface for browsing and uploading files to the host machine&apos;s <code className="bg-muted px-1 rounded">/public/uploads</code> folder.
            </p>
          </div>
          <FileBrowser />
        </section>

        <section className="lg:flex-1">
          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-2">Shared Clipboard</h2>
            <p className="text-sm text-muted-foreground">
              Sync text and commands in real-time to aid in debugging. Useful for terminal commands and code snippets.
            </p>
          </div>
          <SyncedTextarea />
        </section>
      </main>
  );
}
