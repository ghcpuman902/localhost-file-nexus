"use client"

import { useState, useEffect, useCallback } from "react"
import { Copy, FileDiff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

export function SyncedTextarea() {
  const { toast } = useToast()
  const [syncedContent, setSyncedContent] = useState("")
  const [latestDiff, setLatestDiff] = useState("")

  const handleSync = useCallback(async (content: string) => {
    setSyncedContent(content)
    await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    })
  }, [])

  const handleCopy = async () => {
    try {
      const contentToCopy = syncedContent.trim()
      if (!contentToCopy) {
        toast({
          title: "Nothing to copy",
          description: "The content is empty",
          variant: "destructive",
        })
        return
      }

      await navigator.clipboard.writeText(contentToCopy)
      toast({
        title: "Copied!",
        description: "Content copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to copy content:${'\n'} ${JSON.stringify(error, null, 2)}`,
        variant: "destructive",
      })
    }
  }

  const handleCopyDiff = async () => {
    try {
      if (!latestDiff) {
        toast({
          title: "Nothing to copy",
          description: "No new content to copy",
          variant: "destructive",
        })
        return
      }

      await navigator.clipboard.writeText(latestDiff)
      toast({
        title: "Copied!",
        description: "Latest update copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to copy content:${'\n'} ${JSON.stringify(error, null, 2)}`,
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    const eventSource = new EventSource("/api/sync")
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      // Calculate the diff when new content arrives
      if (data.content.startsWith(syncedContent)) {
        const newDiff = data.content.slice(syncedContent.length).trim()
        if (newDiff) {
          setLatestDiff(newDiff)
        }
      } else {
        // If content doesn't start with previous content, treat entire new content as diff
        setLatestDiff(data.content.trim())
      }
      
      setSyncedContent(data.content)
    }
    return () => eventSource.close()
  }, [syncedContent])

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <div className="flex gap-2">
          <Button
            onClick={handleCopy}
            variant="outline"
            title="Copy entire content"
          >
            <Copy className="h-4 w-4" />
            Copy All
          </Button>
          <Button
            onClick={handleCopyDiff}
            variant="outline"
            title="Copy only the latest changes"
          >
            <FileDiff className="h-4 w-4" />
            Copy Diff
          </Button>
        </div>
      </div>
      <textarea
        value={syncedContent}
        onChange={(e) => handleSync(e.target.value)}
        className="w-full h-[70vh] p-2 border rounded font-mono text-sm"
        placeholder="Paste terminal outputs, commands, or any text here to sync across devices..."
      />
    </div>
  )
} 