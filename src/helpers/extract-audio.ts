import ffmpeg from 'fluent-ffmpeg';
import { ExtractAudioOpts } from '../types/index.js';

export const extractAudio = (opts: ExtractAudioOpts) => {
  const { log, videoPath, outputFileName, start, duration } = opts;

  return new Promise((resolve, reject) => {
    const cmd = ffmpeg(videoPath)
      .noVideo()
      .audioCodec('libmp3lame')
      .on('start', (cmd) => log && log(`audio-cmd: ${cmd}`))
      .on('end', () => resolve(outputFileName))
      .on('error', (err) => reject(err));
    if (start) {
      cmd.seekInput(start);
    }
    if (duration) {
      cmd.duration(duration);
    }
    cmd.save(outputFileName);
  });
};
