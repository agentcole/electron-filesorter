// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";
import { IPC_CHANNELS } from "./shared/ipc-constants";

// Expose a secure API to the renderer process
export const electronAPI = {
  selectDirectory: (): Promise<string> =>
    ipcRenderer.invoke(IPC_CHANNELS.OPEN_FILE_DIALOG),

  onDirectorySelected: (callback: Callback<string>): void => {
    ipcRenderer.on(
      IPC_CHANNELS.SELECTED_DIRECTORY,
      (event: IpcRendererEvent, path: string) => callback(path)
    );
  },

  onFileUpdated: (callback: Callback<any>): void => {
    ipcRenderer.on(
      IPC_CHANNELS.FILE_UPDATED,
      (event: IpcRendererEvent, data: any) => callback(data)
    );
  },

  handleDroppedFiles: (filePaths: string[]): void => {
    ipcRenderer.send(IPC_CHANNELS.HANDLE_DROPPED_FILES, filePaths);
  },

  processDroppedItems: (items: string[]): Promise<any> =>
    ipcRenderer.invoke(IPC_CHANNELS.PROCESS_DROPPED_ITEMS, items),

  getDirectoryStructure: (dir: string): Promise<any> =>
    ipcRenderer.invoke(IPC_CHANNELS.GET_DIRECTORY_STRUCTURE, dir),

  getFolderPaths: (mainFolderPath: string): Promise<any> =>
    ipcRenderer.invoke(IPC_CHANNELS.GET_FOLDER_PATHS, mainFolderPath),

  moveFile: (oldPath: string, newPath: string): Promise<string> =>
    ipcRenderer.invoke(IPC_CHANNELS.MOVE_FILE, oldPath, newPath),

  performApiRequest: (data: {
    fileName: string;
    filePath: string;
  }): Promise<string> =>
    ipcRenderer.invoke(IPC_CHANNELS.PERFORM_API_REQUEST, data),
};

contextBridge.exposeInMainWorld("electronAPI", electronAPI);

export type Callback<T> = (data: T) => void;
