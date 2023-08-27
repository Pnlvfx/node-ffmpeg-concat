import ffmpeg from 'fluent-ffmpeg';
import { ExtractVideoFramesOpts } from '../types';

export const extractVideoFrames = (opts: ExtractVideoFramesOpts) => {
  const { framePattern, verbose, videoPath } = opts;
  return new Promise((resolve, reject) => {
    const cmd = ffmpeg(videoPath)
      .outputOptions(['-loglevel', 'info', '-pix_fmt', 'rgba', '-start_number', '0'])
      .output(framePattern)
      .on('start', (cmd) => console.log({ cmd }))
      .on('end', () => resolve(framePattern))
      .on('error', (err) => reject(err));

    if (verbose) {
      cmd.on('stderr', (err) => console.error(err));
    }

    cmd.run();
  });
};