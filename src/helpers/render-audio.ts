import fs from 'fs-extra';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { Log } from '../types';
import { Scene } from '../types/internal';

interface RenderAudioOpts {
  log: Log;
  scenes: Scene[];
  outputDir: string;
  fileName: string;
}

export const renderAudio = async (opts: RenderAudioOpts) => {
  const { log, scenes, outputDir, fileName } = opts;

  return new Promise<string>((resolve, reject) => {
    const concatListPath = path.join(outputDir, 'audioConcat.txt');
    const toConcat = scenes.filter((scene) => scene.sourceAudioPath).map((scene) => `file '${scene.sourceAudioPath}'`);
    const outputFileName = path.join(outputDir, fileName);
    fs.outputFile(concatListPath, toConcat.join('\n'))
      .then(() => {
        if (log) {
          log(`created ${concatListPath}`);
        }
        const cmd = ffmpeg()
          .input(concatListPath)
          .inputOptions(['-f concat', '-safe 0'])
          .on('start', (cmd) => log && log(cmd))
          .on('end', () => resolve(outputFileName))
          .on('error', (err, stdout, stderr) => {
            if (err) {
              console.error('failed to concat audio', err, stdout, stderr);
            }
            reject(err);
          });
        cmd.save(outputFileName);
      })
      .catch((err) => {
        console.error(`failed to concat audio ${err}`);
        reject(err);
      });
  });
};