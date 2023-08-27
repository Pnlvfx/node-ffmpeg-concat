/* eslint-disable import/no-unresolved */
/* eslint-disable sonarjs/no-duplicate-string */
import { ConcatOptions } from './types';
import fs from 'fs-extra';
import { initFrames } from './helpers/init-frames.js';
import path from 'path';
import rmfr from 'rmfr';
import { renderFrames } from './helpers/render-frames';

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

  const temp = tempDir || './media';

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

    })

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

concat({ videos, output: './media/temp.mp4', transition: { name: 'directionalWipe', duration: 500 } });
