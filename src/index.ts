/* eslint-disable sonarjs/no-duplicate-string */
import type { ConcatOptions } from './types/index.js';
import fs from 'fs-extra';
import rmfr from 'rmfr';
import { temporaryDirectory } from 'tempy';
import { initFrames } from './helpers/init-frames.js';
import { renderFrames } from './helpers/render-frames.js';
import { transcodeVideo } from './helpers/transcode-video.js';
import { renderAudio } from './helpers/render-audio.js';

// eslint-disable-next-line no-empty-function
const noop = () => {};

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

  const temp = tempDir || temporaryDirectory();

  console.time('ffmpeg-concat');

  try {
    console.time('init-frames');
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
    console.timeEnd('init-frames');

    console.time('render-frames');
    const framePattern = await renderFrames({
      outputDir: temp,
      frameFormat,
      frames,
      theme,
      onProgress: (p) => {
        log(`render ${(100 * p).toFixed(0)}%`);
      },
    });
    console.timeEnd('render-frames');

    console.time('render-audio');
    let concatAudioFile = audio;
    if (!audio && scenes.filter((s) => s.sourceAudioPath).length === scenes.length) {
      concatAudioFile = await renderAudio({
        log,
        scenes,
        outputDir: temp,
        fileName: 'audioConcat.mp3',
      });
    }
    console.timeEnd('render-audio');

    console.time('transcode-video');

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
    console.timeEnd('transcode-video');
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

export { default as transitions } from './helpers/transitions-wrap.js';

// // RUN EXAMPLE

// import path from 'node:path';
// import { fileURLToPath } from 'node:url';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const getFile = (file: string) => path.join(__dirname, '..', '..', file);

// concat({
//   videos: [getFile('media/0.mp4'), getFile('media/0a.mp4'), getFile('media/1.mp4'), getFile('media/2.mp4')],
//   transition: { name: 'directionalwipe', duration: 500 },
//   output: './media/example.mp4',
// });
