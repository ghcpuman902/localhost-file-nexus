"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { Upload, Folder, FileIcon, Image as LucideImage, ExternalLink, Download, ChevronRight } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { isImageFile, splitFilename, shouldShowFile, formatFileSize } from "@/lib/file-utils";

type UnifiedStatus = 'server' | 'idle' | 'uploading' | 'success' | 'error'

interface UnifiedItem {
  key: string
  name: string
  size: number
  isDirectory: boolean
  url?: string
  status: UnifiedStatus
  progress?: number
  error?: string
  file?: File
  addedAt: number
}

const generateItemKey = (name: string, size: number) => `${name}:${size}`

const Breadcrumb = ({ fileRoot }: { fileRoot?: string }) => {
  const uploadsPath = fileRoot ? `${fileRoot}/public/uploads` : 'public/uploads'
  
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 px-4 py-2 bg-muted/30 rounded-md">
      <span className="font-medium text-foreground">{fileRoot || 'Repository Root'}</span>
      <ChevronRight className="w-4 h-4" />
      <span className="text-muted-foreground">public</span>
      <ChevronRight className="w-4 h-4" />
      <span className="text-muted-foreground">uploads</span>
    </div>
  )
}

export function FileBrowser({ fileRoot }: { fileRoot?: string }) {
  const [itemsByKey, setItemsByKey] = useState<Map<string, UnifiedItem>>(new Map())
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedItem, setSelectedItem] = useState<UnifiedItem | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const upsertItem = useCallback((item: UnifiedItem) => {
    setItemsByKey(prev => {
      const next = new Map(prev)
      next.set(item.key, item)
      return next
    })
  }, [])

  const markItem = useCallback((key: string, updates: Partial<UnifiedItem>) => {
    setItemsByKey(prev => {
      const existing = prev.get(key)
      if (!existing) return prev
      const next = new Map(prev)
      next.set(key, { ...existing, ...updates })
      return next
    })
  }, [])

  const refreshFiles = useCallback(async () => {
    try {
      const response = await fetch('/api/files')
      if (!response.ok) throw new Error('Failed to fetch files')
      const data = await response.json()

      setItemsByKey(prev => {
        const next = new Map(prev)
        for (const f of data.files as Array<{ name: string; isDirectory: boolean; size: number }>) {
          if (!shouldShowFile(f.name)) continue
          const key = generateItemKey(f.name, f.size)
          const existing = next.get(key)
          const base: UnifiedItem = {
            key,
            name: f.name,
            size: f.size,
            isDirectory: f.isDirectory,
            url: `/uploads/${f.name}`,
            status: 'server',
            addedAt: existing?.addedAt ?? Date.now()
          }
          next.set(key, existing ? { ...existing, ...base, status: 'server', progress: undefined, error: undefined, file: undefined } : base)
        }
        return next
      })
      setError(null)
    } catch (e) {
      setError(e as Error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshFiles()
  }, [refreshFiles])

  const handleAddFiles = useCallback((files: File[]) => {
    setItemsByKey(prev => {
      const next = new Map(prev)
      let offset = 0
      for (const file of files) {
        const key = generateItemKey(file.name, file.size)
        const existing = next.get(key)
        if (existing && (existing.status === 'server' || existing.status === 'idle' || existing.status === 'uploading')) {
          // skip duplicates while pending or already on server
          continue
        }
        next.set(key, {
          key,
          name: file.name,
          size: file.size,
          isDirectory: false,
          status: 'idle',
          progress: 0,
          file,
          addedAt: Date.now() + (offset++)
        })
      }
      return next
    })
  }, [])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return
    handleAddFiles(acceptedFiles)
  }, [handleAddFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    noClick: true
  })

  const handleOpenPicker = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    if (files.length === 0) return
    handleAddFiles(files)
    // reset input so selecting the same file again fires change
    e.currentTarget.value = ""
  }, [handleAddFiles])

  const uploadSingle = useCallback(async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await fetch('/api/upload', { method: 'POST', body: formData })
    if (!response.ok) throw new Error('Upload failed')
  }, [])

  const handleUploadAll = useCallback(async () => {
    setIsUploading(true)
    const items = Array.from(itemsByKey.values())
    for (const item of items) {
      if (item.status === 'idle' || item.status === 'error') {
        markItem(item.key, { status: 'uploading', progress: 10 })
        try {
          await uploadSingle(item.file as File)
          markItem(item.key, { status: 'success', progress: 100 })
        } catch (e) {
          markItem(item.key, { status: 'error', error: (e as Error).message, progress: 0 })
        }
      }
    }
    await refreshFiles()
    setIsUploading(false)
  }, [itemsByKey, markItem, refreshFiles, uploadSingle])

  const handleClearAll = useCallback(() => {
    setItemsByKey(prev => {
      const next = new Map<string, UnifiedItem>()
      for (const item of prev.values()) {
        if (item.status === 'server') next.set(item.key, item)
      }
      return next
    })
  }, [])

  const visibleItems = useMemo(() => {
    const all = Array.from(itemsByKey.values())
    const pendings = all.filter(i => i.status !== 'server').sort((a, b) => b.addedAt - a.addedAt)
    const servers = all.filter(i => i.status === 'server').sort((a, b) => b.addedAt - a.addedAt)
    return [...pendings, ...servers]
  }, [itemsByKey])

  const hasPendings = useMemo(() => visibleItems.some(i => i.status !== 'server'), [visibleItems])

  if (selectedItem && !selectedItem.isDirectory && selectedItem.status === 'server') {
    const fileUrl = selectedItem.url || `/uploads/${selectedItem.name}`
    return (
      <div className="flex-1 min-h-0 overflow-y-scroll space-y-6">
        <div className="mb-4">
          <button
            onClick={() => setSelectedItem(null)}
            className="text-blue-500 hover:underline flex items-center gap-2"
            aria-label="Back to file browser"
          >
            Back to file browser
          </button>
        </div>
        <div className="bg-card rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold mb-4">{selectedItem.name}</h1>
          <div className="space-y-4">
            <div className="text-muted-foreground">
              <p>Size: {formatFileSize(selectedItem.size)}</p>
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
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-scroll space-y-6">
      <Breadcrumb fileRoot={fileRoot} />
      <div
        {...getRootProps()}
        className={`relative bg-card rounded-lg shadow-sm overflow-hidden dark:border-1 dark:border-neutral-800 ${isDragActive ? 'ring-2 ring-primary/40 bg-muted/40' : ''}`}
        aria-live="polite"
        role="status"
      >
        <input {...getInputProps()} />

        {hasPendings && (
          <div className="sticky top-0 z-10 flex items-center justify-between gap-2 p-2 bg-card/90 backdrop-blur border-b">
            <div className="text-sm text-muted-foreground">Pending files ready to upload</div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearAll}
                disabled={isUploading}
                className="px-3 py-1 rounded-md bg-muted hover:bg-muted/80 disabled:opacity-50"
              >
                Clear all
              </button>
              <button
                onClick={handleUploadAll}
                disabled={isUploading}
                className="px-3 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                Upload all
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="p-4 text-center">
            <p>Loading files...</p>
            <p className="text-sm text-muted-foreground mt-2">Scanning local upload directory</p>
          </div>
        ) : error ? (
          <div className="p-4 text-destructive">
            <h2 className="text-lg font-semibold mb-2">Error Loading Files</h2>
            <p>Failed to read uploads directory. Please ensure the uploads folder exists and has proper permissions.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            <button
              onClick={handleOpenPicker}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpenPicker() }}
              tabIndex={0}
              aria-label="Add files"
              className="w-full flex items-center p-4 hover:bg-muted/50 transition-colors gap-4 text-left"
            >
              <span className="text-muted-foreground"><Upload className="w-4 h-4" /></span>
              <div className="flex-1 truncate">Add files…</div>
              <span className="text-sm text-muted-foreground whitespace-nowrap">Choose</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileInputChange}
              aria-hidden="true"
            />

            {visibleItems.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <p>No files yet</p>
                <p className="text-sm mt-2">Use “Add files…” or drag and drop anywhere on this panel</p>
              </div>
            ) : (
              visibleItems.map((item) => (
                item.isDirectory ? (
                  <Link
                    key={item.key}
                    href={`/browse/${item.name}`}
                    className="flex items-center p-4 hover:bg-muted/50 transition-colors gap-4"
                  >
                    <span className="text-muted-foreground">
                      <Folder className="w-4 h-4" />
                    </span>
                    <div className="flex-1 truncate">{item.name}</div>
                  </Link>
                ) : (
                  <UnifiedFileItem
                    key={item.key}
                    item={item}
                    onOpen={() => {
                      if (item.status === 'server') setSelectedItem(item)
                    }}
                  />
                )
              ))
            )}
          </div>
        )}

        {isDragActive && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-sm text-primary-foreground">
            <div className="px-3 py-1 rounded-md bg-primary/80">Drop files to add</div>
          </div>
        )}
      </div>
    </div>
  )
}

