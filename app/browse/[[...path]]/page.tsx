import { FileBrowser } from "@/app/components/FileBrowser"

export default async function Page({ 
  params 
}: { 
  params: Promise<{ path: string[] }> 
}) {
  const resolvedParams = await params
  const encodedPath = resolvedParams.path || []
  // Decode the URL-encoded path segments
  const decodedPath = encodedPath.map(segment => decodeURIComponent(segment))
  const currentPath = decodedPath.join("/")
  const fileRoot = process.cwd()

  return (
    <div className="h-full flex flex-col">
      <FileBrowser fileRoot={fileRoot} currentPath={currentPath} />
    </div>
  )
}
