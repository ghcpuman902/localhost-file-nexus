import { FileBrowser } from "@/app/components/FileBrowser";

export default async function Home() {
  const fileRoot = process.cwd();
  
  return (
    <div className="h-full flex flex-col">
      <FileBrowser fileRoot={fileRoot} />
    </div>
  );
}
