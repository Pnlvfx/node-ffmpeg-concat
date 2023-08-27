/* eslint-disable import/no-unresolved */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable unicorn/explicit-length-check */
/* eslint-disable unicorn/prefer-number-properties */
import pMap from 'p-map';
import ffmpegProbe from 'ffmpeg-probe';
import path from 'node:path';
import fs from 'fs-extra';
import { extractVideoFrames } from './extract-video-frames.js';
import { InitFramesOptions, InitSceneOptions } from '../types';
import { extractAudio } from './extract-audio.js';

export const initFrames = async (opts: InitFramesOptions) => {
  const { transitions, videos, concurrency, frameFormat, log, outputDir, renderAudio, transition, verbose } = opts;

  if (transitions && videos.length - 1 !== transitions.length) {
    throw new Error('Number of transitions must equal number of videos minus one');
  }

  const scenes = await pMap(
    videos,
    (_, index) => {
      return initScene({
        log,
        index,
        videos,
        transition,
        transitions,
        frameFormat,
        outputDir,
        renderAudio,
        verbose,
      });
    },
    {
      concurrency,
    },
  );

  const { width, height, fps } = scenes[0];

  const frames = [];
  let numFrames = 0;

  for (const [index, scene] of scenes.entries()) {
    scene.frameStart = numFrames;

    scene.numFramesTransition = Math.floor((scene.transition.duration * fps) / 1000);
    scene.numFramesPreTransition = Math.max(0, scene.numFrames - scene.numFramesTransition);

    numFrames += scene.numFramesPreTransition;

    for (let frame = 0; frame < scene.numFrames; ++frame) {
      const cFrame = scene.frameStart + frame;

      if (!frames[cFrame]) {
        const next = frame < scene.numFramesPreTransition ? undefined : scenes[index + 1];

        frames[cFrame] = {
          current: scene,
          next,
        };
      }
    }
  }

  const duration = scenes.reduce((sum, scene) => scene.duration + sum - scene.transition.duration, 0);

  return {
    frames,
    scenes,
    theme: {
      numFrames,
      duration,
      width,
      height,
      fps,
    },
  };
};

export const initScene = async (opts: InitSceneOptions) => {
  const { frameFormat, index, log, outputDir, renderAudio, transition, transitions, verbose, videos } = opts;

  const video = videos[index];
  const probe = await ffmpegProbe(video);
  const format = (probe.format && probe.format.format_name) || 'unknown';

  if (!probe.streams || !probe.streams.at(0)) throw new Error(`Unsupported input video format "${format}": ${video}`);

  const scene = {
    video,
    index,
    width: probe.width,
    height: probe.height,
    duration: probe.duration,
    numFrames: parseInt(probe.streams[0].nb_frames),
    fps: probe.fps,
  };

  if (isNaN(scene.numFrames) || isNaN(scene.duration)) throw new Error(`Unsupported input video format "${format}": ${video}`);

  if (verbose) {
    console.error(scene);
  }

  const t = transitions ? transitions[index] : transition;
  scene.transition = {
    name: 'fade',
    duration: 500,
    params: {},
    ...t,
  };

  if (index >= videos.length - 1) {
    scene.transition.duration = 0;
  }

  const fileNamePattern = `scene-${index}-%012d.${frameFormat}`;
  const audioFileName = `scene-${index}.mp3`;
  const framePattern = path.join(outputDir, fileNamePattern);
  const audioPath = path.join(outputDir, audioFileName);
  await extractVideoFrames({
    videoPath: scene.video,
    framePattern,
    verbose,
  });

  scene.getFrame = (frame) => {
    return framePattern.replace('%012d', framePattern.padStart(12, '0'));
  };

  while (scene.numFrames > 0) {
    const frame = scene.getFrame(scene.numFrames - 1);
    const exists = await fs.pathExists(frame);

    if (exists) break;
    scene.numFrames--;
  }

  if (renderAudio && probe.streams && probe.streams.filter((s) => s.codec_type === 'audio').length) {
    const previousTransition = index > 0 && transitions ? transitions[index - 1] : transition;
    const previousTransitionDuration = index === 0 ? 0 : previousTransition.duration || 500;

    await extractAudio({
      log,
      videoPath: scene.video,
      outputFileName: audioPath,
      start: previousTransitionDuration / 2000,
      duration: scene.duration / 1000 - previousTransitionDuration / 2000 - scene.transition.duration / 2000,
    });
    scene.sourceAudioPath = audioPath;
  }

  return scene;
};
