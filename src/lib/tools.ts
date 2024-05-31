import { promisify } from "util";
import officeParser from "officeparser";
import textract from "textract";
import AdmZip from "adm-zip";
import { ExifImage } from "exif";
import { visionModelRequest } from "./ollama";
import LanguageDetect from "languagedetect";

import { recognize } from 'tesseract.js'
import fs from "fs";
import { runWhisper } from "./whisper-utils";
import { toolsMimeType } from "../shared/config";

const lngDetector = new LanguageDetect();

/**
 * Converts every filetype to text
 * @param tool 
 * @param filePath 
 * @returns 
 */
async function callExtractionTool(
  tool: string,
  filePath: string
): Promise<string> {
  let text = "";
  console.debug(`Using ${tool} to extract data from ${filePath}`);

  // TODO: detect language to provide additional info to the llm later on
  const lng = lngDetector.detect(filePath);

  switch (tool) {
    case "textract": {
      text = (await promisify(textract.fromFileWithPath)(filePath)) as string;
      break;
    }
    case "officeparser": {
      text = await officeParser.parseOfficeAsync(filePath);
      break;
    }
    case "adm-zip": {
      // List all files in a zip without extracting
      text = (await readZipEntries(filePath)).toString();
      break;
    }
    case "whisper": {
      text = (await runWhisper(filePath)).map(item => item.speech).join(" ")
      break;
    }
    case "llava": {
      // Descriptive vision model
      const imageDescription = await visionModelRequest(`What's in this image?`, [filePath]);
      text = "Image description:" + imageDescription

      // OPTIONAL: Extract text from image
      // const ocr = await recognize(filePath);
      // text += "Text OCR: " + ocr.data.text;

      break;
    }
  }

  return text;
}
function useDataExtractorTool(
  filePath: string,
  mimeType: string
): Promise<string | undefined> {
  try {
    let selectedTool = toolsMimeType.find((tool) =>
      tool.mimeTypes.includes(mimeType)
    );

    if (!selectedTool) {
      const fileExtension = filePath.split(".").pop(); // Get the file extension from the file path
      selectedTool = toolsMimeType.find((tool) =>
        tool.fileTypes.includes(fileExtension!)
      );
    }

    if (selectedTool) {
      return callExtractionTool(selectedTool.tool, filePath);
    } else {
      throw new Error("No suitable tool found to handle this file type.");
    }
  } catch (error) {
    console.error("Error selecting tool:", error.message);
  }
}

function readZipEntries(filePath: string): string[] {
  const zip = new AdmZip(filePath);
  const zipEntries = zip.getEntries();

  const entries: string[] = [];
  zipEntries.forEach((zipEntry) => {
    entries.push(zipEntry.entryName);
  });
  return entries;
}

export { readZipEntries, useDataExtractorTool };
