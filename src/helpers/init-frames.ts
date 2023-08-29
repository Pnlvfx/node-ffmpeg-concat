/* eslint-disable unicorn/explicit-length-check */
/* eslint-disable unicorn/no-array-reduce */
/* eslint-disable sonarjs/cognitive-complexity */
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs-extra';
import path from 'node:path';
import pMap from 'p-map';
import { InitFramesOptions, InitSceneOptions } from '../types';
import { extractVideoFrames } from './extract-video-frames.js';
import { extractAudio } from './extract-audio.js';
import { InitialScene, Scene } from '../types/internal';

export const initFrames = async (opts: InitFramesOptions) => {
  const { concurrency, log, videos, transition, transitions, frameFormat, outputDir, renderAudio = false, verbose } = opts;

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

    if (!scene.transition) {
      throw new Error(`Missing transition on this scene: ${scene}`);
    }

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

  const duration = scenes.reduce((sum, scene) => {
    if (!scene.transition) throw new Error('No transition found!');
    return scene.duration + sum - scene.transition.duration;
  }, 0);

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

const initScene = async (opts: InitSceneOptions) => {
  const { frameFormat, index, log, outputDir, renderAudio, transition, transitions, verbose, videos } = opts;

  const video = videos.at(index);
  if (!video) throw new Error('Error at init-frames');
  const probe = await ffprobeAsync(video);

  const format = probe.format.format_name || 'unknown';

  const videoStream = probe.streams.at(0);

  if (!probe.streams || !videoStream) throw new Error(`Unsupported input video format "${format}": ${video}`);

  if (!videoStream.width || !videoStream.height || !videoStream.duration || !videoStream.nb_frames || !videoStream.avg_frame_rate)
    throw new Error('Invalid input video, probably it is corrupt!');

  const durationInSeconds = Number.parseFloat(videoStream.duration);
  const numFrames = Number.parseInt(videoStream.nb_frames);
  const fps = Number.parseFloat(videoStream.avg_frame_rate);

  if (Number.isNaN(durationInSeconds) || Number.isNaN(numFrames) || Number.isNaN(fps)) throw new Error('Invalid input video, probably it is corrupt');

  const scene: InitialScene & Partial<Scene> = {
    video,
    index,
    width: videoStream.width,
    height: videoStream.height,
    duration: durationInSeconds * 1000,
    numFrames,
    fps,
  };

  if (Number.isNaN(scene.numFrames) || Number.isNaN(scene.duration)) throw new Error(`Unsupported input video format "${format}": ${video}`);

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
    return framePattern.replace('%012d', frame.toString().padStart(12, '0'));
  };

  while (scene.numFrames > 0) {
    const frame = scene.getFrame(scene.numFrames - 1);
    const exists = await fs.pathExists(frame);

    if (exists) break;
    scene.numFrames--;
  }

  if (renderAudio && probe.streams && probe.streams.filter((s) => s.codec_type === 'audio').length) {
    const previousTransition = index > 0 && transitions ? transitions.at(index - 1) : transition;
    const previousTransitionDuration = index === 0 ? 0 : previousTransition?.duration || 500;

    await extractAudio({
      log,
      videoPath: scene.video,
      outputFileName: audioPath,
      start: previousTransitionDuration / 2000,
      duration: scene.duration / 1000 - previousTransitionDuration / 2000 - scene.transition.duration / 2000,
    });
    scene.sourceAudioPath = audioPath;
  }

  return scene as Scene;
};

const ffprobeAsync = (file: string) => {
  return new Promise<ffmpeg.FfprobeData>((resolve, reject) => {
    ffmpeg.ffprobe(file, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
};
