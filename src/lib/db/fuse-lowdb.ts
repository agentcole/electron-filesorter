
import Fuse, { IFuseOptions } from 'fuse.js';
import { nanoid } from 'nanoid';
import path from 'path';
import { Low , JSONFile} from '@commonify/lowdb';
import { app } from 'electron';

// Define the schema of our database
interface Document {
  id: string;
  title: string;
  author: string;
  date_created: string;
  content: string;
  keywords: string[];
  document_type: string;
  industry: string;
  file_name: string;
  file_path: string;
  file_format: string;
  file_size: string;
  geographical_information: string;
  audience: string;
  sentiment: string;
}

interface DatabaseSchema {
  documents: Document[];
}

// Fuse.js options for searching
const fuseOptions: IFuseOptions<Document> = {
  keys: [
    'title',
    'author',
    'content',
    'keywords',
    'document_type',
    'industry',
    'file_name',
    'file_path',
    'geographical_information',
    'audience',
    'sentiment',
  ],
};

export class FuseLowDB {
  private static instance: FuseLowDB | null = null;
  private db: Low<DatabaseSchema>;
  private fuse: Fuse<Document>;

  private constructor() {
    const adapter = new JSONFile<DatabaseSchema>( path.join(app.getAppPath(),'db.json'));
    this.db = new Low(adapter);
    this.fuse = new Fuse([], fuseOptions);
  }

  // Method to get the singleton instance
  public static async getInstance(): Promise<FuseLowDB> {
    if (FuseLowDB.instance === null) {
      FuseLowDB.instance = new FuseLowDB();
      await FuseLowDB.instance.initDB();
    }
    return FuseLowDB.instance;
  }

  // Initialize the database connection
  private async initDB(): Promise<void> {
    await this.db.read();
    this.db.data = this.db.data || { documents: [] };
    this.fuse.setCollection(this.db.data.documents);
    await this.db.write();
  }

  // Check if a document exists by filepath
  public async documentExists(filePath: string): Promise<boolean> {
    await this.db.read();
    return this.db.data?.documents.some(doc => doc.file_path === filePath) || false;
  }

  // Add a document
  public async addItem(metadata: Omit<Document, 'id'>): Promise<void> {
    if(await this.documentExists(metadata.file_path))
      return;
    const newDoc: Document = { id: nanoid(), ...metadata };
    this.db.data?.documents.push(newDoc);
    await this.db.write();
    this.fuse.setCollection(this.db.data?.documents || []);
  }

  // Search documents
  public async searchTable(query: string, limit = 10): Promise<Document[]> {
    const results = this.fuse.search(query, { limit });
    return results.map(result => result.item);
  }

  // List all documents
  public async listDocuments(): Promise<Document[]> {
    await this.db.read();
    return this.db.data?.documents || [];
  }
}
