import type { Log } from '../types/ffmpeg-concat.js';
import fs from 'node:fs/promises';
import ffmpeg from 'fluent-ffmpeg';
import path from 'node:path';

interface RenderAudioOpts {
  log?: Log;
  audioScenes: string[];
  outputDir: string;
  fileName: string;
}

export const renderAudio = async ({ log, audioScenes, outputDir, fileName }: RenderAudioOpts) => {
  const concatListPath = path.join(outputDir, 'audioConcat.txt');
  const toConcat = audioScenes.map((audio) => `file '${audio}'`);
  const outputFileName = path.join(outputDir, fileName);
  await fs.writeFile(concatListPath, toConcat.join('\n'));
  return new Promise<string>((resolve, reject) => {
    if (log) {
      log(`created ${concatListPath}`);
    }
    const cmd = ffmpeg()
      .input(concatListPath)
      .inputOptions(['-f concat', '-safe 0'])
      .on('start', (cmd) => {
        if (log) log(cmd);
      })
      .on('end', () => {
        resolve(outputFileName);
      })
      .on('error', reject);
    cmd.save(outputFileName);
  });
};
