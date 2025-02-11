"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FileHeart, Download, ExternalLink, Folder, FileIcon, Image as LucideImage } from "lucide-react";
import { FileUpload } from "@/app/components/FileUpload";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { FileEntry, isImageFile, splitFilename, shouldShowFile, formatFileSize } from "@/lib/file-utils";

export function FileBrowser() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<FileEntry | null>(null);

  const loadFiles = async () => {
    try {
      const response = await fetch('/api/files');
      if (!response.ok) throw new Error('Failed to fetch files');
      const data = await response.json();
      setFiles(data.files.filter((file: FileEntry) => shouldShowFile(file.name)));
      setError(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleFilesAdded = async (files: File[]) => {
    await handleUpload(files);
  };

  const handleUpload = async (files: File[]) => {
    try {
      // Upload logic here if needed
      await Promise.all(
        files.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          if (!response.ok) throw new Error('Upload failed');
        })
      );
      // Refresh the file list after successful upload
      await loadFiles();
    } catch (error) {
      console.error('Upload error:', error);
      throw error; // Re-throw to let FileUpload component handle the error state
    }
  };

  if (selectedFile && !selectedFile.isDirectory) {
    const fileUrl = `/uploads/${selectedFile.path}`;
    return (
      <div className="space-y-6">
        <div className="mb-4">
          <button 
            onClick={() => setSelectedFile(null)}
            className="text-blue-500 hover:underline flex items-center gap-2"
          >
            <FileHeart className="w-4 h-4" />
            Back to file browser
          </button>
        </div>
        <div className="bg-card rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold mb-4">{selectedFile.name}</h1>
          <div className="space-y-4">
            <div className="text-muted-foreground">
              <p>Size: {formatFileSize(selectedFile.size)}</p>
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
    );
  }

  return (
    <div className="space-y-6">
      <FileUpload 
        onFilesAdded={handleFilesAdded}
        onUpload={handleUpload}
      />
      
      <div className="bg-card rounded-lg shadow-sm overflow-hidden dark:border-1 dark:border-neutral-800">
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
            {files.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <p>No files uploaded yet</p>
                <p className="text-sm mt-2">Drag and drop files above or use the upload button to get started</p>
              </div>
            ) : (
              files.map((file) => (
                file.isDirectory ? (
                  <Link
                    key={file.name}
                    href={`/browse/${file.name}`}
                    className="flex items-center p-4 hover:bg-muted/50 transition-colors gap-4"
                  >
                    <span className="text-muted-foreground">
                      <Folder className="w-4 h-4" />
                    </span>
                    <div className="flex-1 truncate">
                      {file.name}
                    </div>
                  </Link>
                ) : (
                  <button
                    key={file.name}
                    onClick={() => setSelectedFile(file)}
                    className="w-full flex items-center p-4 hover:bg-muted/50 transition-colors gap-4 text-left"
                  >
                    <span className="text-muted-foreground">
                      {isImageFile(file.name) ? (
                        <LucideImage className="w-4 h-4" />
                      ) : (
                        <FileIcon className="w-4 h-4" />
                      )}
                    </span>
                    {isImageFile(file.name) ? (
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
                            src={`/uploads/${file.name}`}
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
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatFileSize(file.size)}
                    </span>
                  </button>
                )
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
} 