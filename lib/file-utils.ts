export interface FileEntry {
  name: string;
  isDirectory: boolean;
  size: number;
  path: string;
}

export const formatFileSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  // For bytes, show no decimal places
  // For KB, show 0-1 decimal places
  // For MB and above, show 1-2 decimal places
  const decimalPlaces = unitIndex === 0 ? 0 : unitIndex === 1 ? 1 : 2;
  return `${size.toFixed(decimalPlaces)} ${units[unitIndex]}`;
};

export const isImageFile = (filename: string) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', 'svg'];
  return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
};

export const splitFilename = (filename: string) => {
  const parts = filename.split(".");
  const ext = parts.pop() || "";
  const name = parts.join(".");
  return { name, ext };
};

export const shouldShowFile = (filename: string) => {
  // Common hidden files to exclude
  const hiddenFiles = [
    '.DS_Store',
    'Thumbs.db',
    '.localized',
    '._*', // Mac resource fork files
    '.AppleDouble',
    '.LSOverride',
    'desktop.ini'
  ];

  // Always show these important files even if they start with a dot
  const importantDotFiles = [
    '.env',
    '.gitignore',
    '.npmrc',
    '.babelrc',
    '.eslintrc',
    '.prettierrc'
  ];

  // Check if it's an important configuration file
  if (importantDotFiles.some(file => filename.toLowerCase() === file.toLowerCase())) {
    return true;
  }

  // Filter out common hidden files
  if (hiddenFiles.some(file => {
    if (file.endsWith('*')) {
      return filename.startsWith(file.slice(0, -1));
    }
    return filename.toLowerCase() === file.toLowerCase();
  })) {
    return false;
  }

  return true;
}; 