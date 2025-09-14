import { WebContainer } from "@webcontainer/api";

/**
 * Write content to a file in WebContainer
 */
export async function writeFileToWebContainer(
  webcontainer: WebContainer,
  filePath: string,
  content: string
): Promise<void> {
  await webcontainer.fs.writeFile(filePath, content);
}

/**
 * Append content to a file in WebContainer
 */
export async function appendFileToWebContainer(
  webcontainer: WebContainer,
  filePath: string,
  content: string
): Promise<void> {
  const existingContent = await webcontainer.fs.readFile(filePath, "utf-8").catch(() => "");
  await webcontainer.fs.writeFile(filePath, existingContent + content);
}

/**
 * Create a directory in WebContainer if it doesn't exist
 */
export async function ensureDirectoryExists(
  webcontainer: WebContainer,
  dirPath: string
): Promise<void> {
  try {
    await webcontainer.fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    // Directory might already exist, ignore error
  }
}

/**
 * Update file content in WebContainer and sync with IndexedDB
 */
export async function updateFileInWebContainer(
  webcontainer: WebContainer,
  filePath: string,
  content: string,
  selectedTemplate: string,
  indexedDBManager: any
): Promise<void> {
  // Ensure directory exists
  const dirPath = filePath.substring(0, filePath.lastIndexOf('/'));
  if (dirPath) {
    await ensureDirectoryExists(webcontainer, dirPath);
  }
  
  // Write to WebContainer
  await writeFileToWebContainer(webcontainer, filePath, content);
  
  // Sync to IndexedDB
  await indexedDBManager.saveFile(selectedTemplate, filePath, content);
}