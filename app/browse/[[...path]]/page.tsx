import { readdir, stat } from "fs/promises"
import { join } from "path"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { FileHeart, Download, ExternalLink, Folder, FileIcon, Image as LucideImage } from "lucide-react"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { FileEntry, isImageFile, splitFilename, shouldShowFile, formatFileSize } from "@/lib/file-utils"

export default async function Page({ 
  params 
}: { 
  params: Promise<{ path: string[] }> 
}) {
  const resolvedParams = await params
  const encodedPath = resolvedParams.path || []
  const decodedPath = encodedPath.map(segment => decodeURIComponent(segment))
  const basePath = join(process.cwd(), "public", "uploads")
  const currentPath = decodedPath.length > 0 
    ? join(basePath, ...decodedPath)
    : basePath

  // console.log('Attempting to access path:', {
  //   basePath,
  //   currentPath,
  //   requestedPath: decodedPath
  // })

  if (!currentPath.startsWith(basePath)) {
    console.log('Access denied: Path traversal attempt detected', {
      currentPath,
      basePath
    })
    notFound()
  }

  try {
    // First try without trailing slash
    const stats = await stat(currentPath)

    let isDirectory = stats.isDirectory()
    
    // Handle case where both file and directory exist with same name
    if (!isDirectory) {
      try {
        const dirStats = await stat(currentPath + '/')
        isDirectory = dirStats.isDirectory()
      } catch (error) {
        console.log('Error accessing directory:', {
          error,
          currentPath
        })
      }
    }

    if (!isDirectory) {
      const fileUrl = `/uploads/${encodedPath.join("/")}`
      return (
        <>
          <div className="mb-4">
            <Link href="/browse" className="text-blue-500 hover:underline flex items-center gap-2">
              <FileHeart className="w-4 h-4" />
              Back to file browser
            </Link>
          </div>
          <div className="bg-card rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold mb-4">{decodedPath[decodedPath.length - 1]}</h1>
            <div className="space-y-4">
              <div className="text-muted-foreground">
                <p>Size: {formatFileSize(stats.size)}</p>
                <p>Last modified: {stats.mtime.toLocaleString()}</p>
              </div>
              <div className="flex gap-4">
                <a 
                  href={fileUrl} 
                  target="_blank"
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open File
                </a>
                <a 
                  href={fileUrl} 
                  download
                  className="bg-accent text-accent-foreground px-4 py-2 rounded-md hover:bg-accent/90 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </div>
            </div>
          </div>
        </>
      )
    }

    const entries = await readdir(currentPath, { withFileTypes: true })
    const files: FileEntry[] = await Promise.all(
      entries
        .filter(entry => shouldShowFile(entry.name))
        .map(async (entry) => {
          const fullPath = join(currentPath, entry.name)
          const stats = await stat(fullPath)
          return {
            name: entry.name,
            isDirectory: entry.isDirectory(),
            size: stats.size,
            path: [...encodedPath, encodeURIComponent(entry.name)].join("/")
          }
        })
    )

    files.sort((a, b) => a.isDirectory === b.isDirectory 
      ? a.name.localeCompare(b.name) 
      : a.isDirectory ? -1 : 1
    )

    return (
      <div className="space-y-6">
        <div className="bg-card rounded-lg shadow-sm overflow-hidden dark:border-1 dark:border-neutral-800">
          <div className="border-b bg-muted/50">
            <div className="p-4">
              <nav className="flex items-center gap-2 text-sm">
                <Link href="/browse" className="text-muted-foreground hover:text-foreground font-medium">
                  uploads
                </Link>
                {encodedPath.length > 0 && (
                  <>
                    <span className="text-muted-foreground">/</span>
                    {encodedPath.length > 3 ? (
                      <>
                        <Link 
                          href={`/browse/${encodedPath[0]}`}
                          className="text-muted-foreground hover:text-foreground font-medium"
                        >
                          {decodeURIComponent(encodedPath[0])}
                        </Link>
                        <span className="text-muted-foreground">/</span>
                        
                        <div className="relative group">
                          <span className="cursor-pointer text-muted-foreground hover:text-foreground">...</span>
                          <div className="hidden group-hover:block absolute left-0 top-full mt-1 bg-popover text-popover-foreground shadow-lg rounded-md py-1 min-w-[150px] z-50 border">
                            {encodedPath.slice(1, -2).map((segment, index) => (
                              <Link 
                                key={segment}
                                href={`/browse/${encodedPath.slice(0, index + 2).join("/")}`}
                                className="block px-3 py-1.5 hover:bg-muted text-sm truncate"
                              >
                                {decodeURIComponent(segment)}
                              </Link>
                            ))}
                          </div>
                        </div>
                        <span className="text-muted-foreground">/</span>
                        
                        {encodedPath.slice(-2).map((segment, index) => (
                          <span key={segment} className="flex items-center gap-2">
                            <Link 
                              href={`/browse/${encodedPath.slice(0, encodedPath.length - 1 + index).join("/")}`}
                              className="text-muted-foreground hover:text-foreground font-medium max-w-[150px] truncate md:max-w-[200px]"
                            >
                              {decodeURIComponent(segment)}
                            </Link>
                            {index === 0 && <span className="text-muted-foreground">/</span>}
                          </span>
                        ))}
                      </>
                    ) : (
                      encodedPath.map((segment, index) => (
                        <span key={segment} className="flex items-center gap-2">
                          <Link 
                            href={`/browse/${encodedPath.slice(0, index + 1).join("/")}`}
                            className="text-muted-foreground hover:text-foreground font-medium max-w-[150px] truncate md:max-w-[200px]"
                          >
                            {decodeURIComponent(segment)}
                          </Link>
                          {index < encodedPath.length - 1 && <span className="text-muted-foreground">/</span>}
                        </span>
                      ))
                    )}
                  </>
                )}
              </nav>
            </div>
          </div>

          <div className="divide-y divide-border">
            {files.map((file) => (
              <Link
                key={file.name}
                href={file.isDirectory ? `/browse/${file.path}` : `/uploads/${file.path}`}
                className="flex items-center p-4 hover:bg-muted/50 transition-colors gap-4"
              >
                <span className="text-muted-foreground">
                  {file.isDirectory ? (
                    <Folder className="w-4 h-4" />
                  ) : isImageFile(file.name) ? (
                    <LucideImage className="w-4 h-4" />
                  ) : (
                    <FileIcon className="w-4 h-4" />
                  )}
                </span>
                {file.isDirectory ? (
                  <div className="flex-1 truncate">
                    {file.name}
                  </div>
                ) : isImageFile(file.name) ? (
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <div className="flex-1 flex items-center min-w-0">
                        {(() => {
                          const { name, ext } = splitFilename(file.name)
                          return (
                            <>
                              <span className="truncate">{name}</span>
                              <span className="text-muted-foreground">.{ext}</span>
                            </>
                          )
                        })()}
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <Image
                        src={`/uploads/${file.path}`}
                        alt={file.name}
                        width={320}
                        height={240}
                        className="rounded-md max-h-48 object-contain mx-auto"
                      />
                    </HoverCardContent>
                  </HoverCard>
                ) : (
                  <div className="flex-1 flex items-center min-w-0">
                    {(() => {
                      const { name, ext } = splitFilename(file.name)
                      return (
                        <>
                          <span className="truncate">{name}</span>
                          <span className="text-muted-foreground">.{ext}</span>
                        </>
                      )
                    })()}
                  </div>
                )}
                {!file.isDirectory && (
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatFileSize(file.size)}
                  </span>
                )}
              </Link>
            ))}
            {files.length === 0 && (
              <div className="p-4 text-center text-muted-foreground">
                Empty directory
              </div>
            )}
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Failed to access path:', {
      error,
      currentPath,
      decodedPath
    })
    notFound()
  }
}