const UnifiedFileItem = ({ item, onOpen }: { item: UnifiedItem, onOpen: () => void }) => {
  const isPending = item.status !== 'server'
  const className = `w-full flex items-center p-4 transition-colors gap-4 text-left ${isPending ? 'opacity-60' : 'hover:bg-muted/50'}`

  return (
    <button
      onClick={() => { if (!isPending) onOpen() }}
      className={className}
      tabIndex={0}
      aria-label={isPending ? `${item.name} pending` : `Open ${item.name}`}
      onKeyDown={(e) => { if (!isPending && (e.key === 'Enter' || e.key === ' ')) onOpen() }}
    >
      <span className="text-muted-foreground">
        {isImageFile(item.name) ? (
          <LucideImage className="w-4 h-4" />
        ) : (
          <FileIcon className="w-4 h-4" />
        )}
      </span>
      {isImageFile(item.name) ? (
        <HoverCard>
          <HoverCardTrigger asChild>
            <div className="flex-1 flex items-center min-w-0">
              {(() => {
                const { name, ext } = splitFilename(item.name)
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
            {item.url && (
              <Image
                src={item.url}
                alt={item.name}
                width={320}
                height={240}
                className="rounded-md max-h-48 object-contain mx-auto"
              />
            )}
          </HoverCardContent>
        </HoverCard>
      ) : (
        <div className="flex-1 flex items-center min-w-0">
          {(() => {
            const { name, ext } = splitFilename(item.name)
            return (
              <>
                <span className="truncate">{name}</span>
                <span className="text-muted-foreground">.{ext}</span>
              </>
            )
          })()}
        </div>
      )}

      <div className="flex items-center gap-3">
        {isPending && (
          <span className="text-xs rounded-md px-2 py-0.5 bg-muted text-muted-foreground">
            {item.status === 'idle' && 'Pending'}
            {item.status === 'uploading' && 'Uploading'}
            {item.status === 'success' && 'Uploaded'}
            {item.status === 'error' && 'Error'}
          </span>
        )}
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {formatFileSize(item.size)}
        </span>
      </div>
    </button>
  )
}