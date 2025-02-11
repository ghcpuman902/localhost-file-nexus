"use client"

import * as React from "react"
import { useDropzone } from "react-dropzone"
import { Upload, FileIcon, X, CheckCircle, AlertCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface FileUploadProps extends React.HTMLAttributes<HTMLDivElement> {
  onFilesAdded: (files: File[]) => void
  onUpload: (files: File[]) => Promise<void>
  maxFiles?: number
}

type FileStatus = "idle" | "uploading" | "success" | "error"

interface FileWithStatus {
  file: File
  status: FileStatus
  progress: number
  error?: string
}

export function FileUpload({
  onFilesAdded,
  onUpload,
  maxFiles = Number.POSITIVE_INFINITY,
  className,
  ...props
}: FileUploadProps) {
  const [files, setFiles] = React.useState<FileWithStatus[]>([])
  const [isUploading, setIsUploading] = React.useState(false)

  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.map((file) => ({
        file,
        status: "idle" as FileStatus,
        progress: 0,
      }))
      const updatedFiles = [...files, ...newFiles].slice(0, maxFiles)
      setFiles(updatedFiles)
      onFilesAdded(updatedFiles.map((f) => f.file))
    },
    [files, maxFiles, onFilesAdded],
  )

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    multiple: true,
    noClick: true,
  })

  const removeFile = (fileToRemove: FileWithStatus) => {
    const updatedFiles = files.filter((file) => file !== fileToRemove)
    setFiles(updatedFiles)
    onFilesAdded(updatedFiles.map((f) => f.file))
  }

  const uploadFiles = async () => {
    setIsUploading(true)
    try {
      await onUpload(files.map((f) => f.file))
      setFiles((prevFiles) =>
        prevFiles.map((file) => ({ ...file, status: "success", progress: 100 })),
      )
      setTimeout(() => {
        setFiles([])
        setIsUploading(false)
      }, 2000)
    } catch (error) {
      setFiles((prevFiles) =>
        prevFiles.map((file) => ({ ...file, status: "error", error: `Upload failed:${'\n'} ${JSON.stringify(error, null, 2)}` })),
      )
      setIsUploading(false)
    }
  }

  // Simulate incremental progress for files that are uploading.
  const simulateFileProgress = React.useCallback(() => {
    const interval = setInterval(() => {
      setFiles((prevFiles) =>
        prevFiles.map((file) => ({
          ...file,
          progress: file.progress < 90 ? file.progress + 10 : file.progress,
          status:
            file.progress < 100 && file.status === "idle"
              ? "uploading"
              : file.status,
        })),
      )
    }, 500)

    return () => clearInterval(interval)
  }, [])

  React.useEffect(() => {
    if (isUploading) {
      const cleanup = simulateFileProgress()
      return cleanup
    }
  }, [isUploading, simulateFileProgress])

  const splitFilename = (filename: string) => {
    const parts = filename.split(".")
    const ext = parts.pop() || ""
    const name = parts.join(".")
    return { name, ext }
  }

  return (
    <div className={cn("w-full", className)} {...props}>
      <div
        {...getRootProps()}
        className={cn(
          "relative flex flex-col items-center w-full h-64 p-2 transition-colors outline-2 outline-dashed rounded-lg",
          isDragActive
            ? "outline-primary hover:outline-primary"
            : "outline-foreground/25 hover:outline-foreground/25"
        )}
      >
        <input {...getInputProps()} />
        <Button variant="secondary" className="absolute top-2 left-2 z-10 bg-secondary hover:bg-secondary/60 hover:cursor-pointer" onClick={open}>
          Select Files
        </Button>
        {files.length > 0 && !isUploading && (
          <Button className="absolute top-2 right-2 z-10 bg-primary hover:bg-primary/80 hover:cursor-pointer" onClick={uploadFiles}>
            Upload Files
          </Button>
        )}
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-2">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <p className="font-semibold">Drag & drop files here</p>
          </div>
        ) : (
          <div className="w-full h-full overflow-auto pt-12">
            <ul className="space-y-1">
              {files.map((fileWithStatus, index) => {
                const { name, ext } = splitFilename(fileWithStatus.file.name)
                return (
                  <li key={index} className="flex items-center justify-between h-8 py-1 px-2 rounded-md bg-muted">
                    <div className="flex items-center space-x-2 flex-1 min-w-0 overflow-hidden">
                      <FileIcon className="w-4 h-4 shrink-0" />
                      <div className="flex-1 flex items-center min-w-0">
                        <span className="text-sm truncate">{name}</span>
                        <span className="text-sm text-muted-foreground flex-1 text-left">.{ext}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      {fileWithStatus.status === "uploading" && (
                        <Progress value={fileWithStatus.progress} className="w-20 h-2" />
                      )}
                      {fileWithStatus.status === "success" && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      {fileWithStatus.status === "error" && (
                        <div className="flex items-center space-x-1 text-red-500">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-xs">{fileWithStatus.error}</span>
                        </div>
                      )}
                      {!isUploading && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeFile(fileWithStatus)}
                        >
                          <X className="w-4 h-4" />
                          <span className="sr-only">Remove file</span>
                        </Button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
} 