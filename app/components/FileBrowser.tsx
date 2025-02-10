"use client"

import { useEffect, useState } from "react";
import { columns } from "@/components/ui/columns";
import { DataTable } from "@/components/ui/data-table";
import { FileUpload } from "@/app/components/FileUpload";

interface FileEntry {
  name: string;
  isDirectory: boolean;
  size: number;
}

export function FileBrowser() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadFiles = async () => {
    try {
      const response = await fetch('/api/files');
      if (!response.ok) throw new Error('Failed to fetch files');
      const data = await response.json();
      setFiles(data.files);
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

  const handleFilesAdded = (files: File[]) => {
    // Optional: You can handle files being added here if needed
    console.log('Files added:', files);
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

  return (
    <div className="space-y-6">
      <FileUpload 
        onFilesAdded={handleFilesAdded}
        onUpload={handleUpload}
      />
      
      {isLoading ? (
        <div className="bg-muted p-6 rounded-lg text-center">
          <p>Loading files...</p>
          <p className="text-sm text-muted-foreground mt-2">Scanning local upload directory</p>
        </div>
      ) : error ? (
        <div className="bg-destructive/10 text-destructive p-6 rounded-lg shadow-xs">
          <h2 className="text-lg font-semibold mb-2">Error Loading Files</h2>
          <p>Failed to read uploads directory. Please ensure the uploads folder exists and has proper permissions.</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg shadow-xs">
          {files.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <p>No files uploaded yet</p>
              <p className="text-sm mt-2">Drag and drop files above or use the upload button to get started</p>
            </div>
          ) : (
            <DataTable columns={columns} data={files} />
          )}
        </div>
      )}
    </div>
  );
} 