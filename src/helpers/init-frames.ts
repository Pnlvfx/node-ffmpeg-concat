import type { InitFramesOptions, InitSceneOptions, TransitionInput } from '../types/ffmpeg-concat.js';
import ffmpeg from 'async-ffmpeg';
import fs from 'node:fs/promises';
import path from 'node:path';
import pMap from 'p-map';
import { extractVideoFrames } from './extract-video-frames.js';
import { extractAudio } from './extract-audio.js';

export type Frame = Awaited<ReturnType<typeof initFrames>>['frames'][0];

export const initFrames = async ({
  concurrency,
  videos,
  transition,
  transitions,
  frameFormat,
  outputDir,
  renderAudio = false,
  verbose,
  // eslint-disable-next-line sonarjs/cognitive-complexity
}: InitFramesOptions) => {
  if (transitions && videos.length - 1 !== transitions.length) {
    throw new Error('Number of transitions must equal number of videos minus one');
  }

  const scenes = await pMap(
    videos,
    (video, index) =>
      initScene({
        video,
        index,
        videos,
        transition,
        transitions,
        frameFormat,
        outputDir,
        renderAudio,
        verbose,
      }),
    {
      concurrency,
    },
  );

  const sceneInit = scenes.at(0);
  if (!sceneInit) throw new Error('No scenes found!');

  const frames = [];
  let numFrames = 0;

  for (const [index, scene] of scenes.entries()) {
    const frameStart = numFrames;
    const numFramesTransition = Math.floor((scene.transition.duration * sceneInit.fps) / 1000);
    const numFramesPreTransition = Math.max(0, scene.numFrames - numFramesTransition);
    numFrames += numFramesPreTransition;

    for (let frame = 0; frame < scene.numFrames; ++frame) {
      const cFrame = frameStart + frame;

      if (!frames[cFrame]) {
        const current = Object.assign(scene, { frameStart, numFramesTransition, numFramesPreTransition });
        const next = frame < numFramesPreTransition ? undefined : (scenes[index + 1] as typeof current);
        frames[cFrame] = {
          current,
          next,
        };
      }
    }
  }

  const duration = scenes.reduce((sum, scene) => scene.duration + sum - scene.transition.duration, 0);

  const audioScenes = [];

  for (const sc of scenes) {
    if (sc.sourceAudioPath) {
      audioScenes.push(sc.sourceAudioPath);
    }
  }

  return {
    frames,
    numberOfScenes: scenes.length,
    audioScenes,
    theme: {
      numFrames,
      duration,
      width: sceneInit.width,
      height: sceneInit.height,
      fps: sceneInit.fps,
    },
  };
};

// eslint-disable-next-line sonarjs/cognitive-complexity
const initScene = async ({ frameFormat, index, outputDir, renderAudio, transition, transitions, verbose, videos, video }: InitSceneOptions) => {
  const probe = await ffmpeg.ffprobe(video);
  const format = probe.format.format_name ?? 'unknown';
  const videoStream = probe.streams.at(0);
  if (!videoStream) throw new Error(`Unsupported input video format "${format}": ${video}`);
  if (!videoStream.width || !videoStream.height || !videoStream.duration || !videoStream.nb_frames || !videoStream.avg_frame_rate) {
    throw new Error('Invalid input video, probably it is corrupt!');
  }
  const framePattern = path.join(outputDir, `scene-${index.toString()}-%012d.${frameFormat}`);
  const audioPath = path.join(outputDir, `scene-${index.toString()}.mp3`);
  const t = transitions ? transitions.at(index) : transition;

  const scene = {
    video,
    index,
    width: videoStream.width,
    height: videoStream.height,
    duration: Number.parseFloat(videoStream.duration) * 1000,
    numFrames: Number.parseInt(videoStream.nb_frames),
    fps: Number.parseFloat(videoStream.avg_frame_rate),
    transition: {
      name: 'fade',
      duration: 500,
      params: {},
      ...t,
    } as TransitionInput,
    getFrame: (frame: number) => framePattern.replace('%012d', frame.toString().padStart(12, '0')),
  };

  if (Number.isNaN(scene.numFrames) || Number.isNaN(scene.duration)) throw new Error(`Unsupported input video format "${format}": ${video}`);

  if (verbose) {
    // eslint-disable-next-line no-console
    console.error(scene);
  }

  if (index >= videos.length - 1) {
    scene.transition.duration = 0;
  }

  await extractVideoFrames({
    videoPath: video,
    framePattern,
    verbose,
  });

  while (scene.numFrames > 0) {
    const frame = scene.getFrame(scene.numFrames - 1);
    try {
      await fs.access(frame);
      break;
    } catch {
      scene.numFrames--;
    }
  }

  let sourceAudioPath;

  if (renderAudio && probe.streams.some((s) => s.codec_type === 'audio')) {
    const previousTransition = index > 0 && transitions ? transitions.at(index - 1) : transition;
    const previousTransitionDuration = index === 0 ? 0 : (previousTransition?.duration ?? 500);

    await extractAudio({
      videoPath: scene.video,
      outputFileName: audioPath,
      start: previousTransitionDuration / 2000,
      duration: scene.duration / 1000 - previousTransitionDuration / 2000 - scene.transition.duration / 2000,
      debug: verbose,
    });

    sourceAudioPath = audioPath;
  }

  return { ...scene, sourceAudioPath };
};
