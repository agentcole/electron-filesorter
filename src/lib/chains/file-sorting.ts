import {
  FileMetadata,
  exploreDirectory,
  getAllFolders,
  getMainDirectoryPath,
} from "../file-utils";
import { logger } from "../logger";
import { llmRequest } from "../ollama";

/**
 * This chains creates a taxonomy based on the textData from the tool call (basically filetype as text)
 * Then creates taxonomies from the text data and file metadata.
 * @param fileMeta
 * @param textData
 * @returns
 */
export const fileSortingChain = async (
  fileMeta: FileMetadata,
  textData: string
) => {
  const mainFolderPath = await getMainDirectoryPath();
  if (!mainFolderPath) throw new Error("Main directory path is not defined");

  // Get the folderstructure as hierarchical json string e.g.
  // - Main
  //    - Second
  const folderStructure = (
    await getAllFolders(await exploreDirectory(mainFolderPath))
  ).map((item) => item.path.replace(mainFolderPath, ""));
  const folderPathsJson = JSON.stringify(folderStructure);

  // Create taxonomies
  const taxonomyContext =
    await llmRequest(`For file organization use the following data to make an assumption what that file could be (taxonomy, tags, category, genre, short description): 
  filetype:${fileMeta.fileType} 
  mimetype:${fileMeta.mimeType}
  name:${fileMeta.fileName}
  size: ${fileMeta.fileSize}
  content: ${textData}
  `);
  logger.info("Taxonomy context", taxonomyContext);

  
  // Compares folder structure for best fitting
  const compareFolderTaxonomy = await llmRequest(`
    Your task is to organize files. Please choose the best fitting folder path for the file description.
  Description:
  ${taxonomyContext}
  
  Folder structure:
  ${folderPathsJson}
  `);
  logger.info("Best fitting for taxonomy:", compareFolderTaxonomy);

  // Uses suggestions and returns json
  const jsonSuggestion = await llmRequest(
    `You are an expert in organizing files. 
  Please compare the content with the existing paths and extract the JSON from the content.
   If you have better suggestions add them.
   e.g. {path: "<existingPath>", suggestions: [{path: "<suggestedPath>"},..]}
   Content: ${compareFolderTaxonomy}
   Existing paths: ${folderPathsJson}`,
    "json"
  );
  logger.info("-----");
  logger.info(jsonSuggestion);

  return jsonSuggestion;
};
