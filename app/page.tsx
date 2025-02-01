import { FileBrowser } from "@/app/components/FileBrowser";
import { SyncedTextarea } from "@/app/components/SyncedTextarea";

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <main className="flex-1 space-y-12">
        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-2">File Exchange</h2>
            <p className="text-sm text-muted-foreground">
              Share files between devices on your local network. Access this page from other devices using your LAN IP address.
            </p>
          </div>
          <FileBrowser />
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-2">Shared Clipboard</h2>
            <p className="text-sm text-muted-foreground">
              Sync text, commands, and outputs between devices in real-time. Perfect for sharing terminal outputs or configuration snippets.
            </p>
          </div>
          <SyncedTextarea />
        </section>
      </main>
    </div>
  );
}
