import fs from 'fs-extra';
import path from 'path';
import rmfr from 'rmfr';
import tempy from 'tempy';
import { ConcatOptions } from './types';
import { initFrames } from './helpers/init-frames.js';
import { renderFrames } from './helpers/render-frames.js';
import { transcodeVideo } from './helpers/transcode-video.js';
import { renderAudio } from './helpers/render-audio.js';


const noop = () => { };

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

  const temp = tempDir || tempy.directory();

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
    const framePattern = await renderFrames({
      log,
      concurrency,
      outputDir: temp,
      frameFormat,
      frames,
      theme,
      onProgress: (p) => {
        log(`render ${(100 * p).toFixed()}%`)
      }
    })
    console.timeEnd('render-frames')

    console.time('render-audio')
    let concatAudioFile = audio;
    if (!audio && scenes.filter((s) => s.sourceAudioPath).length === scenes.length) {
      concatAudioFile = await renderAudio({
        log,
        scenes,
        outputDir: temp,
        fileName: 'audioConcat.mp3'
      })
    }
    console.timeEnd('render-audio')

    console.time('transcode-video')

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
        log(`transcode ${(100 * p).toFixed()}%`)
      }
    })
    console.timeEnd('transcode-video')
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
