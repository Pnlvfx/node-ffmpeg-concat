import type { Log } from '../types/ffmpeg-concat.js';
import type { Theme } from '../types/internal.js';
import ffmpeg from 'fluent-ffmpeg';
import onTranscodeProgress from 'ffmpeg-on-progress-ts';

interface TranscodeVideoOpts {
  args?: string[];
  log: Log;
  audio?: string;
  frameFormat: string;
  framePattern: string;
  output: string;
  verbose: boolean;
  theme: Theme;
  onProgress: OnProgress;
}

export const transcodeVideo = ({ frameFormat, framePattern, log, onProgress, output, theme, verbose, args, audio }: TranscodeVideoOpts) => {
  return new Promise<void>((resolve, reject) => {
    const inputOptions = ['-framerate', theme.fps.toString()];

    if (frameFormat === 'raw') {
      Array.prototype.push.apply(inputOptions, [
        '-vcodec',
        'rawvideo',
        '-pixel_format',
        'rgba',
        '-video_size',
        `${theme.width.toString()}x${theme.height.toString()}`,
      ]);
    }

    const cmd = ffmpeg(framePattern).inputOptions(inputOptions);

    if (audio) {
      cmd.addInput(audio);
    }

    const outputOptions = ['-hide_banner', '-map_metadata', '-1', '-map_chapters', '-1'];
    const videoOptions = args ?? [
      '-c:v',
      'libx264',
      '-profile:v',
      'main',
      '-preset',
      'medium',
      '-crf',
      '20',
      '-movflags',
      'faststart',
      '-pix_fmt',
      'yuv420p',
      '-r',
      theme.fps.toString(),
    ];
    const audioOptions = audio ? ['-c:a', 'copy'] : [];
    outputOptions.push(...videoOptions, ...audioOptions);

    if (onProgress) {
      cmd.on('progress', onTranscodeProgress(onProgress, theme.duration));
    }

    if (verbose) {
      cmd.on('stderr', (err) => {
        console.error(err);
      });
    }

    cmd
      .outputOptions(outputOptions)
      .output(output)
      .on('start', (cmd) => log && log(`cmd: ${cmd}`))
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run();
  });
};
