import ollama, { EmbeddingsResponse } from "ollama";
import {
  OLLAMA_EMBEDDING_MODEL,
  VECTRORDB_PROMPT,
  VECTORDB_DATABASE_URI,
  VECTORDB_TABLE_NAME,
} from "../../shared/config";

import { Connection, Table, connect } from "vectordb";
import {
  Schema,
  Field,
  Float32,
  FixedSizeList,
  Int32,
  Utf8,
} from "apache-arrow";

export class LanceVectorDB {
  private static instance: LanceVectorDB | null = null;
  public db: Connection | null = null;

  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  // Method to get the singleton instance
  public static async getInstance(): Promise<LanceVectorDB> {
    if (LanceVectorDB.instance === null) {
      LanceVectorDB.instance = new LanceVectorDB();
      await LanceVectorDB.instance.initDB();
    }
    return LanceVectorDB.instance;
  }

  // Initialize the database connection
  private async initDB(): Promise<Connection> {
    this.db = await connect(VECTORDB_DATABASE_URI);
    this.createTableSchema();
    return this.db;
  }

  // Get vector representation of the text
  public async getVector(text: string): Promise<EmbeddingsResponse> {
    return await ollama.embeddings({
      model: OLLAMA_EMBEDDING_MODEL,
      prompt: VECTRORDB_PROMPT + text,
    });
  }

  // Check if a table exists
  public async tableExists(tableName: string): Promise<boolean> {
    const tables = await this.listTables();
    return tables.includes(tableName);
  }

  // Create table schema
  public async createTableSchema(): Promise<void> {
    if (this.db === null) {
      throw new Error("Database connection is not initialized.");
    }

    if (await this.tableExists(VECTORDB_TABLE_NAME)) {
      console.log(
        `Table "${VECTORDB_TABLE_NAME}" already exists. Skipping creation.`
      );
      return;
    }

    const schema = new Schema([
      new Field("id", new Int32()),
      new Field(
        "vector",
        new FixedSizeList(1024, new Field("item", new Float32()))
      ),
      new Field("title", new Utf8()),
      new Field("author", new Utf8()),
      new Field("date_created", new Utf8()),
      new Field("content", new Utf8()),
      new Field("keywords", new Utf8()),
      new Field("document_type", new Utf8()),
      new Field("industry", new Utf8()),
      new Field("file_name", new Utf8()),
      new Field("file_path", new Utf8()),
      new Field("file_format", new Utf8()),
      new Field("file_size", new Utf8()),
      new Field("geographical_information", new Utf8()),
      new Field("audience", new Utf8()),
      new Field("sentiment", new Utf8()),
    ]);

    await this.db.createTable({ name: VECTORDB_TABLE_NAME, schema });
  }

  // List tables
  public async listTables(): Promise<string[]> {
    if (this.db === null) {
      throw new Error("Database connection is not initialized.");
    }
    return await this.db.tableNames();
  }

  // Open a table with embedding function
  public async openTable(table: string): Promise<Table> {
    if (this.db === null) {
      throw new Error("Database connection is not initialized.");
    }
    return await this.db.openTable(table);
  }

  // Open a table with embedding function
  public async addItem(textToVectorize: string, metadata: Omit<any, "vector">): Promise<void> {
    if (this.db === null) {
      throw new Error("Database connection is not initialized.");
    }

    const vectorResult = await this.getVector(textToVectorize);
    const vector = vectorResult.embedding;

    const table = await this.openTable(VECTORDB_TABLE_NAME);
    await table.add([{
      ...metadata,
      vector
    }]);
  }

  // Search table with a query
  public async searchTable(query: string, fields?: string[], limit?: number): Promise<any> {
    const tbl = await this.openTable(VECTORDB_TABLE_NAME);
    const {embedding} = await this.getVector(query);
    console.log('Query: ', query);
    return await tbl
      .search(embedding)
      .select(fields || ['file_path'])
      .limit(limit || 10)
  // .where()
      .execute();
  }
}
