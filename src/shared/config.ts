// ollama
export const OLLAMA_HOST = "http://localhost:11434";
export const OLLAMA_EMBEDDING_MODEL = "mxbai-embed-large";
export const OLLAMA_VISION_MODEL = "llava";
export const OLLAMA_LLM_MODEL = "llama3";
export const OLLAMA_TRANSLATION_MODEL= "winkefinger/alma-13b"

// vectra
export const VECTRA_DB_PROMPT = "Represent this text for searching relevant informations: ";

// tool configuration
export const toolsMimeType: ToolMimeType[] = [
  {
    tool: "adm-zip",
    mimeTypes: [],
    fileTypes: ["zip", "rar", "gz"],
  },
  {
    tool: "llava",
    mimeTypes: [],
    fileTypes: ["png", "jpg", "jpeg", "gif"],
  },
  {
    tool: "textract",
    mimeTypes: [
      "text/html",
      "application/atom+xml",
      "application/rss+xml",
      "text/markdown",
      "application/epub+zip",
      "application/xml",
      "application/xslt+xml",
      "application/pdf",
      "application/msword",
      "application/vnd.oasis.opendocument.text",
      "application/rtf",
      "application/vnd.ms-excel",
      "application/vnd.ms-excel.sheet.binary.macroenabled.12",
      "application/vnd.ms-excel.sheet.macroenabled.12",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.template",
      "text/csv",
      "application/vnd.oasis.opendocument.spreadsheet",
      "application/vnd.openxmlformats-officedocument.presentationml.template",
      "application/vnd.oasis.opendocument.graphics",
      "image/vnd.dxf",
    ],
    fileTypes: [
      "html",
      "htm", // HTML
      "atom",
      "rss", // ATOM, RSS
      "md", // Markdown
      "epub", // EPUB
      "xml",
      "xsl", // XML, XSL
      "pdf", // PDF
      "doc", // DOC
      "odt",
      "ott", // ODT, OTT
      "rtf", // RTF
      "xls",
      "xlsb",
      "xlsm",
      "xltx", // Excel
      "csv", // CSV
      "ods",
      "ots", // ODS, OTS
      "potx", // POTX
      "odg",
      "otg", // ODG, OTG
      "gif", // Image formats
      "dxf", // DXF
    ],
  },
  {
    tool: "officeparser",
    mimeTypes: [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.oasis.opendocument.text",
      "application/vnd.oasis.opendocument.presentation",
      "application/vnd.oasis.opendocument.spreadsheet",
      "application/pdf",
    ],
    fileTypes: [
      "docx", // Word
      "pptx", // PowerPoint
      "xlsx", // Excel
      "odt", // OpenDocument Text
      "odp", // OpenDocument Presentation
      "ods", // OpenDocument Spreadsheet
      "pdf", // PDF
    ],
  },
  {
    tool: "whisper",
    mimeTypes: [],
    fileTypes: ["wav", "mp3", "aiff", "flac", "ogg"],
  },
];

export interface ToolMimeType {
  tool: string;
  mimeTypes: string[];
  fileTypes: string[];
}
