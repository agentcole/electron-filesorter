import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../shared/ipc-constants";
import { FuseLowDB } from "../lib/db/fuse-lowdb";

export function initSearchFuseDbHandle() {
  ipcMain.handle(IPC_CHANNELS.SEARCH_FUSE_DB, async (_, query: string) => {
    const db = await FuseLowDB.getInstance();
    return await db.searchTable(query);
  });
}
