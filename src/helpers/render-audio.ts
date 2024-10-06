import type { Log } from '../types/ffmpeg-concat.js';
import fs from 'fs-extra';
import ffmpeg from 'fluent-ffmpeg';
import path from 'node:path';

interface RenderAudioOpts {
  log?: Log;
  scenes: { sourceAudioPath?: string }[];
  outputDir: string;
  fileName: string;
}

export const renderAudio = async ({ log, scenes, outputDir, fileName }: RenderAudioOpts) => {
  const concatListPath = path.join(outputDir, 'audioConcat.txt');
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  const toConcat = scenes.filter((scene) => scene.sourceAudioPath).map((scene) => `file '${scene.sourceAudioPath}'`);
  const outputFileName = path.join(outputDir, fileName);
  await fs.outputFile(concatListPath, toConcat.join('\n'));
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
