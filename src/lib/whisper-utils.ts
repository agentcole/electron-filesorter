import { ipcMain,app} from "electron";
import { execFile } from "child_process";
import path from "path";
import { IPC_CHANNELS } from "../shared/ipc-constants";
import { convertToWav, deleteFile } from "./audio-utils";


import whisper from 'whisper-node';
import fs from 'fs';

const getModelPath = (): string => {
  const basePath = app.isPackaged
    ? path.join(process.resourcesPath, 'models')
    : path.join(__dirname, '..', '..', 'node_modules', 'whisper-node', 'lib', 'whisper.cpp', 'models');
  
  const modelPath = path.join(basePath, 'ggml-base.en.bin');

  if (!fs.existsSync(modelPath)) {
    throw new Error(`Model file not found at ${modelPath}`);
  }

  return modelPath;
};

export const runWhisper = async (audioFilePath: string) => {
  const options = {
    modelPath: getModelPath(),
    whisperOptions: {
      language: 'auto',
      gen_file_txt: false,
      gen_file_subtitle: false,
      gen_file_vtt: false,
      word_timestamps: true
    }
  };

  try {
    const transcript = await whisper(audioFilePath, options);
    console.log(transcript);
    return transcript;
  } catch (error) {
    console.error('Failed to process audio with Whisper:', error);
    throw error;
  }
};

// Determine the correct path to the Whisper executable based on the platform
const getWhisperExecutablePath = () => {
  switch (process.platform) {
    case "win32":
      return path.join(__dirname, "../bin/whisper-windows.exe");
    case "darwin":
      return path.join(__dirname, "../bin/whisper-macos");
    case "linux":
      return path.join(__dirname, "../bin/whisper-linux");
    default:
      throw new Error("Unsupported platform");
  }
};

const WHISPER_EXECUTABLE_PATH = getWhisperExecutablePath();

// ipcMain.handle(IPC_CHANNELS.FILE_UPDATED, async (event, audioPath: string) => {
//   // Convert audio file to WAV format
//   const wavPath = await convertToWav(audioPath);

//   const whisperOutput = await new Promise<string>((resolve, reject) => {
//     execFile(WHISPER_EXECUTABLE_PATH, [wavPath], (error, stdout, stderr) => {
//       if (error) {
//         reject(stderr);
//       } else {
//         resolve(stdout);
//       }
//     });
//   });

//   // Delete the temporary WAV file
//   deleteFile(wavPath);

//   return whisperOutput;
// });
