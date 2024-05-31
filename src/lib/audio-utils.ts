import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import os from 'os';
import fs from 'fs';

export const convertToWav = (inputPath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(os.tmpdir(), `${path.basename(inputPath, path.extname(inputPath))}.wav`);
    
    ffmpeg(inputPath)
      .outputOptions([
        '-ar 16000',  // Set audio frequency to 16kHz
        '-ac 1'       // Set audio channels to mono
      ])
      .toFormat('wav')
      .save(outputPath)
      .on('end', () => {
        resolve(outputPath);
      })
      .on('error', (err) => {
        reject(err);
      });
  });
};

export const deleteFile = (filePath: string): void => {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(`Failed to delete file ${filePath}:`, err);
    }
  });
};
