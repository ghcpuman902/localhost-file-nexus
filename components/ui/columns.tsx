"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { FileIcon, FolderIcon } from "lucide-react"
import { formatBytes } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export type FileEntry = {
  name: string
  isDirectory: boolean
  size: number
}

export const columns: ColumnDef<FileEntry>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const file = row.original
      return (
        <div className="flex items-center space-x-2">
          {file.isDirectory ? <FolderIcon className="h-4 w-4" /> : <FileIcon className="h-4 w-4" />}
          <span>{file.name}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "size",
    header: "Size",
    cell: ({ row }) => {
      const file = row.original
      return file.isDirectory ? "-" : formatBytes(file.size)
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const file = row.original
      return (
        <Button asChild variant="ghost" size="sm">
          <Link href={`${file.isDirectory ? "/browse" : "/uploads"}/${file.name}`}>
            {file.isDirectory ? "Open" : "View"}
          </Link>
        </Button>
      )
    },
  },
]

