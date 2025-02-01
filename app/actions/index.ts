"use server"

import { writeFile } from "fs/promises"
import { join } from "path"

export async function uploadFile(formData: FormData) {
  try {
    const file = formData.get("file") as File
    if (!file) {
      throw new Error("No file uploaded")
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const path = join(process.cwd(), "public", "uploads", file.name)
    await writeFile(path, buffer)

    return JSON.stringify({ success: true, message: "File uploaded successfully" }, null, 2)
  } catch (error) {
    console.error("File upload error:", error)
    return JSON.stringify({ success: false, error: error instanceof Error ? error.message : String(error) }, null, 2)
  }
}

export async function syncContent(content: string) {
  try {
    // Get the current origin for the API call
    const origin = process.env.BASE_URL
    await fetch(`${origin}/api/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    })
    return { success: true }
  } catch (error) {
    console.error("Sync error:", error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

