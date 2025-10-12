import { NextResponse } from "next/server";
import { readdir, stat } from "fs/promises";
import { join } from "path";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subPath = searchParams.get('path') || '';
    
    const uploadsDir = join(process.cwd(), "public", "uploads");
    const targetDir = subPath ? join(uploadsDir, subPath) : uploadsDir;
    
    
    // Security check: ensure the path is within uploads directory
    if (!targetDir.startsWith(uploadsDir)) {
      return NextResponse.json(
        { error: "Access denied: Path traversal attempt detected" },
        { status: 403 }
      );
    }
    
    // Check if directory exists
    try {
      await stat(targetDir);
    } catch (statError) {
      console.error('Directory does not exist:', targetDir, statError);
      return NextResponse.json(
        { error: `Directory does not exist: ${targetDir}` },
        { status: 404 }
      );
    }
    
    // Read all files in the target directory
    const fileNames = await readdir(targetDir);
    
    // Get detailed information for each file
    const filesPromises = fileNames.map(async (name) => {
      const path = join(targetDir, name);
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
