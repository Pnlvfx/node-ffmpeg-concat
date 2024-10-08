import type { ConcatOptions } from './types/ffmpeg-concat.js';
import fs from 'fs-extra';
import { temporaryDirectory } from 'tempy';
import { initFrames } from './helpers/init-frames.js';
import { renderFrames } from './helpers/render-frames.js';
import { transcodeVideo } from './helpers/transcode-video.js';
import { renderAudio } from './helpers/render-audio.js';
import rmrf from 'rmrf';

const concat = async ({
  args,
  log,
  concurrency = 4,
  frameFormat = 'raw',
  cleanupFrames = true,
  transition,
  transitions,
  audio,
  videos,
  output,
  tempDir,
  verbose = false,
  // eslint-disable-next-line sonarjs/cognitive-complexity
}: ConcatOptions) => {
  if (tempDir) await fs.ensureDir(tempDir);
  const temp = tempDir ?? temporaryDirectory();
  if (verbose) {
    // eslint-disable-next-line no-console
    console.time('ffmpeg-concat');
    // eslint-disable-next-line no-console
    console.time('init-frames');
  }

  try {
    const { frames, theme, numberOfScenes, audioScenes } = await initFrames({
      concurrency,
      videos,
      transition,
      transitions,
      outputDir: temp,
      frameFormat,
      renderAudio: !audio,
      verbose,
    });

    if (verbose) {
      // eslint-disable-next-line no-console
      console.timeEnd('init-frames');
      // eslint-disable-next-line no-console
      console.time('render-frames');
    }

    const framePattern = await renderFrames({
      outputDir: temp,
      frameFormat,
      frames,
      theme,
      onProgress: (p) => {
        if (log) {
          log(`render ${(100 * p).toFixed(0)}%`);
        }
      },
    });

    if (verbose) {
      // eslint-disable-next-line no-console
      console.timeEnd('render-frames');
      // eslint-disable-next-line no-console
      console.time('render-audio');
    }

    let concatAudioFile = audio;
    if (!audio && audioScenes.length === numberOfScenes) {
      concatAudioFile = await renderAudio({
        log,
        audioScenes,
        outputDir: temp,
        fileName: 'audioConcat.mp3',
      });
    }

    if (verbose) {
      // eslint-disable-next-line no-console
      console.timeEnd('render-audio');
      // eslint-disable-next-line no-console
      console.time('transcode-video');
    }

    await transcodeVideo({
      args,
      log,
      framePattern,
      frameFormat,
      audio: concatAudioFile,
      output,
      theme,
      verbose,
      onProgress: (p) => {
        if (log) {
          log(`transcode ${(100 * p).toFixed(0)}%`);
        }
      },
    });

    if (verbose) {
      // eslint-disable-next-line no-console
      console.timeEnd('transcode-video');
    }
  } catch (err) {
    if (cleanupFrames) {
      rmrf(temp);
    }
    if (verbose) {
      // eslint-disable-next-line no-console
      console.timeEnd('ffmpeg-concat');
    }
    throw err;
  }

  if (cleanupFrames && !tempDir) {
    rmrf(temp);
  }

  if (verbose) {
    // eslint-disable-next-line no-console
    console.timeEnd('ffmpeg-concat');
  }
};

export default concat;

export { default as transitions } from 'gl-transitions';
