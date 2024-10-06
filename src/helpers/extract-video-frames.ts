import type { Writable } from 'node:stream';
import ffmpeg from 'fluent-ffmpeg';

interface ExtractVideoFramesOpts {
  videoPath: string;
  framePattern: string | Writable;
  verbose?: boolean;
}

export const extractVideoFrames = ({ videoPath, framePattern, verbose = false }: ExtractVideoFramesOpts) => {
  return new Promise((resolve, reject) => {
    const cmd = ffmpeg(videoPath)
      .outputOptions(['-loglevel', 'info', '-pix_fmt', 'rgba', '-start_number', '0'])
      .output(framePattern)
      .on('start', (cmd) => {
        if (verbose) {
          // eslint-disable-next-line no-console
          console.log({ cmd });
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
