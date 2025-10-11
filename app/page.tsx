import { FileBrowser } from "@/app/components/FileBrowser";
import { SyncedTextarea } from "@/app/components/SyncedTextarea";

export default async function Home() {
  const fileRoot = process.cwd();
  
  return (
    <div className="h-full flex flex-col lg:flex-row gap-12 lg:gap-8">
      <section className="flex-1 min-h-0 flex flex-col">
        <h2 className="text-2xl font-bold mb-4 shrink-0">File Exchange</h2>
        <FileBrowser fileRoot={fileRoot} />
      </section>

      <section className="flex-1 min-h-0 flex flex-col">
        <h2 className="text-2xl font-bold mb-4 shrink-0">Shared Clipboard</h2>
        <SyncedTextarea />
      </section>
    </div>
  );
}
