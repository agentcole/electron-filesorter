import fs from "fs";
import path from "path";
import mime from "mime-types";
import { BrowserWindow, app } from "electron";
import { IPC_CHANNELS } from "../shared/ipc-constants";
import { logger } from "./logger";

interface DirectoryDetails {
  path: string;
  name: string;
  type: "directory" | "file";
  size: number;
  mimeType: string | null;
  children: DirectoryDetails[];
}

// EXPLORE DROPPED
async function exploreDirectory(filePath: string): Promise<DirectoryDetails> {
  const stats = await fs.promises.stat(filePath);
  const details: DirectoryDetails = {
    path: filePath,
    name: path.basename(filePath),
    type: stats.isDirectory() ? "directory" : "file",
    size: stats.size,
    mimeType: stats.isDirectory() ? null : mime.lookup(filePath) || "Unknown",
    children: [],
  };

  if (stats.isDirectory()) {
    const subfiles = await fs.promises.readdir(filePath);
    details.children = await Promise.all(
      subfiles.map(async (subfile) =>
        exploreDirectory(path.join(filePath, subfile))
      )
    );
  }

  return details;
}

interface Folder {
  path: string;
  name: string;
}

// Filewatcher for main directory
let watcher: fs.FSWatcher | undefined;

async function getAllFolders(
  directoryStructure: DirectoryDetails
): Promise<Folder[]> {
  const folders: Folder[] = [];

  async function traverse(node: DirectoryDetails) {
    if (node.type === "directory") {
      folders.push({ path: node.path, name: node.name });
      await Promise.all(node.children.map((child) => traverse(child)));
    }
  }

  await traverse(directoryStructure);

  return folders;
}

async function getFolderSize(dirPath: string): Promise<number> {
  let totalSize = 0;

  async function readDirectory(directory: string) {
    const files = await fs.promises.readdir(directory);

    for (const file of files) {
      const fullPath = path.join(directory, file);
      const stats = await fs.promises.stat(fullPath);

      if (stats.isFile()) {
        totalSize += stats.size;
      } else if (stats.isDirectory()) {
        await readDirectory(fullPath);
      }
    }
  }

  await readDirectory(dirPath);
  return totalSize;
}

function bytesToSize(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Byte";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i)) + " " + sizes[i];
}

async function getFilesRecursive(dir: string): Promise<string[]> {
  let results: string[] = [];
  const list = await fs.promises.readdir(dir);

  await Promise.all(
    list.map(async (file) => {
      const fullPath = path.resolve(dir, file);
      const stat = await fs.promises.stat(fullPath);

      if (stat && stat.isDirectory()) {
        results = results.concat(await getFilesRecursive(fullPath));
      } else {
        results.push(fullPath);
      }
    })
  );

  return results;
}

// Function to get the main directory path from the configuration
async function getMainDirectoryPath(): Promise<string | null> {
  const configPath = path.join(app.getPath("userData"), "config.json");
  try {
    const config = await readConfigFile(configPath);
    return config.mainDir;
  } catch (error) {
    console.error("Failed to read the main directory path:", error);
    return null;
  }
}

// Utility function to read JSON configuration file asynchronously
async function readConfigFile(configPath: string): Promise<any> {
  try {
    const data = await fs.promises.readFile(configPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    logger.error("Failed to read configuration file:", error);
    throw error;
  }
}

// Function to send the saved directory to the renderer process
async function sendSavedDirectory(win: BrowserWindow) {
  const configPath = path.join(app.getPath("userData"), "config.json");
  if (
    await fs.promises
      .access(configPath)
      .then(() => true)
      .catch(() => false)
  ) {
    const config = await readConfigFile(configPath);
    win.webContents.once("did-finish-load", () => {
      win.webContents.send(IPC_CHANNELS.SELECTED_DIRECTORY, config.mainDir);
      watchDirectory(config.mainDir);
    });
  }
}

// Function to watch a directory for changes
function watchDirectory(directoryPath: string) {
  if (watcher) {
    watcher.close();
  }

  watcher = fs.watch(
    directoryPath,
    { recursive: true },
    (eventType, filename) => {
      if (filename) {
        logger.info(`Event type: ${eventType}; File: ${filename}`);
        const mainWindow = BrowserWindow.getAllWindows()[0];
        if (mainWindow) {
          mainWindow.webContents.send(IPC_CHANNELS.FILE_UPDATED, {
            eventType,
            filename,
          });
        }
      }
    }
  );

  logger.info(`Watching for changes in: ${directoryPath}`);
}

// Function to get file properties and metadata
const getFileMetadata = async (filePath: string): Promise<FileMetadata> => {
  try {
    const mimeType = mime.lookup(filePath) || "Unknown";
    const fileStats = await fs.promises.stat(filePath);
    const fileType = path.extname(filePath).slice(1);
    const fileSize = bytesToSize(fileStats.size);
    const fileName = path.basename(filePath);

    const { atime, mtime, ctime, birthtime } = fileStats;

    return {
      mimeType,
      fileType,
      fileSize,
      fileName,
      filePath,
      atime,
      mtime,
      ctime,
      birthtime,
    };
  } catch (error) {
    throw new Error(
      `Failed to get file metadata for ${filePath}: ${error.message}`
    );
  }
};

// Function to encode file data to base64 encoded string
function base64Encode(filePath: string): string {
  return fs.readFileSync(filePath, "base64");
}
export {
  getFolderSize,
  bytesToSize,
  getAllFolders,
  exploreDirectory,
  getFilesRecursive,
  getMainDirectoryPath,
  watchDirectory,
  sendSavedDirectory,
  getFileMetadata,
  base64Encode,
};

export interface FileMetadata {
  mimeType: string;
  fileType: string;
  fileSize: string;
  fileName: string;
  filePath: string;
  atime: Date;
  mtime: Date;
  ctime: Date;
  birthtime: Date;
}
