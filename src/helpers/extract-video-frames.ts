import type { Writable } from 'node:stream';
import fluent from 'fluent-ffmpeg';
import { ffmpeg } from 'async-ffmpeg';

interface ExtractVideoFramesOpts {
  videoPath: string;
  framePattern: string | Writable;
  verbose?: boolean;
}

export const extractVideoFrames = async ({ videoPath, framePattern, verbose = false }: ExtractVideoFramesOpts) => {
  // await ffmpeg({ input: videoPath });
  return new Promise((resolve, reject) => {
    const cmd = fluent(videoPath)
      .outputOptions(['-pix_fmt', 'rgba', '-start_number', '0'])
      .output(framePattern)
      .on('start', (cmd) => {
        if (verbose) {
          // eslint-disable-next-line no-console
          console.log('Extract video frames command:\n', cmd);
        }
      })
      .on('end', () => {
        resolve(framePattern);
      })
      .on('error', reject);

    if (verbose) {
      // eslint-disable-next-line no-console
      cmd.on('stderr', console.error);
    }

    cmd.run();
  });
};
