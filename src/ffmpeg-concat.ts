import type { ConcatOptions } from './types/ffmpeg-concat.js';
import fs from 'fs-extra';
import { temporaryDirectory } from 'tempy';
import { initFrames } from './helpers/init-frames.js';
import { renderFrames } from './helpers/render-frames.js';
import { transcodeVideo } from './helpers/transcode-video.js';
import { renderAudio } from './helpers/render-audio.js';
import rmrf from 'rmrf';

// eslint-disable-next-line no-empty-function
const noop = () => {};

// eslint-disable-next-line sonarjs/cognitive-complexity
const concat = async (opts: ConcatOptions) => {
  const {
    args,
    log = noop,
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
  } = opts;

  if (tempDir) {
    fs.ensureDirSync(tempDir);
  }

  const temp = tempDir ?? temporaryDirectory();

  if (verbose) {
    // eslint-disable-next-line no-console
    console.time('ffmpeg-concat');
  }

  try {
    if (verbose) {
      // eslint-disable-next-line no-console
      console.time('init-frames');
    }
    const { frames, scenes, theme } = await initFrames({
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
        log(`render ${(100 * p).toFixed(0)}%`);
      },
    });

    if (verbose) {
      // eslint-disable-next-line no-console
      console.timeEnd('render-frames');
      // eslint-disable-next-line no-console
      console.time('render-audio');
    }

    let concatAudioFile = audio;
    if (!audio && scenes.filter((s) => s.sourceAudioPath).length === scenes.length) {
      concatAudioFile = await renderAudio({
        log,
        scenes,
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
        log(`transcode ${(100 * p).toFixed(0)}%`);
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

export { default as transitions, type GLTransition } from 'gl-transitions';
export type { ConcatOptions, ExtractAudioOpts, FrameFormat, InitFramesOptions, InitSceneOptions, Log, Transition } from './types/ffmpeg-concat.js';
