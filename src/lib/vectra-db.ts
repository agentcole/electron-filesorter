import ollama from "ollama";
import path from "path";
import { LocalIndex } from "vectra";
import { OLLAMA_EMBEDDING_MODEL, VECTRA_DB_PROMPT } from "../shared/config";

export class VectraDb {
  private static instance: VectraDb;
  private index: LocalIndex | null = null;

  // Private constructor to prevent direct instantiation
  private constructor() {
    // __
  }

  // Method to get the singleton instance
  public static async getInstance(): Promise<VectraDb> {
    if (!VectraDb.instance) {
      VectraDb.instance = new VectraDb();
      await VectraDb.instance.init();
    }
    return VectraDb.instance;
  }

  // Initialize the index
  private async init() {
    if (this.index === null) {
      this.index = new LocalIndex(path.join(__dirname, "..", "index"));

      if (!(await this.index.isIndexCreated())) {
        await this.index.createIndex();
      }
    }
  }

  // Add an item to the index
  public async addItem(text: string, meta: any) {
    if (this.index === null) {
      throw new Error("Index not initialized. Call init() first.");
    }
    const vectorData = await this.getVector(text);
    await this.index.insertItem({
      vector: vectorData.embedding,
      metadata: { text, meta },
    });
  }

  // Get vector representation of the text
  private async getVector(text: string) {
    return await ollama.embeddings({
      model: OLLAMA_EMBEDDING_MODEL,
      prompt: VECTRA_DB_PROMPT + text,
    });
  }
}

// import * as lancedb from "vectordb";
// import {
//   Schema,
//   Field,
//   Float32,
//   FixedSizeList,
//   Int32,
//   Float16,
//   Utf8,
// } from "apache-arrow";

// export class LanceDB {
//   private static instance: LanceDB;
//   private openTable: lancedb.Table | null = null;

//   // Private constructor to prevent direct instantiation
//   private constructor() {
//     // __
//   }

//   // Method to get the singleton instance
//   public static async getInstance(): Promise<LanceDB> {
//     if (!LanceDB.instance) {
//       LanceDB.instance = new LanceDB();
//       await LanceDB.instance.init();
//     }
//     return LanceDB.instance;

//     const uri = "data/filesearch";
//     const db = await lancedb.connect(uri);
//   }

//   // Initialize the index
//   private async init() {
//     if (this.openTable === null) {
//       this.openTable = new LocalopenTable(
//         path.join(__dirname, "..", "openTable")
//       );

//       if (!(await this.openTable.isopenTableCreated())) {
//         await this.openTable.createIndex();
//       }
//     }
//   }

//   // Add an item to the index
//   public async addItem(text: string, meta: any) {
//     if (this.index === null) {
//       throw new Error("Index not initialized. Call init() first.");
//     }
//     const vectorData = await this.getVector(text);
//     await this.index.insertItem({
//       vector: vectorData.embedding,
//       metadata: { text, meta },
//     });
//   }

//   // Get vector representation of the text
//   private async getVector(text: string) {
//     return await ollama.embeddings({
//       model: OLLAMA_EMBEDDING_MODEL,
//       prompt: VECTRA_DB_PROMPT + text,
//     });
//   }
// }
// async function createTable() {
//   const schema = new Schema([
//     new Field("id", new Int32()),
//     new Field("title", new Utf8()),
//     new Field("author", new Utf8()),
//     new Field("date_created", new Utf8()),
//     new Field("content", new Utf8()),
//     new Field("keywords", new Utf8()),
//     new Field("document_type", new Utf8()),
//     new Field("industry", new Utf8()),
//     new Field("file_name", new Utf8()),
//     new Field("file_path", new Utf8()),
//     new Field("file_format", new Utf8()),
//     new Field("file_size", new Utf8()),
//     new Field("geographical_information", new Utf8()),
//     new Field("audience", new Utf8()),
//     new Field("sentiment", new Utf8()),
//   ]);

//   await db.createTable({ name: "filesearch", schema });
// }

// const db = await lancedb.connect("data/sample-lancedb");

// const table = await db.createTable({
//   name: "vectors",
//   data: [
//     { id: 1, vector: [0.1, 0.2], item: "foo", price: 10 },
//     { id: 2, vector: [1.1, 1.2], item: "bar", price: 50 },
//   ],
// });

// const query = table.search([0.1, 0.3]).limit(2);
// const results = await query.execute();

// // You can also search for rows by specific criteria without involving a vector search.
// const rowsByCriteria = await table
//   .search(undefined)
//   .where("price >= 10")
//   .execute();
