"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Copy, FileDiff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

export function SyncedTextarea() {
  const { toast } = useToast()
  const [syncedContent, setSyncedContent] = useState("")
  const [latestDiff, setLatestDiff] = useState("")
  const [initialContent, setInitialContent] = useState(true)
  const [localStorageLoaded, setLocalStorageLoaded] = useState(false)

  // Debounce timeout ref for API calls.
  const debounceTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Ref for keeping the latest synced content for the EventSource callback.
  const syncedContentRef = useRef(syncedContent)
  useEffect(() => {
    syncedContentRef.current = syncedContent
  }, [syncedContent])

  // On mount, load persisted content from localStorage if it exists.
  useEffect(() => {
    const storedContent = localStorage.getItem("syncedContent")
    if (storedContent) {
      setSyncedContent(storedContent)
      setInitialContent(false)
    }
    // Mark that localStorage has been loaded.
    setLocalStorageLoaded(true)
  }, [])

  // Helper to update both state and localStorage.
  const updateSyncedContent = useCallback((newContent: string) => {
    setSyncedContent(newContent)
    localStorage.setItem("syncedContent", newContent)
  }, [])

  // Called when user types into the textarea.
  const handleSync = useCallback(
    (content: string) => {
      updateSyncedContent(content)
      setInitialContent(false)

      // Debounce the API POST request.
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
      debounceTimeoutRef.current = setTimeout(async () => {
        await fetch("/api/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        })
      }, 500)
    },
    [updateSyncedContent]
  )

  // Clear the timeout on unmount.
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  // Setup a single EventSource after localStorage has been loaded.
  useEffect(() => {
    if (!localStorageLoaded) return

    const eventSource = new EventSource("/api/sync")
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setInitialContent(false)
      // If the server sends an empty content while we already have nonempty persisted text, ignore it.
      if (data.content === "" && syncedContentRef.current !== "") {
        return
      }

      // Compute diff: if new content starts with our current content, append the diff.
      if (data.content.startsWith(syncedContentRef.current)) {
        const newDiff = data.content.slice(syncedContentRef.current.length).trim()
        if (newDiff) {
          setLatestDiff(newDiff)
        }
      } else {
        // Otherwise, consider the entire new content as a diff.
        setLatestDiff(data.content.trim())
      }

      // Update state and localStorage with the server's content.
      updateSyncedContent(data.content)
    }
    return () => eventSource.close()
  }, [localStorageLoaded, updateSyncedContent])

  // Copy entire content
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

      let copySucceeded = false
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(contentToCopy)
          copySucceeded = true
        } catch (err) {
          console.warn("Clipboard write failed, trying fallback:", err)
          // Fall back below.
        }
      }

      if (!copySucceeded) {
        const textarea = document.createElement("textarea")
        textarea.value = contentToCopy
        textarea.style.position = "fixed"
        textarea.style.top = "0"
        textarea.style.left = "0"
        document.body.appendChild(textarea)
        textarea.focus()
        textarea.select()

        if (!document.execCommand("copy")) {
          throw new Error("Fallback: document.execCommand('copy') failed")
        }
        document.body.removeChild(textarea)
      }

      toast({
        title: "Copied!",
        description: "Content copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to copy content:\n ${JSON.stringify(error, null, 2)}`,
        variant: "destructive",
      })
    }
  }

  // Copy diff using same fallback approach.
  const handleCopyDiff = async () => {
    try {
      // When initially loaded (or default text exists) copy the entire content;
      // otherwise, copy only the latest diff.
      const diffContent = initialContent ? syncedContent.trim() : latestDiff
      if (!diffContent) {
        toast({
          title: "Nothing to copy",
          description: "No new content to copy",
          variant: "destructive",
        })
        return
      }

      let copySucceeded = false
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(diffContent)
          copySucceeded = true
        } catch (err) {
          console.warn("Clipboard write failed, trying fallback:", err)
          // Fallback method uses execCommand below.
        }
      }

      if (!copySucceeded) {
        const textarea = document.createElement("textarea")
        textarea.value = diffContent
        textarea.style.position = "fixed"
        textarea.style.top = "0"
        textarea.style.left = "0"
        document.body.appendChild(textarea)
        textarea.focus()
        textarea.select()

        if (!document.execCommand("copy")) {
          throw new Error("Fallback: document.execCommand('copy') failed")
        }
        document.body.removeChild(textarea)
      }

      toast({
        title: "Copied!",
        description: "Latest update copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to copy content:\n ${JSON.stringify(error, null, 2)}`,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <div className="flex gap-2">
          <Button onClick={handleCopy} variant="outline" title="Copy entire content">
            <Copy className="h-4 w-4" />
            Copy All
          </Button>
          <Button onClick={handleCopyDiff} variant="outline" title="Copy only the latest changes">
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