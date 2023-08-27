/* eslint-disable import/no-unresolved */
/* eslint-disable sonarjs/no-duplicate-string */
import { ConcatOptions } from './types';
import fs from 'fs-extra';
import { initFrames } from './helpers/init-frames.js';
import path from 'path';
import rmfr from 'rmfr';
import { renderFrames } from './helpers/render-frames.js';
import { temporaryDirectory, temporaryFile } from 'tempy';

const noop = () => { };

const concat = async (opts: ConcatOptions) => {
  const {
    tempDir,
    output,
    videos,
    audio,
    cleanupFrames = true,
    concurrency = 4,
    frameFormat = 'raw',
    log = noop,
    transition,
    transitions,
    verbose = false,
  } = opts;

  if (tempDir) {
    fs.ensureDirSync(tempDir);
  }

  const temp = tempDir || temporaryDirectory();

  console.time('ffmpeg-concat');

  try {
    console.time('init-frames');
    const { frames, scenes, theme } = await initFrames({
      log,
      concurrency,
      videos,
      transition,
      transitions,
      outputDir: temp,
      frameFormat,
      renderAudio: !audio,
      verbose,
    });
    console.timeEnd('init-frames');

    console.time('render-frames');
    const framePatterns = await renderFrames({
      log,
      concurrency,
      outputDir: temp,
      frames,
      theme,
      onProgress: (p) => {
        log(`render ${(100 * p).toFixed()}%`)
      }
    })
    console.timeEnd('render-frames')

    // console.time('render-audio')

    console.log(frames, scenes, theme);
  } catch (err) {
    if (cleanupFrames) {
      await rmfr(temp);
    }
    console.timeEnd('ffmpeg-concat');
    throw err;
  }

  if (cleanupFrames && !tempDir) {
    await rmfr(temp);
  }

  console.timeEnd('ffmpeg-concat');
};

export default concat;

const getFile = (file: string) => path.join(process.cwd(), file);

const videos = [getFile('media/0.mp4'), getFile('media/0a.mp4'), getFile('media/1.mp4'), getFile('media/2.mp4')];

concat({ videos, output: temporaryFile({ extension: 'mp4' }), transition: { name: 'directionalWipe', duration: 500 } });
