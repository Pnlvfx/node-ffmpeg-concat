import type { DefaultParams, TransitionName } from './transition.js';

export type FrameFormat = 'jpg' | 'png' | 'raw' | undefined;

export type Log = ((stdout?: string) => void) | undefined;

export interface ConcatOptions {
  audio?: string;
  cleanupFrames?: boolean;
  concurrency?: number;
  frameFormat?: FrameFormat;
  log?: Log;
  output: string;
  tempDir?: string;
  transition?: Transition;
  transitions?: readonly Transition[];
  videos: readonly string[];
  verbose?: boolean;
  args?: string[];
}

export interface Transition {
  duration: number;
  name: TransitionName;
  params?: DefaultParams;
}

export interface ExtractAudioOpts {
  videoPath: string;
  outputFileName: string;
  start: number;
  duration: number;
}

export interface InitFramesOptions extends Omit<InitSceneOptions, 'index' | 'video'> {
  concurrency?: number;
}

export interface InitSceneOptions {
  index: number;
  video: string;
  videos: readonly string[];
  transition?: Transition;
  transitions?: readonly Transition[];
  frameFormat: FrameFormat;
  outputDir: string;
  renderAudio: boolean;
  verbose?: boolean;
}
