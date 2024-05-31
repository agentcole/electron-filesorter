declare module "whisper-node" {
  interface WhisperOptions {
    modelPath: string;
    execPath?: string;
  }
  interface TranscriptEntry {
    start: string;
    end: string;
    speech: string;
  }
  

  function whisper(filePath: string, options?: WhisperOptions): Promise<TranscriptEntry[]>;

  export = whisper;
}
