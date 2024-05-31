import axios from "axios";
import fs from "fs";
import { OLLAMA_HOST, OLLAMA_LLM_MODEL, OLLAMA_TRANSLATION_MODEL, OLLAMA_VISION_MODEL } from "../shared/config";
import { base64Encode } from "./file-utils";


interface OllamaRequestOptions {
  model?: string;
  stream?: boolean;
  images?: string[];
  format?: string;
}

async function llmRequest(prompt: string, format?: string): Promise<any> {
  return ollamaRequest(prompt, { model: OLLAMA_LLM_MODEL, format });
}

async function visionModelRequest(prompt: string, images: string[], format?: string): Promise<any> {
  const base64Images = images.map((image) => base64Encode(image));
  return ollamaRequest(prompt, { model: OLLAMA_VISION_MODEL, images: base64Images, format });
}

async function translateRequest(prompt: string, format?: string): Promise<any> {
  return ollamaRequest(
    {
      prompt: `
  Translate this from German to English:
  German: ${prompt}
  English:`,
    },
    { model: OLLAMA_TRANSLATION_MODEL, format }
  );
}

async function ollamaRequest(prompt: string | { prompt: string }, options: OllamaRequestOptions = {}): Promise<any> {
  const defaultOptions: OllamaRequestOptions = {
    model: OLLAMA_LLM_MODEL,
    stream: false,
  };

  const url = `${OLLAMA_HOST}/api/generate`;

  const response = await axios.post(url, {
    ...defaultOptions,
    ...options,
    prompt,
  });

  console.log("OPTIONS", {
    ...defaultOptions,
    ...options,
    prompt,
  });

  if (response.status === 200) {
    const res = await response.data;
    return res["response"];
  } else {
    throw new Error("Failed to fetch from the API");
  }
}

export {
  llmRequest,
  visionModelRequest,
  translateRequest,
  ollamaRequest,
};
