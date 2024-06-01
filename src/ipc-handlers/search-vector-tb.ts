import { ipcMain } from "electron";
import { LanceVectorDB } from "../lib/vector-db";
import { IPC_CHANNELS } from "../shared/ipc-constants";

export function initSearchHandle() {
  ipcMain.handle(IPC_CHANNELS.SEARCH_VECTOR_DB, async (_, query: string) => {
    const db = await LanceVectorDB.getInstance();
    return await db.searchTable(query);
  });
}
