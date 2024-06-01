import {
  FileMetadata,
} from "../file-utils";
import { logger } from "../logger";
import { llmRequest } from "../ollama";
import { LanceVectorDB } from "../vector-db";

/**
 * @param fileMeta
 * @param textData
 * @returns
 */
export const searchVectorsChain = async (
  fileMeta: FileMetadata,
  textData: string
) => {
  // TODO: check size of text data
  // If it is too long, run a summary chain
  // use langchain default

  // Create taxonomies
  const keywords = await llmRequest(
    `Answer only with comma-separated keywords. Based on the following description think of as many related keywords as possible: ${textData}`
  );
  console.log(keywords);

  const sentiment = await llmRequest(
    `Answer with one word and nothing else. Do a sentiment analysis based on this text: ${textData}`
  );
  console.log(sentiment);

  const industry = await llmRequest(
    `Answer with one word and nothing else - what industry would fit best here: ${textData}`
  );
  console.log(industry);

  const geographicalInformation = await llmRequest(
    `Answer with one word and nothing else - what geographical information would fit best here: ${textData}`
  );
  console.log(geographicalInformation);

  const audience = await llmRequest(
    `Answer with one word and nothing else - what audience would fit best here: ${textData}`
  );
  console.log(audience);

  const documentType = await llmRequest(
    `Answer with one word and nothing else - what document type is this: ${textData}`
  );
  console.log(documentType);

  const summary = await llmRequest(
    `Answer with a short precise paragraph about this text: ${textData}`
  );
  console.log(documentType);

  const searchModel: SearchModel = {
    // hashfunction: https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
    id: fileMeta.filePath.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0),
    title: "Unknown",
    author: "Unknown",
    date_created: fileMeta.birthtime.toISOString(),
    content: textData,
    keywords: keywords.split(", "),
    document_type: documentType,
    industry: industry,
    geographical_information: geographicalInformation,
    audience: audience,
    sentiment: sentiment,
    file_format: fileMeta.fileType,
    file_name: fileMeta.fileName,
    file_path: fileMeta.filePath,
    file_size: fileMeta.fileSize,
  };

  const db = await LanceVectorDB.getInstance();
  await db.addItem(summary, searchModel);
};

export interface SearchModel {
  id: number;
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
