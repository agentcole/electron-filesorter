import fs from "fs";
import path from "path";
import { ipcMain, dialog, app } from "electron";
import {
  watchDirectory,
  exploreDirectory,
  getMainDirectoryPath,
} from "../lib/file-utils";
import { logger } from "../lib/logger";
import { IPC_CHANNELS } from "../shared/ipc-constants";

export function initFilesHandle() {
  // IPC handler for opening file dialog
  ipcMain.handle(IPC_CHANNELS.OPEN_FILE_DIALOG, async () => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ["openDirectory"],
      });
      if (!result.canceled && result.filePaths.length > 0) {
        const selectedPath = result.filePaths[0];
        await fs.promises.writeFile(
          path.join(app.getPath("userData"), "config.json"),
          JSON.stringify({ mainDir: selectedPath })
        );
        watchDirectory(selectedPath);
        return selectedPath;
      }
      return null;
    } catch (error) {
      console.error("Failed to open file dialog:", error);
      throw error;
    }
  });

  // IPC handler for getting directory structure
  ipcMain.handle(
    IPC_CHANNELS.GET_DIRECTORY_STRUCTURE,
    async (event, dir: string) => {
      return exploreDirectory(dir);
    }
  );

  // IPC handler for handling dropped files
  ipcMain.on(
    IPC_CHANNELS.HANDLE_DROPPED_FILES,
    (event, filePaths: string[]) => {
      logger.info(`Files dropped: ${filePaths.join(", ")}`);
    }
  );

  // IPC handler for moving a file
  ipcMain.handle(
    IPC_CHANNELS.MOVE_FILE,
    async (event, sourceFilePath: string, newPath: string) => {
      const mainFolderPath = await getMainDirectoryPath();
      if (!mainFolderPath)
        throw new Error("Main directory path is not defined");

      const targetDir = path.join(mainFolderPath, newPath);
      logger.info(`MOVE FILE :::::: ${sourceFilePath} to ${targetDir}`);

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const fileName = path.basename(sourceFilePath);
      const newFilePath = path.join(targetDir, fileName);

      try {
        await fs.promises.rename(sourceFilePath, newFilePath);
        logger.info(
          `Successfully moved file from ${sourceFilePath} to ${newFilePath}`
        );
        return `Moved from ${sourceFilePath} to ${newFilePath}`;
      } catch (error) {
        logger.error(
          `Failed to move file from ${sourceFilePath} to ${newFilePath}:`,
          error
        );
        throw new Error(`Failed to move file: ${error.message}`);
      }
    }
  );

  // IPC handler for processing dropped items
  ipcMain.handle(
    IPC_CHANNELS.PROCESS_DROPPED_ITEMS,
    async (event, items: string[]) => {
      const structure = await Promise.all(
        items.map((item) => exploreDirectory(item))
      );
      return structure;
    }
  );
}
