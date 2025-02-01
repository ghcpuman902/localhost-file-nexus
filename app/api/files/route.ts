import { NextResponse } from "next/server";
import { readdir, stat } from "fs/promises";
import { join } from "path";

export async function GET() {
  try {
    const uploadsDir = join(process.cwd(), "public", "uploads");
    
    // Read all files in the uploads directory
    const fileNames = await readdir(uploadsDir);
    
    // Get detailed information for each file
    const filesPromises = fileNames.map(async (name) => {
      const path = join(uploadsDir, name);
      const stats = await stat(path);
      
      return {
        name,
        isDirectory: stats.isDirectory(),
        size: stats.size,
      };
    });

    const files = await Promise.all(filesPromises);

    return NextResponse.json({ files });
  } catch (error) {
    console.error("Error reading uploads directory:", error);
    return NextResponse.json(
      { error: "Failed to read uploads directory" },
      { status: 500 }
    );
  }
}
